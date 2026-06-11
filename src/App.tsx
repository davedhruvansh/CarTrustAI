import React from "react";
import { CarTrustProvider, useCarTrust } from "./context/CarTrustContext";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import { Dashboard } from "./components/Dashboard";
import { CarInputForm } from "./components/CarInputForm";
import { ResultDashboard } from "./components/ResultDashboard";
import { Cpu } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const MainAppContent: React.FC = () => {
  const { currentPage, setCurrentPage, user, token, loading, loadingMessage } = useCarTrust();

  // Route-Based Access Control (RBAC) & Session enforcement
  React.useEffect(() => {
    const isProtected = ["dashboard", "analyze", "results"].includes(currentPage);
    if (isProtected && !user && !token) {
      setCurrentPage("auth");
    }
  }, [currentPage, user, token, setCurrentPage]);

  // Network layer ping diagnostic helper
  React.useEffect(() => {
    console.log("[DIAGNOSTIC] Commencing network layer validation with endpoint `/api/health`...");
    fetch("/api/health")
      .then((res) => {
        console.log(`[DIAGNOSTIC] Health/Ping status: SUCCESS (${res.status} ${res.statusText})`);
        const headers: { [key: string]: string } = {};
        res.headers.forEach((val, key) => {
          headers[key] = val;
        });
        console.log("[DIAGNOSTIC] Connection Response Headers:", JSON.stringify(headers, null, 2));
      })
      .catch((err) => {
        console.error("[DIAGNOSTIC] Health/Ping connection error:", err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30 selection:text-white">
      {/* Dynamic App Pages with subtle smooth fade router transitions */}
      <div className="relative">
        {currentPage === "landing" && <LandingPage />}
        {currentPage === "auth" && <AuthPage />}
        {currentPage === "dashboard" && <Dashboard />}
        {currentPage === "analyze" && <CarInputForm />}
        {currentPage === "results" && <ResultDashboard />}
      </div>

      {/* Global Interactive High-Performance Loading Overlay Block */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-lg flex flex-col justify-center items-center z-50 text-center px-6"
          >
            <div className="relative w-24 h-24 flex items-center justify-center mb-6">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
              {/* Inner reverse rotating ring */}
              <div className="absolute inset-4 rounded-full border-4 border-cyan-500/10 border-b-cyan-400 animate-pulse duration-1000" />
              {/* Central Core */}
              <Cpu className="w-8 h-8 text-blue-400 absolute animate-pulse" />
            </div>

            <motion.h4
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-lg font-bold tracking-tight text-white mb-2"
            >
              Analyzing Vehicle Diagnostics
            </motion.h4>
            
            <p className="text-xs text-slate-400 font-mono max-w-sm leading-relaxed">
              {loadingMessage || "Please wait while CarTrust AI completes verification audits..."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <CarTrustProvider>
      <MainAppContent />
    </CarTrustProvider>
  );
}
