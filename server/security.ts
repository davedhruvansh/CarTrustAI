import crypto from "crypto";
import { readDB, writeDB } from "./db";
import { User } from "../src/types";

// Types for sessions, OTPs and Security logs
export interface Session {
  id: string; // Token
  userId: string;
  role: "user" | "admin" | "guest";
  expiresAt: string;
  ip: string;
  userAgent?: string;
  createdAt: string;
}

export interface OTPRecord {
  target: string;
  type: "email" | "phone";
  otp: string;
  expiresAt: string;
  attempts: number;
  lastSentAt: string;
  sentTimes: number[];
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: string;
  details: string;
  userId?: string;
  ip?: string;
}

/**
 * 1. PASSWORD HASHING (OWASP Modern Standard using scrypt)
 * Password hashing format: scrypt$salt$hash (fully self-contained)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  // Recommended parameters for scrypt: N=16384, r=8, p=1, keylen=64
  const derivedKey = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
}

export function verifyPassword(password: string, hashedPasswordAndSalt: string): boolean {
  try {
    if (!hashedPasswordAndSalt.startsWith("scrypt$")) {
      // Handle legacy cleartext fallback gracefully during upgrade
      return password === hashedPasswordAndSalt;
    }
    const parts = hashedPasswordAndSalt.split("$");
    if (parts.length !== 3) return false;
    const [, salt, originalHash] = parts;
    const derivedKey = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
    return crypto.timingSafeEqual(derivedKey, Buffer.from(originalHash, "hex"));
  } catch (err) {
    console.error("Cryptographic verification error:", err);
    return false;
  }
}

/**
 * 2. SECURE SESSIONS MANAGEMENT
 * Stores sessions securely in the DB and manages rotation, verification, and expiration
 */
const SESSION_EXPIRY_MS = 60 * 60 * 1000; // 1 Hour session lifetime

export function createSession(userId: string, role: "user" | "admin" | "guest", ip: string, userAgent?: string): Session {
  const db = readDB() as any;
  if (!db.sessions) db.sessions = {};

  // Invalidate any old session for security (Session Rotation & Limit 1 concurrent session per user)
  if (db.sessions) {
    Object.keys(db.sessions).forEach((sid) => {
      if (db.sessions[sid].userId === userId) {
        delete db.sessions[sid];
      }
    });
  }

  const sessionId = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_MS).toISOString();

  const session: Session = {
    id: sessionId,
    userId,
    role,
    expiresAt,
    ip,
    userAgent,
    createdAt: new Date().toISOString()
  };

  db.sessions[sessionId] = session;
  writeDB(db);

  logSecurityEvent("SESSION_CREATED", `Session created for user ${userId} with role ${role}`, userId, ip);
  return session;
}

export function verifySession(sessionId: string): Session | null {
  const db = readDB() as any;
  if (!db.sessions || !db.sessions[sessionId]) return null;

  const session = db.sessions[sessionId] as Session;
  const isExpired = new Date(session.expiresAt).getTime() < Date.now();

  if (isExpired) {
    delete db.sessions[sessionId];
    writeDB(db);
    logSecurityEvent("SESSION_EXPIRED", `Session ${sessionId.substring(0, 8)}... automatically expired.`, session.userId, session.ip);
    return null;
  }

  // Extend session on active interaction (Sliding Expiry Window)
  session.expiresAt = new Date(Date.now() + SESSION_EXPIRY_MS).toISOString();
  db.sessions[sessionId] = session;
  writeDB(db);

  return session;
}

export function terminateSession(sessionId: string): void {
  const db = readDB() as any;
  if (db.sessions && db.sessions[sessionId]) {
    const session = db.sessions[sessionId];
    delete db.sessions[sessionId];
    writeDB(db);
    logSecurityEvent("SESSION_TERMINATED", `Session terminated (explicit logout).`, session.userId, session.ip);
  }
}

/**
 * 3. PASWORDLESS LOGIN + OTP MANAGEMENT
 * OTP requirements: 5 min expiry, 1-shot use, max 5 verification attempts, max 3 OTP requests / 15 mins
 */
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 Minutes
const MAX_OTP_ATTEMPTS = 5; // User requested: "Maximum 5 verification attempts"

