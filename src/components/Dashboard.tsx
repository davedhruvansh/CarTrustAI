import React, { useState } from "react";
import { useCarTrust } from "../context/CarTrustContext";
import { PlusCircle, Search, LogOut, ShieldAlert, Cpu, Calendar, IndianRupee, Trash2, ArrowUpRight, Gauge, CheckCircle2, AlertTriangle, FileSpreadsheet } from "lucide-react";
import { motion } from "motion/react";
import { Logo } from "./Logo";

export const Dashboard: React.FC = () => {
  const { user, reports, logout, setCurrentPage, setSelectedReport, deleteReport } = useCarTrust();
  const [search, setSearch] = useState("");
  const [filterRec, setFilterRec] = useState<string>("ALL");

  // Statistical calculations
  const totalReportsCount = reports.length;
  const avgTrustScore = totalReportsCount > 0 
    ? Math.round(reports.reduce((acc, r) => acc + r.trustScore, 0) / totalReportsCount)
    : 0;

  const buyCount = reports.filter(r => r.recommendation === "BUY").length;
  const negCount = reports.filter(r => r.recommendation === "NEGOTIATE").length;
  const avoidCount = reports.filter(r => r.recommendation === "AVOID").length;

  const filteredReports = reports.filter(report => {
    // Search query matches brand or model
    const query = `${report.vehicle.brand} ${report.vehicle.model} ${report.vehicle.location}`.toLowerCase();
    const searchMatch = query.includes(search.toLowerCase());
    
    // Status filters
    const filterMatch = filterRec === "ALL" || report.recommendation === filterRec;
    
    return searchMatch && filterMatch;
  });

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Excellent": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "Good": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "Risky": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      default: return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    }
  };

  const getRecBadge = (rec: string) => {
    switch (rec) {
      case "BUY":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> BUY
          </span>
        );
      case "NEGOTIATE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded bg-amber-500/10 border border-amber-500/25 text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" /> NEGOTIATE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded bg-rose-500/10 border border-rose-500/25 text-rose-400">
            <ShieldAlert className="w-3.5 h-3.5" /> AVOID
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen text-slate-100 bg-slate-950 flex flex-col relative overflow-hidden font-sans">
      {/* Visual glowing points */}
      <div className="absolute top-[5%] right-[10%] w-[400px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] left-[5%] w-[350px] h-[350px] bg-cyan-600/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Primary header bar */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo variant="square" className="w-8 h-8" />
            <span className="font-sans font-bold text-lg tracking-tight text-white select-none">
              CarTrust<span className="text-blue-500">AI</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 rounded border border-slate-800 bg-slate-900 ml-2 uppercase tracking-wide">
              Verify Desk
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs text-slate-300 font-semibold">{user?.displayName}</span>
              <span className="text-[10px] text-slate-500 font-mono">{user?.email}</span>
            </div>
            <button
              onClick={logout}
              className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Sign Out Session"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 relative z-10 space-y-10">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
              Welcome back, {user?.displayName}!
            </h1>
            <p className="text-slate-400 text-sm font-sans">
              Conduct instant automotive inspections, examine odometer anomalies, and predict servicing costs.
            </p>
          </div>
          
          <button
            onClick={() => setCurrentPage("analyze")}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2.5 transform hover:scale-[1.01] cursor-pointer"
          >
            <PlusCircle className="w-4.5 h-4.5" /> Analyze Used Car
          </button>
        </div>

        {/* Statistical Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm shadow-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-mono tracking-wider uppercase font-semibold">Active Verifications</span>
              <p className="text-3xl font-black text-white">{totalReportsCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm shadow-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-mono tracking-wider uppercase font-semibold">Average Trust score</span>
              <p className="text-3xl font-black text-blue-400">{avgTrustScore}%</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Gauge className="w-6 h-6" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm shadow-xl flex items-center justify-between md:col-span-2">
            <div className="space-y-1.5 w-full">
              <span className="text-xs text-slate-500 font-mono tracking-wider uppercase font-semibold">Report Recommendations</span>
              <div className="flex gap-4 mt-2">
                <div className="flex-1 px-3 py-1.5 bg-emerald-500/5 rounded-lg border border-emerald-500/10 text-center">
                  <span className="text-[10px] uppercase font-mono text-emerald-400 block font-semibold">BUY</span>
                  <span className="text-xl font-bold text-emerald-400">{buyCount}</span>
                </div>
                <div className="flex-1 px-3 py-1.5 bg-amber-500/5 rounded-lg border border-amber-500/10 text-center">
                  <span className="text-[10px] uppercase font-mono text-amber-400 block font-semibold">NEGOTIATE</span>
                  <span className="text-xl font-bold text-amber-400">{negCount}</span>
                </div>
                <div className="flex-1 px-3 py-1.5 bg-rose-500/5 rounded-lg border border-rose-500/10 text-center">
                  <span className="text-[10px] uppercase font-mono text-rose-400 block font-semibold">AVOID</span>
                  <span className="text-xl font-bold text-rose-400">{avoidCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard verification workspace */}
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-2xl relative">
          {/* Section banner matching layout rules */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-800/90 pb-6 mb-8">
            <div>
              <h3 className="text-lg font-bold text-white">Historical Evaluation Laboratory</h3>
              <p className="text-xs text-slate-400 mt-1">Filter, examine, or remove generated inspection sheets.</p>
            </div>

            {/* In-desk Filtering and search workspace */}
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
              {/* Search input field */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder="Search model, brand..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-60 bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/60"
                />
              </div>

              {/* Status filtering dropdown menu layout */}
              <select
                value={filterRec}
                onChange={(e) => setFilterRec(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Decisions</option>
                <option value="BUY">BUY Action</option>
                <option value="NEGOTIATE">NEGOTIATE Action</option>
                <option value="AVOID">AVOID Action</option>
              </select>
            </div>
          </div>

          {/* List display */}
          {filteredReports.length === 0 ? (
            <div className="py-16 text-center text-slate-400 font-sans max-w-md mx-auto space-y-4">
              <div className="mx-auto w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                <Cpu className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-bold text-white">No Automotive Records Found</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {reports.length === 0 
                  ? "Your inspection desk is beautifully calibrated. Get started by analyzing your first used car selection!"
                  : "No reports matched the specified filters. Try loosening or changing your filters."
                }
              </p>
              {reports.length === 0 && (
                <button
                  onClick={() => setCurrentPage("analyze")}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white transition-all shadow-[0_0_10px_rgba(37,99,235,0.3)] cursor-pointer"
                >
                  Verify First Selection
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((report) => (
                <motion.div
                  key={report.id}
                  whileHover={{ y: -3, borderColor: "rgba(37,99,235,0.25)" }}
                  className="p-5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-950 transition-all flex flex-col justify-between group shadow-lg"
                >
                  <div className="space-y-4">
                    {/* Model Details Title banner & Action details */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
                          {report.vehicle.brand}
                        </span>
                        <h4 className="text-base font-extrabold text-white tracking-tight mt-0.5">
                          {report.vehicle.model}
                        </h4>
                      </div>
                      
                      {/* Trust rating category and scores */}
                      <div className="text-right">
                        <div className="text-xl font-black text-blue-500">{report.trustScore}%</div>
                        <span className={`text-[9px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded border inline-block mt-1 ${getCategoryColor(report.trustCategory)}`}>
                          {report.trustCategory}
                        </span>
                      </div>
                    </div>

                    {/* Meta characteristics table */}
                    <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-slate-900/95 my-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-sans">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Year: {report.vehicle.year}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-sans">
                        <Gauge className="w-3.5 h-3.5" />
                        <span>{report.vehicle.kilometers.toLocaleString('en-IN')} km</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-sans">
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span>Price: ₹{report.vehicle.price.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                        {report.vehicle.fuelType} | {report.vehicle.transmission}
                      </div>
                    </div>

                    {/* Recommendation details */}
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[10px] text-slate-500 uppercase font-mono">Recommendation:</span>
                      {getRecBadge(report.recommendation)}
                    </div>
                  </div>

                  {/* Operational utility tray */}
                  <div className="flex gap-2.5 mt-5 border-t border-slate-900/90 pt-4 items-center">
                    <button
                      onClick={() => { setSelectedReport(report); setCurrentPage("results"); }}
                      className="flex-1 py-2 rounded-lg bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/25 transition-all text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      View Report <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    
                    <button
                      onClick={() => deleteReport(report.id)}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-rose-500/15 text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-500/25 transition-all cursor-pointer"
                      title="Erase Verification Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
