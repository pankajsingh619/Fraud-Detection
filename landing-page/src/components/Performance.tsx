"use client";

import React, { useState, useEffect } from "react";
import { Info, HelpCircle } from "lucide-react";

export default function Performance() {
  const useCounter = (target: number, duration: number = 1500, decimals: number = 0) => {
    const [count, setCount] = useState<number>(0);

    useEffect(() => {
      let start = 0;
      const end = target;
      const range = end - start;
      const increment = range / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          clearInterval(timer);
          setCount(end);
        } else {
          setCount(parseFloat(start.toFixed(decimals)));
        }
      }, 16);

      return () => clearInterval(timer);
    }, [target, duration, decimals]);

    return count;
  };

  const inDomain = useCounter(0.8399, 1500, 4);
  const crossDomain = useCounter(0.9076, 1500, 4);
  const agents = useCounter(5, 1200);
  const stages = useCounter(9, 1200);

  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const metricDetails: Record<string, { desc: string; stats: string }> = {
    indomain: {
      desc: "Measured on IEEE-CIS transaction distributions using a 70/30 temporal validation split.",
      stats: "Stacking ROC: 0.8399 (95% CI: 0.8340 - 0.8458)"
    },
    crossdomain: {
      desc: "Measured on Sparkov datasets to test model robustness against extreme domain shift.",
      stats: "Logistic Regression: 0.9076 (95% CI: 0.9015 - 0.9137)"
    },
    agents: {
      desc: "Cooperative LLM diagnostics reviewing transaction logs, regulatory guidelines, and compliance rules.",
      stats: "Verdicts require 3/5 consensus agreement."
    },
    stages: {
      desc: "Comprehensive extraction path starting from API telemetry to final SAR dossier generation.",
      stats: "Total processing latency: <350ms"
    }
  };

  return (
    <section id="performance" className="py-24 px-6 border-t border-white/5 bg-[#080808]">
      <div className="max-w-[1000px] mx-auto relative">
        
        {/* Title */}
        <div className="text-center mb-16">
          <span className="text-[10px] font-mono tracking-[0.2em] text-[#8b5cf6] uppercase">Statistical Benchmarks</span>
          <h2 className="text-3xl font-bold font-display text-white mt-1 mb-2">Model Performance</h2>
          <p className="text-xs text-[#94a3b8] max-w-md mx-auto leading-relaxed">
            Rigorous validation metrics incorporating cross-dataset generalization metrics, confidence intervals, and statistical significance tests.
          </p>
        </div>

        {/* Counters Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center mb-12">
          
          {/* In-Domain */}
          <div 
            className="space-y-2 relative group cursor-pointer"
            onMouseEnter={() => setActiveTooltip("indomain")}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <span className="text-[10px] font-mono text-[#94a3b8] uppercase tracking-wider flex items-center justify-center gap-1">
              <span>In-Domain ROC-AUC</span>
              <HelpCircle size={10} className="opacity-40 group-hover:opacity-100 transition-opacity" />
            </span>
            <div className="text-4xl md:text-5xl font-extrabold font-display text-gradient-blue-purple filter drop-shadow hover:scale-105 transition-transform duration-300">
              {inDomain}
            </div>
            <span className="text-[10px] text-[#cbd5e1] block">Temporal Split split</span>
          </div>

          {/* Cross-Domain */}
          <div 
            className="space-y-2 relative group cursor-pointer"
            onMouseEnter={() => setActiveTooltip("crossdomain")}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <span className="text-[10px] font-mono text-[#94a3b8] uppercase tracking-wider flex items-center justify-center gap-1">
              <span>Cross-Domain ROC-AUC</span>
              <HelpCircle size={10} className="opacity-40 group-hover:opacity-100 transition-opacity" />
            </span>
            <div className="text-4xl md:text-5xl font-extrabold font-display text-gradient-cyan-purple hover:scale-105 transition-transform duration-300">
              {crossDomain}
            </div>
            <span className="text-[10px] text-[#cbd5e1] block">Logistic baseline</span>
          </div>

          {/* Agents */}
          <div 
            className="space-y-2 relative group cursor-pointer"
            onMouseEnter={() => setActiveTooltip("agents")}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <span className="text-[10px] font-mono text-[#94a3b8] uppercase tracking-wider flex items-center justify-center gap-1">
              <span>AI Analyst Agents</span>
              <HelpCircle size={10} className="opacity-40 group-hover:opacity-100 transition-opacity" />
            </span>
            <div className="text-4xl md:text-5xl font-extrabold font-display text-gradient-cyan-purple hover:scale-105 transition-transform duration-300">
              {agents}
            </div>
            <span className="text-[10px] text-[#cbd5e1] block">Cooperating reviews</span>
          </div>

          {/* Stages */}
          <div 
            className="space-y-2 relative group cursor-pointer"
            onMouseEnter={() => setActiveTooltip("stages")}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <span className="text-[10px] font-mono text-[#94a3b8] uppercase tracking-wider flex items-center justify-center gap-1">
              <span>Pipeline Stages</span>
              <HelpCircle size={10} className="opacity-40 group-hover:opacity-100 transition-opacity" />
            </span>
            <div className="text-4xl md:text-5xl font-extrabold font-display text-gradient-blue-purple hover:scale-105 transition-transform duration-300">
              {stages}
            </div>
            <span className="text-[10px] text-[#cbd5e1] block">Ingestion to SAR report</span>
          </div>

        </div>

        {/* Interactive Stats Info Card */}
        <div className="min-h-[70px] w-full max-w-[700px] mx-auto rounded-2xl bg-[#101010]/60 border border-white/5 p-4 flex items-start gap-3 transition-all duration-300">
          <Info size={16} className="text-[#3b82f6] shrink-0 mt-0.5" />
          <div className="text-left">
            {activeTooltip ? (
              <div className="animate-fade-in space-y-1">
                <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Benchmark Specs: {activeTooltip === "indomain" ? "In-Domain ROC" : activeTooltip === "crossdomain" ? "Cross-Domain ROC" : activeTooltip === "agents" ? "Consensus Agents" : "Execution Pipeline"}
                </span>
                <p className="text-[11px] text-[#94a3b8]">{metricDetails[activeTooltip].desc}</p>
                <div className="text-[10px] font-mono text-[#22c55e] font-bold">{metricDetails[activeTooltip].stats}</div>
              </div>
            ) : (
              <div>
                <span className="text-xs font-bold text-white uppercase font-mono tracking-wider block mb-0.5">
                  Statistical Significance Validation
                </span>
                <p className="text-[11px] text-[#cbd5e1] leading-relaxed">
                  We validated classifier improvements using the <strong>McNemar statistical significance test</strong>. Benchmarks comparing Stacking models against standard CatBoost baselines confirmed p-values &lt; 0.001, verifying that ensembling boosts performance significantly rather than by random variance. Hover over any KPI block to audit bounds.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
