import React from "react";
import { useCarTrust } from "../context/CarTrustContext";
import { ShieldCheck, Flame, Cpu, Gauge, TrendingUp, Sparkles, FileSearch, ArrowRight, UserCheck } from "lucide-react";
import { motion } from "motion/react";
import { Logo } from "./Logo";

export const LandingPage: React.FC = () => {
  const { setCurrentPage, setAuthMode, token } = useCarTrust();

  const features = [
    {
      icon: <ShieldCheck className="w-10 h-10 text-cyan-400" />,
      title: "Vehicle Trust Indexing",
      desc: "Instant 0-100 score composite mapping age, mileage, owner frequency, and pricing deviations to safeguard your equity."
    },
    {
      icon: <Cpu className="w-10 h-10 text-blue-400-accent text-blue-400" />,
      title: "Gemini Image Analysis",
      desc: "Multimodal damage detectors analyzing exterior frames, panels, and interior wear to flag scratches, dents, and underbody rust."
    },
    {
      icon: <Gauge className="w-10 h-10 text-emerald-400" />,
      title: "Odometer Rollback Guard",
      desc: "Checks average utilization intervals against chronological ages to catch odometer turn-backs and mileage scams."
    },
    {
      icon: <TrendingUp className="w-10 h-10 text-violet-400" />,
      title: "Market Price Validation",
      desc: "Compares listing pricing against accurate localized baseline ranges to determine if vehicles are bargains or overpriced."
    },
    {
      icon: <FileSearch className="w-10 h-10 text-rose-400" />,
      title: "Maintenance Cost Forecast",
      desc: "Predictive diagnostics outlining next 1-year and 3-year projected servicing outlays (oil, breaks, batteries, and tire sets)."
    },
    {
      icon: <Sparkles className="w-10 h-10 text-amber-300" />,
      title: "Procurement Rationale",
      desc: "Receive clear, concrete decisions (BUY, NEGOTIATE, AVOID) backed by AI-driven arguments tailored to the target asset."
    }
  ];

  const handleStart = () => {
    if (token) {
      setCurrentPage("dashboard");
    } else {
      setAuthMode("signup");
      setCurrentPage("auth");
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col relative overflow-hidden bg-radial from-slate-950 via-slate-900 to-black">
      {/* Background radial glow */}
      <div className="absolute top-[10%] left-[20%] w-[450px] h-[450px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] bg-cyan-600/15 blur-[100px] rounded-full pointer-events-none" />
      
      {/* Header bar */}
      <header className="border-b border-slate-800 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo variant="square" className="w-9 h-9" />
            <span className="font-sans font-bold text-xl tracking-tight text-white select-none">
              CarTrust<span className="text-blue-500">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {token ? (
              <button
                onClick={() => setCurrentPage("dashboard")}
                className="px-5 py-2 rounded-lg bg-blue-600 font-medium text-sm text-white hover:bg-blue-500 transition-all flex items-center gap-2 shadow-[0_0_12px_rgba(37,99,235,0.4)] cursor-pointer"
              >
                Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => { setAuthMode("login"); setCurrentPage("auth"); }}
                  className="text-slate-300 hover:text-white font-medium text-sm transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setAuthMode("signup"); setCurrentPage("auth"); }}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] cursor-pointer"
                >
                  Verify Now
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 flex flex-col items-center justify-center text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs text-blue-400 font-mono mb-6 uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen Used Car Inspections
          </div>
          
          <h1 className="font-sans font-extrabold text-5xl md:text-6xl tracking-tight text-white leading-tight mb-6">
            Verify Any Used Car Instantly with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 border-b-2 border-cyan-500/30">AI Trust Scoring</span>
          </h1>
          
          <p className="text-lg text-slate-300 mb-10 leading-relaxed font-sans max-w-2xl mx-auto">
            Upload custom vehicle characteristics, mileage metrics, and images. Our server-side Gemini models construct structured analytical profiles, checking price anomalies, mechanical outlays, and odometer rollback risk.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-16">
            <button
              onClick={handleStart}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-medium text-base text-white transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.5)] transform hover:scale-[1.02] cursor-pointer"
            >
              Start Free Car Analysis
              <ArrowRight className="w-5 h-5 animate-pulse" />
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700 font-medium text-slate-200 transition-all text-center backdrop-blur-sm cursor-pointer"
            >
              Explore Capabilities
            </a>
          </div>
        </motion.div>

        {/* Dashboard Preview Frame Mock */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/40 p-1.5 backdrop-blur-md shadow-2xl relative mb-24"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none rounded-2xl z-10" />
          <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800/40">
            {/* Window control banner */}
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/40" />
                <span className="w-3 h-3 rounded-full bg-amber-500/40" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/40" />
              </div>
              <span className="text-xs font-mono text-slate-500">https://cartrust.ai/analysis-workspace</span>
              <div className="w-12 h-1 bg-slate-800 rounded" />
            </div>
            
            {/* Render a gorgeous dashboard sample detail */}
            <div className="p-8 text-left grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
              <div className="space-y-4">
                <span className="text-xs text-blue-400 font-mono tracking-wider uppercase">Vitals Validation</span>
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-slate-400 text-xs">Trust Rating</h4>
                    <p className="text-3xl font-extrabold text-blue-500 mt-1">94%</p>
                  </div>
                  <div className="px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/30 text-xs font-medium text-blue-400">
                    EXCELLENT
                  </div>
                </div>
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                  <h4 className="text-slate-400 text-xs mb-2">Confidence Match</h4>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full w-11/12 bg-gradient-to-r from-blue-500 to-cyan-400" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <span className="text-xs text-rose-400 font-mono tracking-wider uppercase">Scam Deterrent</span>
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-300">Fraud Score</span>
                    <span className="text-xs font-medium text-emerald-400">Low Risk</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-2">12 / 100</div>
                  <p className="text-[11px] text-slate-400">All checks (mileage integrity, price bounds, owner cycle) flag secure.</p>
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-xs text-emerald-400 font-mono tracking-wider uppercase">Recommendation</span>
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 h-full flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-emerald-400 font-bold uppercase mb-1">RECOMMENDED BUY</div>
                    <p className="text-xs text-slate-300 leading-relaxed">Pricing matching 94% confidence relative to local trade standards. Great maintenance forecast.</p>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-4">Verified by Gemini Flash AI</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Section */}
        <section id="features" className="w-full py-16 border-t border-slate-800/80 relative">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-white mb-4">
              Comprehensive Analysis Pipeline
            </h2>
            <p className="text-slate-400 text-base font-sans leading-relaxed">
              CarTrust AI inspects physical details, age multipliers, and odometer metrics, processing complex scenarios to present clear, clean dashboards directly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6, borderColor: "rgba(37,99,235,0.4)" }}
                className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800/80 hover:bg-slate-900/60 transition-all text-left flex flex-col gap-4 backdrop-blur-sm shadow-lg group"
              >
                <div className="w-14 h-14 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600/15 group-hover:border-blue-500/30 transition-all">
                  {feat.icon}
                </div>
                <div>
                  <h3 className="font-sans font-bold text-lg text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="w-full mt-16 p-8 md:p-12 rounded-3xl border border-slate-800 bg-radial from-blue-950/20 via-slate-950/60 to-slate-950 relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-blue-600/10 blur-[60px] rounded-full pointer-events-none" />
          <div className="max-w-xl text-center md:text-left md:max-w-2xl flex flex-col md:flex-row items-center justify-between gap-8 py-4">
            <div className="space-y-3">
              <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                Inspect before you invest.
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed max-w-lg">
                Used car purchases are high risk. Generate an interactive diagnostic report, check repair predictions, and negotiate with absolute metrics.
              </p>
            </div>
            <button
              onClick={handleStart}
              className="px-6 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 whitespace-nowrap font-medium text-sm text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] flex items-center gap-2 transform hover:scale-[1.02] cursor-pointer"
            >
              Analyze Your Car <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      {/* Footer bar */}
      <footer className="border-t border-slate-800 bg-black/40 py-8 text-center text-slate-500 text-xs font-mono relative z-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo variant="monogram" className="w-5 h-5" />
            <span className="text-slate-400 font-sans font-semibold">CarTrust AI</span>
          </div>
          <p className="max-w-lg leading-relaxed text-slate-500 text-center md:text-right">
            Disclaimer: Predictions and trust scores are powered by intelligence estimates. Standard calculations do not declare authorized government registry validations. All trade recommendations are estimates.
          </p>
        </div>
      </footer>
    </div>
  );
};
