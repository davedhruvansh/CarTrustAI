import express from "express";
import path from "path";
import dotenv from "dotenv";
import crypto from "crypto";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import { readDB, writeDB } from "./server/db";
import { generateVerificationReport } from "./server/gemini";
import { findVehicleArchitecture } from "./server/architecture";
import { User, VehicleInput } from "./src/types";
import {
  hashPassword,
  verifyPassword,
  createSession,
  verifySession,
  terminateSession,
  generateAndSaveOTP,
  verifyOTP,
  logSecurityEvent,
  sanitizeInput
} from "./server/security";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust reverse proxy (Cloud Run load balancer) to ensure correct IP resolution and rate limiting
  app.set("trust proxy", 1);

  // Helmet production security headers configuration
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        connectSrc: ["'self'", "ws:", "wss:", "https:", "http:"],
        frameAncestors: [
          "'self'",
          "https://ai.studio",
          "https://*.google.com",
          "https://*.google",
          "https://*.aistudio.google",
          "https://*.run.app",
          "https://*.asia-east1.run.app",
          "https://*.*.run.app"
        ],
        frameSrc: [
          "'self'",
          "https://*.google.com",
          "https://*.google",
          "https://*.aistudio.google",
          "https://*.run.app"
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:", "referrer"],
      }
    },
    frameguard: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
  }));

  // Force removal of X-Frame-Options to prevent browser iframe blocks under Google AI Studio parent frame
  app.use((req, res, next) => {
    res.removeHeader("X-Frame-Options");
    next();
  });

  // Base rate limiters to prevent authentication brute forcing and API scraping
  const generalLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    limit: 300, // Limit each IP to 300 requests per 5 minutes
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again later." }
  });

  const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    limit: 25, // Limit to 25 registration/login attempts per 5 mins
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many authentication requests. Please try again in a few minutes." }
  });

  // Apply general rate limits to all api endpoints
  app.use("/api/", generalLimiter);

  // Simple ping check / health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Max payload size increase for image uploads (base64)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Recursively sanitize all json payload bodies to prevent XSS / Prototype pollution / Mongo Injection
  app.use("/api/", (req, res, next) => {
    if (req.body && typeof req.body === "object") {
      req.body = sanitizeInput(req.body);
    }
    next();
  });

  // Helper cookie parser
  function parseCookies(cookieStr?: string): { [key: string]: string } {
    const list: { [key: string]: string } = {};
    if (!cookieStr) return list;
    cookieStr.split(";").forEach(cookie => {
      const parts = cookie.split("=");
      const key = parts[0].trim();
      const value = parts.slice(1).join("=").trim();
      if (key) {
        list[key] = decodeURIComponent(value);
      }
    });
    return list;
  }

  // Secure session response generator: rotates session, sets secure cookie
  function sendSessionResponse(res: express.Response, user: any, ip: string, req: express.Request) {
    const session = createSession(user.uid, user.role || "user", ip, req.headers["user-agent"]);
    const isSecure = process.env.NODE_ENV === "production" || req.secure || req.headers["x-forwarded-proto"] === "https";
    
    res.cookie("cartrust_session", session.id, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax", // sameSite lax works safely inside iframes
      path: "/",
      maxAge: 60 * 60 * 1000 // 1 hour expiration
    });

    res.json({
      token: session.id,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.role || "user",
        phone: user.phone,
        createdAt: user.createdAt
      }
    });
  }

  // Session verification from headers or cookies
  function getUserFromRequest(req: express.Request): User | null {
    let token = "";
    
    // 1. Try reading the secure HTTPOnly Session cookie
    if (req.headers.cookie) {
      const cookies = parseCookies(req.headers.cookie);
      token = cookies["cartrust_session"] || "";
    }

    // 2. Fall back to authorization header for client compatibility
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) return null;

    const session = verifySession(token);
    if (!session) return null;

    const db = readDB();
    const user = db.users[session.userId];
    if (user) {
      return {
        uid: user.uid,
        email: user.email,
        username: user.username || user.displayName,
        displayName: user.displayName,
        role: user.role || "user",
        phone: user.phone,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      };
    }
    return null;
  }

  // API - Auth me query
  app.get("/api/auth/me", (req, res) => {
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: "Session expired." });
    }
    res.json({ user });
  });

  // API - Auth Register (Enhanced password security and inputs validation)
  app.post("/api/auth/register", authLimiter, (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All registration parameters are required." });
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    // 1. Username length & format check
    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      return res.status(400).json({ error: "Username must be between 3 and 30 characters." });
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
      return res.status(400).json({ error: "Username can only contain alphanumeric characters, underscores, dots, or hyphens." });
    }

    // 2. Email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ error: "A valid email address is required." });
    }

    // 3. Password rule checks
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long." });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ error: "Password must contain at least one uppercase letter." });
    }
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ error: "Password must contain at least one lowercase letter." });
    }
    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ error: "Password must contain at least one number." });
    }

    // Prevent weak passwords
    const lowerPass = password.toLowerCase();
    const weakPasswords = ["password", "12345678", "abcdefgh", "qwertyui", "cartrust", "cartrust123", "admin123"];
    if (weakPasswords.some(weak => lowerPass.includes(weak))) {
      return res.status(400).json({ error: "Password is too weak. Please choose a more complex combination." });
    }

    // 4. Confirm Password Match Check
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    const db = readDB();

    // Email already registered check
    const existingUserByEmail = Object.values(db.users).find(u => u.email.toLowerCase() === cleanEmail);
    if (existingUserByEmail) {
      return res.status(400).json({ error: "Email already registered." });
    }

    // Username already registered check
    const existingUserByUsername = Object.values(db.users).find(u => u.username && u.username.toLowerCase() === cleanUsername.toLowerCase());
    if (existingUserByUsername) {
      return res.status(400).json({ error: "Username is already taken." });
    }

    const uid = "usr_" + crypto.randomBytes(6).toString("hex");
    const isFirstUser = Object.keys(db.users).length === 0;

    const newUser = {
      uid,
      email: cleanEmail,
      username: cleanUsername,
      displayName: cleanUsername,
      role: (isFirstUser ? "admin" : "user") as "user" | "admin" | "guest",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      passwordHash: hashPassword(password)
    };

    db.users[uid] = newUser;
    writeDB(db);

    logSecurityEvent("USER_REGISTERED", `New account registered with email: ${cleanEmail}. Assigned role: ${newUser.role}`, uid, req.ip);
    sendSessionResponse(res, newUser, req.ip || "127.0.0.1", req);
  });

  // API - Auth Login (Enhanced logging, scrypt verification, rate-limiting, generic error messages)
  app.post("/api/auth/login", authLimiter, (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing login credentials." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = readDB();
    const user = Object.values(db.users).find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      logSecurityEvent("LOGIN_FAILED", `Failed password login attempt for non-existent email: ${cleanEmail}`, undefined, req.ip);
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      logSecurityEvent("LOGIN_FAILED", `Incorrect password login attempt for email: ${cleanEmail}`, user.uid, req.ip);
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Update Last Login
    user.lastLogin = new Date().toISOString();
    writeDB(db);

    logSecurityEvent("LOGIN_SUCCESS", `User ${cleanEmail} logged in successfully via credentials.`, user.uid, req.ip);
    sendSessionResponse(res, user, req.ip || "127.0.0.1", req);
  });

  // API - Secure HTTP Logout
  app.post("/api/auth/logout", (req, res) => {
    let token = "";
    if (req.headers.cookie) {
      const cookies = parseCookies(req.headers.cookie);
      token = cookies["cartrust_session"] || "";
    }

    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (token) {
      terminateSession(token);
    }

    res.clearCookie("cartrust_session", { path: "/" });
    res.json({ success: true, message: "Logged out and deleted session securely." });
  });

  // API - Client security logging channel (OWASP auditable action)
  app.post("/api/auth/log-security-event", (req, res) => {
    const { event, details } = req.body;
    if (event) {
      logSecurityEvent(
        sanitizeInput(event), 
        details ? sanitizeInput(details) : "No extra event details supplied.", 
        undefined, 
        req.ip
      );
    }
    res.json({ success: true });
  });

  // API - Get Custom Vehicle Architecture Intelligence

  app.get("/api/architecture", (req, res) => {
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized session or expired token." });
    }

    const { brand, model, year, fuelType, transmission } = req.query;
    if (!brand || !model || !year) {
      return res.status(400).json({ error: "Missing required parameters: brand, model, year" });
    }

    const yearParsed = parseInt(year as string) || new Date().getFullYear();
    const info = findVehicleArchitecture(
      brand as string,
      model as string,
      yearParsed,
      (fuelType as string) || "Petrol",
      (transmission as string) || "Automatic"
    );

    res.json(info);
  });

  // API - Get Car Verification Reports History
  app.get("/api/reports", (req, res) => {
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const db = readDB();
    const reports = Object.values(db.reports)
      .filter(r => r.userId === user.uid)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ reports });
  });

  // API - Analyze Vehicle Report creation
  app.post("/api/reports/analyze", async (req, res) => {
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { vehicle, images } = req.body;
    if (!vehicle) {
      return res.status(400).json({ error: "Missing vehicle input information" });
    }

    const vehInput: VehicleInput = {
      brand: vehicle.brand || "",
      model: vehicle.model || "",
      year: parseInt(vehicle.year) || new Date().getFullYear(),
      kilometers: parseInt(vehicle.kilometers) || 0,
      fuelType: vehicle.fuelType || "Petrol",
      transmission: vehicle.transmission || "Automatic",
      ownerCount: parseInt(vehicle.ownerCount) || 1,
      price: parseFloat(vehicle.price) || 0,
      location: vehicle.location || "Unknown"
    };

    try {
      console.log(`Starting CarTrust AI processing for ${vehInput.brand} ${vehInput.model}...`);
      const report = await generateVerificationReport(vehInput, images || {});
      report.userId = user.uid;

      // Persist values in the custom physical database schemas:
      const db = readDB();
      const reportId = report.id;

      // 1. Write 'reports' entity
      db.reports[reportId] = report;

      // 2. Write 'vehicles' entity reference
      db.vehicles[reportId] = {
        id: "veh_" + Math.random().toString(36).substring(2, 11),
        reportId,
        ...vehInput
      };

      // 3. Write 'analysis' entity reference
      db.analysis[reportId] = {
        id: "an_" + Math.random().toString(36).substring(2, 11),
        reportId,
        trustScore: report.trustScore,
        condition: report.condition,
        fraudRisk: report.fraudRisk,
        priceValidation: report.priceValidation
      };

      // 4. Write 'uploads' entity references if base64 images exist
      db.uploads[reportId] = {
        id: "upl_" + Math.random().toString(36).substring(2, 11),
        reportId,
        hasFront: !!images?.front,
        hasBack: !!images?.back,
        hasSide: !!images?.side,
        hasInterior: !!images?.interior,
        createdAt: new Date().toISOString()
      };

      writeDB(db);
      res.json({ report });
    } catch (err: any) {
      console.error("Critical error in analysis endpoint:", err);
      res.status(500).json({ error: err.message || "Failed to analyze car details." });
    }
  });

  // API - Get single report details
  app.get("/api/reports/:id", (req, res) => {
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const db = readDB();
    const report = db.reports[req.params.id];
    if (!report) {
      return res.status(404).json({ error: "Verification report not found." });
    }

    if (report.userId !== user.uid) {
      return res.status(403).json({ error: "Forbidden access to this verification report." });
    }

    res.json({ report });
  });

  // API - Delete report
  app.delete("/api/reports/:id", (req, res) => {
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const db = readDB();
    const report = db.reports[req.params.id];
    if (!report) {
      return res.status(404).json({ error: "Verification report not found." });
    }

    if (report.userId !== user.uid) {
      return res.status(403).json({ error: "Forbidden access." });
    }

    // Clean up connections
    delete db.reports[req.params.id];
    delete db.vehicles[req.params.id];
    delete db.analysis[req.params.id];
    delete db.uploads[req.params.id];

    writeDB(db);
    res.json({ success: true });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CarTrust AI Backend listening of port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Express startup crashed:", err);
});
