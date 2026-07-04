"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Search, Scale, Layers, FileText } from "lucide-react";

export default function DashboardShowcase() {
  const [activeTab, setActiveTab] = useState<number>(0);

  const tabs = [
    { name: "Ingestion Stream", icon: <Activity size={12} /> },
    { name: "Copilot Insights", icon: <Search size={12} /> },
    { name: "Compliance Check", icon: <Scale size={12} /> },
    { name: "Drift Diagnostics", icon: <Layers size={12} /> },
    { name: "Dossier File", icon: <FileText size={12} /> }
  ];

  // Auto switch tab every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % tabs.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-32 px-6 bg-[#080808] relative text-left">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#8b5cf6]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1200px] mx-auto space-y-16">
        
        {/* Title Block */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <span className="text-[10px] font-mono tracking-[0.2em] text-[#8b5cf6] uppercase block">Interactive System Interface</span>
          <h2 className="text-3xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">
            The Auditor Workspace
          </h2>
          <p className="text-xs text-[#cbd5e1]/60 leading-relaxed font-light">
            Observe the GuardianEye platform investigate transactions, analyze model drift performance parameters, verify guidelines, and export dossiers.
          </p>
        </div>

        {/* Tab selection links */}
        <div className="flex flex-wrap justify-center gap-2 max-w-[800px] mx-auto z-20 relative">
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-300 cursor-pointer ${
                activeTab === idx 
                  ? "bg-[#8b5cf6] text-white shadow-[0_0_15px_rgba(139,92,246,0.35)]" 
                  : "bg-[#101010] text-[#94a3b8] hover:text-[#f8fafc] border border-white/5"
              }`}
            >
              {tab.icon}
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Floating 3D Laptop container */}
        <div className="relative w-full max-w-[900px] mx-auto perspective-1000 z-20">
          
          {/* Shadow beneath floating laptop */}
          <div className="absolute -bottom-10 left-10 right-10 h-10 bg-black/60 rounded-full blur-2xl filter pointer-events-none" />

          {/* Screen Lid Wrapper with subtle tilt */}
          <motion.div
            initial={{ rotateX: 6, y: -10 }}
            animate={{ rotateX: 0, y: 0 }}
            className="w-full bg-[#121212] rounded-t-3xl border border-white/10 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative"
          >
            {/* Screen reflection glossy diagonal lines */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none rounded-t-2xl z-20" />

            {/* Display screen */}
            <div className="w-full aspect-[16/10] bg-[#050505] rounded-xl overflow-hidden border border-white/5 relative flex flex-col">
              
              {/* Top notch bar */}
              <div className="h-6 bg-[#0a0a0a] border-b border-white/5 flex items-center px-4 justify-between select-none">
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                </div>
                <div className="text-[8px] font-mono text-white/30">guardianeye.bank.internal</div>
                <span className="w-3" />
              </div>

              {/* Dynamic screen views container */}
              <div className="flex-grow p-5 flex flex-col justify-between overflow-y-auto no-scrollbar font-sans text-left bg-gradient-to-b from-[#070707] to-[#050505]">
                
                <AnimatePresence mode="wait">
                  {/* VIEW 1: INGESTION MONITOR */}
                  {activeTab === 0 && (
                    <motion.div 
                      key="monitor"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4 h-full flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-[10px] font-mono font-bold text-white flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-ping" />
                          <span>REAL-TIME TRANSACTION STREAM</span>
                        </span>
                        <span className="text-[8px] font-mono text-white/30">MONITOR ACTIVE</span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: "AI RISK VERDICT", val: "HOLD ALERT", color: "text-[#ef4444]", border: "border-[#ef4444]/20" },
                          { label: "FRAUD SCORE", val: "96.8%", color: "text-[#8b5cf6]", border: "border-[#8b5cf6]/20" },
                          { label: "ANOMALY INDEX", val: "78.5%", color: "text-[#00e5ff]", border: "border-[#00e5ff]/20" },
                          { label: "RULES BREACHED", val: "2 Rules", color: "text-orange-500", border: "border-orange-500/20" }
                        ].map((item, idx) => (
                          <div key={idx} className={`p-3 rounded-xl bg-[#0a0a0a] border ${item.border} text-center`}>
                            <span className="text-[8px] font-mono text-[#94a3b8] block tracking-wider uppercase">{item.label}</span>
                            <span className={`text-base font-extrabold font-display ${item.color} mt-1 block`}>{item.val}</span>
                          </div>
                        ))}
                      </div>

                      {/* SVG Rate Chart */}
                      <div className="flex-grow bg-[#0a0a0a] rounded-xl border border-white/5 p-3 flex flex-col justify-between">
                        <div className="w-full h-[90px] relative">
                          <svg viewBox="0 0 400 100" className="w-full h-full">
                            <line x1="0" y1="20" x2="400" y2="20" stroke="#141414" strokeWidth="0.5" />
                            <line x1="0" y1="55" x2="400" y2="55" stroke="#141414" strokeWidth="0.5" />
                            <line x1="0" y1="85" x2="400" y2="85" stroke="#141414" strokeWidth="0.5" />

                            <motion.path
                              d="M0,85 L50,80 L100,50 L150,60 L200,88 L250,28 L300,12 L350,92 L400,18"
                              fill="none"
                              stroke="#8b5cf6"
                              strokeWidth="1.5"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 1.2, ease: "easeInOut" }}
                            />
                            <circle cx="300" cy="12" r="3" fill="#ef4444" />
                            <line x1="300" y1="12" x2="300" y2="100" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2,2" />
                          </svg>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* VIEW 2: COPILOT INSIGHTS */}
                  {activeTab === 1 && (
                    <motion.div 
                      key="copilot"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4 h-full flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-[10px] font-mono font-bold text-white flex items-center gap-2">
                          <Search size={12} className="text-[#3b82f6]" />
                          <span>COPILOT INTELLIGENCE ANALYSIS</span>
                        </span>
                      </div>

                      <div className="flex-grow space-y-3 font-mono text-[9px] text-[#cbd5e1] max-h-[160px] overflow-y-auto no-scrollbar py-2">
                        <div className="bg-[#0a0a0a] p-2.5 rounded-xl border border-white/5 max-w-[80%]">
                          <span className="text-[#3b82f6] font-bold block mb-1">Auditor Prompt:</span>
                          "Why was transaction TX-98412 flagged as high risk?"
                        </div>
                        <div className="bg-[#0a0a0a] p-2.5 rounded-xl border border-[#8b5cf6]/20 max-w-[90%] ml-auto text-right">
                          <span className="text-[#8b5cf6] font-bold block mb-1">GuardianEye Copilot:</span>
                          "Evaluation flagged a ₹82,000 spend amount representing a sudden 14.5x spending velocity deviation from standard baseline indices. Transaction originated from Singapore using unverified Safari browsers."
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* VIEW 3: COMPLIANCE CHECK */}
                  {activeTab === 2 && (
                    <motion.div 
                      key="compliance"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4 h-full flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-[10px] font-mono font-bold text-white flex items-center gap-2">
                          <Scale size={12} className="text-[#22c55e]" />
                          <span>REGULATORY COMPLIANCE MONITOR</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] font-mono">
                        <div className="p-3 rounded-xl bg-[#0a0a0a] border border-[#ef4444]/25 space-y-1">
                          <span className="font-bold text-[#ef4444] block">⚠️ RBI Section 7.2 Violation</span>
                          <p className="text-[#cbd5e1] leading-relaxed">
                            Card limit cap checks exceeded. High-value digital transactions processed on non-registered devices require multi-factor verification challenges.
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-[#0a0a0a] border border-[#22c55e]/25 space-y-1">
                          <span className="font-bold text-[#22c55e] block">🟢 AML SOP Compliance Pass</span>
                          <p className="text-[#cbd5e1] leading-relaxed">
                            No match detected in OFAC sanctions directories or internal blacklisted beneficiary account queues.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* VIEW 4: DRIFT DIAGNOSTICS */}
                  {activeTab === 3 && (
                    <motion.div 
                      key="drift"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4 h-full flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-[10px] font-mono font-bold text-white flex items-center gap-2">
                          <Layers size={12} className="text-[#00e5ff]" />
                          <span>COVARIATE FEATURE DRIFT STATUS</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] font-mono">
                        <div className="p-3 rounded-xl bg-[#0a0a0a] border border-white/5 space-y-1.5">
                          <span className="font-bold text-white block">Statistical Divergence</span>
                          <p className="text-[#cbd5e1]">
                            Drift index calculated using bootstrapped Population Stability Index (PSI) against reference baseline models.
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-[#0a0a0a] border border-white/5 space-y-2">
                          {[
                            { name: "amount", val: 85, color: "bg-[#ef4444]" },
                            { name: "velocity", val: 65, color: "bg-[#f97316]" }
                          ].map((item, idx) => (
                            <div key={idx} className="space-y-0.5">
                              <div className="flex justify-between text-[8px] text-[#cbd5e1]">
                                <span>{item.name}</span>
                                <span>PSI: 0.{item.val}</span>
                              </div>
                              <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* VIEW 5: DOSSIER FILE */}
                  {activeTab === 4 && (
                    <motion.div 
                      key="dossier"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4 h-full flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-[10px] font-mono font-bold text-white flex items-center gap-2">
                          <FileText size={12} className="text-[#22c55e]" />
                          <span>EXECUTIVE SAR DOSSIER PREVIEW</span>
                        </span>
                      </div>

                      <div className="p-3.5 bg-[#0a0a0a] rounded-xl border border-white/5 font-mono text-[8px] text-[#cbd5e1] leading-relaxed max-h-[140px] overflow-y-auto no-scrollbar">
                        <div>GUARDIANEYE CASE FILE: SAR-TX-98412</div>
                        <div>-------------------------------------------</div>
                        <div>VERDICT: 🔴 HOLD TRANSACTION & ESCALATE</div>
                        <div>REASONING: High geographic shift matching Singapore ATO cluster runs. Standard spending limits breached under RBI Sec 7.2.</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* Bottom status bar */}
              <div className="bg-[#0a0a0a] h-7 border-t border-white/5 flex items-center justify-between px-4 text-[9px] font-mono text-white/30">
                <span>SYSTEM HEALTH: ACTIVE</span>
                <span>SECURE: AES-256</span>
              </div>

            </div>
          </motion.div>

          {/* Laptop keyboard base projection */}
          <div className="h-4 bg-[#1a1a1a] rounded-b-2xl border-t border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.8)] relative z-10 flex justify-center">
            {/* Bezel keyboard indent reflection */}
            <div className="w-1/4 h-[2px] bg-black/40 rounded-full mt-1.5" />
          </div>

        </div>

      </div>
    </section>
  );
}