export function generateAndSaveOTP(target: string, type: "email" | "phone", ip: string): { success: boolean; otp?: string; error?: string } {
  const db = readDB() as any;
  if (!db.otps) db.otps = {};

  const cleanTarget = target.trim().toLowerCase();
  
  // Basic validation
  if (type === "email") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanTarget)) {
      logSecurityEvent("OTP_BAD_INPUT", `Invalid email validation format: ${target}`, undefined, ip);
      return { success: false, error: "Invalid email address format." };
    }
  } else {
    // Phone validation (numbers and optional + prefix, length 7 to 15)
    const cleanPhone = cleanTarget.replace(/\s+/g, "");
    if (!/^\+?[1-9]\d{6,14}$/.test(cleanPhone)) {
      logSecurityEvent("OTP_BAD_INPUT", `Invalid phone validation format: ${target}`, undefined, ip);
      return { success: false, error: "Invalid phone number formatting (7 to 15 digits expected)." };
    }
  }

  const existing = db.otps[cleanTarget] as OTPRecord | undefined;
  let sentTimes = existing?.sentTimes || [];
  
  // Filter sentTimestamps in the last 15 minutes
  const now = Date.now();
  const fifteenMinsAgo = now - 15 * 60 * 1000;
  sentTimes = sentTimes.filter(t => t >= fifteenMinsAgo);

  if (sentTimes.length >= 3) {
    logSecurityEvent("OTP_RATE_LIMITED", `OTP rate-limit exceeded (3/15m) for ${cleanTarget}`, undefined, ip);
    return { success: false, error: "Too many OTP requests. Maximum 3 OTP requests allowed per 15 minutes." };
  }

  // Cryptographically strong random 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(now + OTP_EXPIRY_MS).toISOString();

  sentTimes.push(now);

  db.otps[cleanTarget] = {
    target: cleanTarget,
    type,
    otp,
    expiresAt,
    attempts: 0,
    lastSentAt: new Date().toISOString(),
    sentTimes
  };

  writeDB(db);
  console.log(`[SECURE_OTP_GATEWAY] Send ${type.toUpperCase()} OTP [ ${otp} ] to: ${cleanTarget}`);
  logSecurityEvent("OTP_DISPATCHED", `Security code dispatched to ${type === "email" ? cleanTarget : cleanTarget.substring(0, 6) + "****"}`, undefined, ip);

  return { success: true, otp };
}

export function verifyOTP(target: string, inputOtp: string, ip: string): { success: boolean; error?: string } {
  const db = readDB() as any;
  if (!db.otps) return { success: false, error: "No active verification requests." };

  const cleanTarget = target.trim().toLowerCase();
  const record = db.otps[cleanTarget] as OTPRecord | undefined;

  if (!record) {
    logSecurityEvent("OTP_ATTEMPT_STALE", `Stale verify submit ${cleanTarget}`, undefined, ip);
    return { success: false, error: "No active OTP request. Please request a new code." };
  }

  // Check Expiry
  if (new Date(record.expiresAt).getTime() < Date.now()) {
    delete db.otps[cleanTarget];
    writeDB(db);
    logSecurityEvent("OTP_EXPIRED", `Expired verification submit for ${cleanTarget}`, undefined, ip);
    return { success: false, error: "OTP has expired. Please request a new one." };
  }

  // Increment failure attempt to head off Bruteforcing
  record.attempts += 1;
  db.otps[cleanTarget] = record;
  writeDB(db);

  if (record.attempts > MAX_OTP_ATTEMPTS) {
    delete db.otps[cleanTarget];
    writeDB(db);
    logSecurityEvent("OTP_LOCKOUT", `Target ${cleanTarget} locked out due to entry failures.`, undefined, ip);
    return { success: false, error: "Too many wrong attempts. This OTP is voided. Please request a new one." };
  }

  // Perform timing safe comparison
  const otpMatches = crypto.timingSafeEqual(
    Buffer.from(record.otp),
    Buffer.from(inputOtp.trim())
  );

  if (!otpMatches) {
    logSecurityEvent("OTP_FAILED_ATTEMPT", `Invalid code input for ${cleanTarget} (${record.attempts}/${MAX_OTP_ATTEMPTS})`, undefined, ip);
    return { success: false, error: `Incorrect security code. ${MAX_OTP_ATTEMPTS - record.attempts} attempts remaining.` };
  }

  // Valid OTP -> Purge record (One-time use safeguard)
  delete db.otps[cleanTarget];
  writeDB(db);

  logSecurityEvent("OTP_SUCCESS", `${record.type.toUpperCase()} ${cleanTarget} verified successfully.`, undefined, ip);
  return { success: true };
}

/**
 * 4. SYSTEM EVENT AUDIT LOGGER
 */
export function logSecurityEvent(event: string, details: string, userId?: string, ip?: string): void {
  try {
    const db = readDB() as any;
    if (!db.securityLogs) db.securityLogs = [];

    const log: SecurityLog = {
      id: "log_" + crypto.randomUUID().substring(0, 8),
      timestamp: new Date().toISOString(),
      event,
      details,
      userId,
      ip
    };

    db.securityLogs.push(log);
    
    // Cap logs at last 1000 items to prevent file system swelling
    if (db.securityLogs.length > 1000) {
      db.securityLogs.shift();
    }
    
    writeDB(db);
  } catch (err) {
    console.error("Failed writing system logs:", err);
  }
}

/**
 * 5. INPUT SANITIZATION (SSRF, XSS, & SQL/NoSQL Injection Prohibitions)
 */
export function sanitizeString(val: string): string {
  // Strip dangerous html blocks, injection elements
  return val
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "")
    .replace(/<\/?[^>]+(>|$)/g, "") // Strip HTML tags
    .replace(/[$\{\}]/g, "") // Prevent template attacks
    .trim();
}

export function sanitizeInput<T>(input: T): T {
  if (typeof input === "string") {
    return sanitizeString(input) as any;
  }
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item)) as any;
  }
  if (input !== null && typeof input === "object") {
    const sanitizedObj: any = {};
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        // Exclude base64 image fields from aggressive special character scrubbing but prevent XSS
        if (key === "front" || key === "back" || key === "side" || key === "interior") {
          sanitizedObj[key] = input[key]; // Keep raw base64 contents
        } else {
          sanitizedObj[key] = sanitizeInput(input[key]);
        }
      }
    }
    return sanitizedObj as T;
  }
  return input;
}
