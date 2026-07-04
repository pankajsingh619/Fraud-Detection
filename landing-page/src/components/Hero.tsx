"use client";

import React from "react";
import { motion } from "framer-motion";
import { Play, ArrowRight, Activity, Cpu, ShieldCheck } from "lucide-react";
import NeuralNetworkCanvas from "./NeuralNetworkCanvas";

export default function Hero() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen w-full flex flex-col justify-between items-center px-6 py-12 overflow-hidden bg-[#050505] text-left">
      {/* Three.js rotating neural node canvas background */}
      <NeuralNetworkCanvas />

      {/* Radial soft color halos */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-r from-[#3b82f6]/5 to-[#8b5cf6]/5 rounded-full blur-3xl pointer-events-none z-10" />

      {/* Tiny logo top left wrapper */}
      <div className="w-full max-w-[1200px] flex justify-between items-center z-30 mx-auto">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
          <span className="font-display font-extrabold tracking-widest text-xs text-white">GUARDIANEYE</span>
        </div>
        <div className="hidden sm:flex gap-6 font-mono text-[10px] text-[#cbd5e1]/40">
          <span>v1.0.0</span>
          <span>●</span>
          <span>AUDITOR PORTAL READY</span>
        </div>
      </div>

      {/* Main Core Story pitch */}
      <div className="w-full max-w-[1200px] z-30 mx-auto my-auto pt-16 flex flex-col lg:flex-row items-start justify-between gap-12 text-left">
        
        {/* Left column: Text */}
        <div className="max-w-[700px] space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[10px] font-mono text-[#3b82f6] uppercase tracking-wider"
          >
            <span>Explainable AI Risk Engine</span>
          </motion.div>

          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-8xl font-black font-display tracking-tight text-white leading-[0.95]"
            >
              GUARDIANEYE
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.05] text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#cbd5e1]/45"
            >
              AI That Investigates Fraud <br /> Before Humans Do.
            </motion.p>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm md:text-base text-[#cbd5e1]/65 max-w-lg leading-relaxed font-light"
          >
            A security platform combining tree ensembling, local attributions (SHAP/LIME), compliance filters, and multi-agent consensus to automate threat auditing.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <button 
              onClick={() => scrollToSection("live-feed")}
              className="px-6 py-3 rounded-xl bg-white text-black hover:bg-white/90 text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Watch Ingestion Stream</span>
              <ArrowRight size={13} />
            </button>
            <button 
              onClick={() => {
                // Focus login
                const el = document.getElementById("launch-btn-cta");
                if (el) el.click();
              }}
              className="px-6 py-3 rounded-xl bg-[#3b82f6]/10 border border-[#3b82f6]/20 hover:bg-[#3b82f6]/20 text-[#3b82f6] text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-glow"
            >
              <Play size={10} fill="currentColor" />
              <span>Launch Live Workspace</span>
            </button>
          </motion.div>
        </div>

        {/* Right column: Stat metrics card widgets floating */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full lg:max-w-[380px] grid grid-cols-1 gap-4 font-mono z-30"
        >
          {/* Card 1 */}
          <div className="p-4 rounded-2xl glass-panel border border-white/5 relative overflow-hidden shadow-glow hover:border-white/10 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#3b82f6]/5 rounded-full blur-xl pointer-events-none" />
            <span className="text-[9px] text-[#94a3b8] block mb-1">ACCURACY INDEX</span>
            <span className="text-3xl font-extrabold font-display text-white tracking-tight">98.7%</span>
            <span className="text-[8px] text-[#22c55e] block mt-1">▲ ENSEMBLE ROBUSTNESS TARGET</span>
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-2xl glass-panel border border-white/5 relative overflow-hidden hover:border-white/10 transition-colors flex items-center justify-between">
            <div>
              <span className="text-[9px] text-[#94a3b8] block mb-1">QUEUE MONITOR</span>
              <span className="text-sm font-bold text-white tracking-tight">Active Telemetry</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#22c55e]/10 border border-[#22c55e]/20 text-[9px] text-[#22c55e]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping" />
              <span>LIVE</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-4 rounded-2xl glass-panel border border-white/5 relative overflow-hidden hover:border-white/10 transition-colors">
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#8b5cf6]/5 rounded-full blur-xl pointer-events-none" />
            <span className="text-[9px] text-[#94a3b8] block mb-1">AUDIT VOLUME</span>
            <span className="text-xl font-bold text-white tracking-tight">42,000+ TXNS</span>
            <span className="text-[8px] text-white/40 block mt-1">IEEE-CIS + SPARKOV EVALS</span>
          </div>
        </motion.div>

      </div>

      {/* Bottom spacer */}
      <div className="w-full max-w-[1200px] flex justify-between items-center z-30 mx-auto border-t border-white/5 pt-8 mt-12 text-[9px] font-mono text-[#cbd5e1]/40">
        <span>SCROLL DOWN TO TRACE TRANSACTION INGESTION</span>
        <span>↓</span>
      </div>
    </section>
  );
}
