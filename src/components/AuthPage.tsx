import React, { useState } from "react";
import { useCarTrust } from "../context/CarTrustContext";
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  User as UserIcon,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Eye,
  EyeOff
} from "lucide-react";
import { motion } from "motion/react";
import { Logo } from "./Logo";

export const AuthPage: React.FC = () => {
  const {
    login,
    signup,
    error,
    clearError,
    setCurrentPage,
    loading
  } = useCarTrust();
  
  // Auth view mode state: "login" or "signup"
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  // Input states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Visual utility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);

  // Real-time password safety trackers
  const isMinLength = password.length >= 8;
  const isUpperCase = /[A-Z]/.test(password);
  const isLowerCase = /[a-z]/.test(password);
  const isNumber = /[0-9]/.test(password);
  
  // Password complexity list to prevent weak keys
  const isTooWeak = () => {
    const lowerPass = password.toLowerCase();
    const weakPasswords = ["password", "12345678", "abcdefgh", "qwertyui", "cartrust", "cartrust123", "admin123"];
    return weakPasswords.some(weak => lowerPass.includes(weak));
  };

  const isPasswordSecure = isMinLength && isUpperCase && isLowerCase && isNumber && !isTooWeak();
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  // Submit operations dispatcher
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLocalSuccess(null);
    clearError();

    // Check presence
    if (!email.trim() || !password) {
      setLocalError("Email and Password are required credentials.");
      return;
    }

    if (authMode === "signup") {
      // Sign-up parameter checks
      if (!username.trim()) {
        setLocalError("A Username is required for registration.");
        return;
      }

      if (username.trim().length < 3 || username.trim().length > 30) {
        setLocalError("Username must be between 3 and 30 characters.");
        return;
      }

      if (!/^[a-zA-Z0-9_.-]+$/.test(username.trim())) {
        setLocalError("Username can only contain alphanumeric characters, underscores, dots, or hyphens.");
        return;
      }

      if (!isPasswordSecure) {
        setLocalError("Password does not meet the specified security criteria.");
        return;
      }

      if (!passwordsMatch) {
        setLocalError("Passwords do not match.");
        return;
      }

      const ok = await signup(username.trim(), email.trim(), password, confirmPassword);
      if (ok) {
        setLocalSuccess("Account created successfully!");
        // Reset states
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      }
    } else {
      // Login flow
      const ok = await login(email.trim(), password);
      if (ok) {
        setLocalSuccess("Welcome back! Loading secure session...");
        setPassword("");
      }
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col relative overflow-hidden bg-radial from-slate-950 via-slate-900 to-black justify-center items-center px-4">
      {/* Ambient glassmorphic glowing orbs */}
      <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[350px] h-[350px] bg-cyan-600/15 blur-[100px] rounded-full pointer-events-none" />

      {/* Back button */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => { clearError(); setCurrentPage("landing"); }}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium cursor-pointer"
          id="btn-back-to-landing"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-slate-900/40 p-8 rounded-2xl border border-slate-800 backdrop-blur-md shadow-2xl relative"
        id="panel-auth-container"
      >
        <div className="absolute inset-0 bg-blue-500/5 hover:bg-blue-500/10 transition-all rounded-2xl pointer-events-none" />
        
        {/* Title logo branding */}
        <div className="flex flex-col items-center text-center justify-center mb-6">
          <Logo variant="square" className="w-12 h-12 mb-3" />
          <h2 className="font-sans font-extrabold text-2xl text-white">
            Secure Portal
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Certified Used Car Verification Laboratory Engine
          </p>
        </div>

        {/* SECURE VIEW TOGGLE */}
        <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-xl mb-6 border border-slate-850" id="tabs-auth-methods">
          <button
            onClick={() => {
              setAuthMode("login");
              setLocalError(null);
              setLocalSuccess(null);
              clearError();
            }}
            className={`py-2 px-3 text-xs font-semibold rounded-lg font-mono transition-all uppercase cursor-pointer ${
              authMode === "login" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                : "text-slate-400 hover:text-white"
            }`}
            id="btn-tab-signin"
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setAuthMode("signup");
              setLocalError(null);
              setLocalSuccess(null);
              clearError();
            }}
            className={`py-2 px-3 text-xs font-semibold rounded-lg font-mono transition-all uppercase cursor-pointer ${
              authMode === "signup" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                : "text-slate-400 hover:text-white"
            }`}
            id="btn-tab-signup"
          >
            Sign Up
          </button>
        </div>

        {/* Error Notification */}
        {(error || localError) && (
          <div className="mb-6 p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-start gap-2.5" id="alert-form-error">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-400" />
            <div>
              <span className="font-bold">Access Refused:</span> {error || localError}
            </div>
          </div>
        )}

        {/* Success Notification */}
        {localSuccess && (
          <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs flex items-start gap-2.5" id="alert-form-success">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-400" />
            <div>
              <span className="font-bold">Success:</span> {localSuccess}
            </div>
          </div>
        )}

        {/* AUTH FORM */}
        <form onSubmit={handleSubmit} className="space-y-4" id="form-credentials-auth">
          {authMode === "signup" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">Username</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="CoolDriver99"
                  value={username}
                  onChange={(e) => { setLocalError(null); setUsername(e.target.value); }}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-11 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-sans"
                  id="input-auth-username"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                placeholder="driver@cartrust.ai"
                value={email}
                onChange={(e) => { setLocalError(null); setEmail(e.target.value); }}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-11 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-sans"
                id="input-auth-email"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setLocalError(null); setPassword(e.target.value); }}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-12 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-mono"
                id="input-auth-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* REAL-TIME PASSWORD VISUAL SAFETY METERS */}
            {authMode === "signup" && password.length > 0 && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1.5 mt-1 font-mono text-[10px]">
                <div className="text-slate-400 font-bold uppercase tracking-wider text-[9px] mb-1 flex items-center justify-between">
                  <span>Cryptographic Checks</span>
                  <span className={isPasswordSecure ? "text-emerald-400" : "text-amber-400"}>
                    {isTooWeak() ? "Weak Phrase" : isPasswordSecure ? "Cryptographically Sound" : "Pending Check"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div className={`flex items-center gap-1 ${isMinLength ? "text-emerald-400" : "text-slate-500"}`}>
                    <span className="text-[11px] font-bold">{isMinLength ? "✓" : "○"}</span> At least 8 chars
                  </div>
                  <div className={`flex items-center gap-1 ${isUpperCase ? "text-emerald-400" : "text-slate-500"}`}>
                    <span className="text-[11px] font-bold">{isUpperCase ? "✓" : "○"}</span> 1 uppercase (A-Z)
                  </div>
                  <div className={`flex items-center gap-1 ${isLowerCase ? "text-emerald-400" : "text-slate-500"}`}>
                    <span className="text-[11px] font-bold">{isLowerCase ? "✓" : "○"}</span> 1 lowercase (a-z)
                  </div>
                  <div className={`flex items-center gap-1 ${isNumber ? "text-emerald-400" : "text-slate-500"}`}>
                    <span className="text-[11px] font-bold">{isNumber ? "✓" : "○"}</span> 1 decimal number
                  </div>
                </div>
              </div>
            )}
          </div>

          {authMode === "signup" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => { setLocalError(null); setConfirmPassword(e.target.value); }}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-12 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-mono"
                  id="input-auth-confirm-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password.length > 0 && confirmPassword.length > 0 && (
                <div className={`text-[10px] font-mono mt-1 ${passwordsMatch ? "text-emerald-400" : "text-rose-400"}`}>
                  {passwordsMatch ? "✓ Passwords match successfully" : "✗ Passwords do not match"}
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 transform hover:scale-[1.01]"
            id="btn-submit-auth"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Processing request...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> 
                {authMode === "login" ? "Secure Sign In" : "Register Profile"}
              </span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-5 border-t border-slate-800/80 text-center">
          <span className="inline-flex gap-1.5 items-center px-2.5 py-1 text-[9px] font-mono tracking-wider bg-slate-950 border border-slate-900 rounded-full text-slate-500 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            SECURED CRYPTOGRAPHIC PROTOCOLS
          </span>
        </div>

      </motion.div>
    </div>
  );
};
