"use client";

import React from "react";

export default function Footer() {
  return (
    <footer className="py-24 px-6 border-t border-white/5 bg-[#050505] text-left">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        
        {/* Left col: Minimal brand */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
            <span className="font-display font-black tracking-widest text-xs text-white">GUARDIANEYE</span>
          </div>
          <span className="text-[10px] font-mono text-white/30 block">Explainable AI for Financial Fraud</span>
        </div>

        {/* Right col: Minimal list */}
        <div className="flex flex-wrap gap-x-12 gap-y-6 text-[10px] font-mono text-white/40">
          <a href="#" className="hover:text-white transition-colors">Documentation</a>
          <a href="#" className="hover:text-white transition-colors">Research</a>
          <a href="#" className="hover:text-white transition-colors">GitHub</a>
          <a href="#" className="hover:text-white transition-colors">API</a>
        </div>

      </div>

      {/* Credit line bottom */}
      <div className="max-w-[1200px] mx-auto border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-[9px] font-mono text-[#cbd5e1]/30 gap-4">
        <span>Built by Pankaj Singh Rana</span>
        <span>v1.0.0</span>
      </div>
    </footer>
  );
}
