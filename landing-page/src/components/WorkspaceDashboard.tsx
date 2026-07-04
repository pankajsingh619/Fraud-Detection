"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, AlertTriangle, Activity, ArrowRight, Play, Cpu, Layers } from "lucide-react";

interface TelemetryItem {
  id: string;
  amount: number;
  country: string;
  stage: "Ingestion" | "Features" | "Stacking" | "SHAP" | "Compliance" | "RAG" | "Consensus" | "Complete";
  status: "safe" | "review" | "blocked" | "processing";
}

export default function WorkspaceDashboard() {
  const [alertsCount, setAlertsCount] = useState(132);
  const [blockedCount, setBlockedCount] = useState(98);
  const [reviewCount, setReviewCount] = useState(25);
  const [safeCount, setSafeCount] = useState(16345);

  const [queue, setQueue] = useState<TelemetryItem[]>([
    { id: "TX-98425", amount: 14500, country: "India", stage: "Ingestion", status: "processing" },
    { id: "TX-98424", amount: 82000, country: "Singapore", stage: "Stacking", status: "review" },
    { id: "TX-98423", amount: 150000, country: "Nigeria", stage: "RAG", status: "blocked" },
    { id: "TX-98422", amount: 1200, country: "India", stage: "Consensus", status: "safe" },
    { id: "TX-98421", amount: 499, country: "India", stage: "Complete", status: "safe" },
  ]);

  // Simulate counters ticking up
  useEffect(() => {
    const interval = setInterval(() => {
      setSafeCount(prev => prev + Math.floor(Math.random() * 3) + 1);
      if (Math.random() > 0.85) {
        setAlertsCount(prev => prev + 1);
        if (Math.random() > 0.5) setBlockedCount(prev => prev + 1);
        else setReviewCount(prev => prev + 1);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Simulate queue updates moving transactions along the pipeline stages
  useEffect(() => {
    const stagesList: TelemetryItem["stage"][] = [
      "Ingestion", "Features", "Stacking", "SHAP", "Compliance", "RAG", "Consensus", "Complete"
    ];

    const interval = setInterval(() => {
      setQueue((prev) => {
        // Move each transaction to next stage
        const updated = prev.map((tx) => {
          const currIdx = stagesList.indexOf(tx.stage);
          if (tx.stage === "Complete") {
            // Restart or release
            const randAmt = Math.floor(Math.random() * 120000) + 1000;
            const countries = ["India", "Singapore", "Nigeria", "United States"];
            const randCountry = countries[Math.floor(Math.random() * countries.length)];
            return {
              id: `TX-${Math.floor(Math.random() * 90000) + 10000}`,
              amount: randAmt,
              country: randCountry,
              stage: "Ingestion" as const,
              status: "processing" as const
            };
          }
          
          const nextStage = stagesList[currIdx + 1];
          let status = tx.status;
          if (nextStage === "Complete") {
            if (tx.amount > 100000 || tx.country === "Nigeria") status = "blocked";
            else if (tx.amount > 40000 || tx.country !== "India") status = "review";
            else status = "safe";
          }
          
          return {
            ...tx,
            stage: nextStage,
            status
          };
        });
        return updated;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Upper header */}
      <div className="flex justify-between items-center pb-4 border-b border-white/5">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Auditor Dashboard</h2>
          <p className="text-xs text-[#94a3b8] mt-0.5">Real-time system telemetry and transaction ingestion overview.</p>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-white/50 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping" />
          <span>System Healthy</span>
        </div>
      </div>

      {/* Counters Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Alerts Today", val: alertsCount, color: "text-[#ef4444]", border: "border-[#ef4444]/30", icon: <ShieldAlert size={16} /> },
          { label: "Blocked Requests", val: blockedCount, color: "text-orange-500", border: "border-orange-500/30", icon: <ShieldAlert size={16} /> },
          { label: "Step-Up Reviews", val: reviewCount, color: "text-[#f97316]", border: "border-[#f97316]/30", icon: <AlertTriangle size={16} /> },
          { label: "Safe Transactions", val: safeCount, color: "text-[#22c55e]", border: "border-[#22c55e]/30", icon: <ShieldCheck size={16} /> },
        ].map((item, idx) => (
          <div key={idx} className={`p-4 rounded-2xl bg-[#101010] border ${item.border} flex justify-between items-start`}>
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-[#94a3b8] uppercase tracking-wider block">{item.label}</span>
              <span className={`text-2xl font-extrabold font-display ${item.color} block`}>
                {item.val.toLocaleString()}
              </span>
            </div>
            <div className={`p-1.5 rounded-lg bg-white/5 text-white/40`}>
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Active Queue Telemetry Flow */}
      <div className="p-5 rounded-2xl bg-[#101010]/60 border border-white/5">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white/60 mb-4 flex items-center gap-1.5">
          <Activity size={14} className="text-[#3b82f6]" />
          <span>Active Queue Telemetry (Moving Pipeline Stage Nodes)</span>
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {queue.map((tx) => {
            let statusColor = "border-white/5 text-white/40";
            if (tx.status === "blocked") statusColor = "border-[#ef4444]/30 text-[#ef4444] bg-[#ef4444]/5 animate-pulse";
            else if (tx.status === "review") statusColor = "border-[#f97316]/30 text-[#f97316] bg-[#f97316]/5";
            else if (tx.status === "safe") statusColor = "border-[#22c55e]/30 text-[#22c55e] bg-[#22c55e]/5";
            else if (tx.status === "processing") statusColor = "border-[#3b82f6]/30 text-[#3b82f6] bg-[#3b82f6]/5";

            return (
              <div 
                key={tx.id} 
                className={`p-3 rounded-xl bg-[#0a0a0a] border ${statusColor} flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-[10px]`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white text-xs">{tx.id}</span>
                  <span className="text-white/50">₹{tx.amount.toLocaleString()}</span>
                  <span className="text-white/30">|</span>
                  <span className="text-white/50">{tx.country}</span>
                </div>

                {/* Progress bar stages */}
                <div className="flex-grow flex items-center justify-between max-w-[500px] text-[8px] relative px-1">
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-white/5 z-0" />
                  
                  {["Ingestion", "Features", "Stacking", "SHAP", "Compliance", "RAG", "Consensus", "Complete"].map((s, idx) => {
                    const active = tx.stage === s;
                    const passed = ["Ingestion", "Features", "Stacking", "SHAP", "Compliance", "RAG", "Consensus", "Complete"].indexOf(tx.stage) >= idx;

                    return (
                      <div key={idx} className="relative z-10 flex flex-col items-center">
                        <div 
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                            active 
                              ? "bg-[#3b82f6] border-[#3b82f6] scale-110 shadow-[0_0_8px_#3b82f6]" 
                              : passed 
                                ? "bg-white/10 border-white/20" 
                                : "bg-[#101010] border-white/5"
                          }`}
                        />
                        <span className={`mt-1 font-mono tracking-tighter ${active ? "text-[#3b82f6] font-bold" : "text-white/30"}`}>
                          {s}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical charts preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Model stability card */}
        <div className="p-4 rounded-2xl bg-[#101010] border border-white/5">
          <span className="text-[10px] font-mono text-white/40 block mb-2">MODEL STABILITY TRENDS (PSI SUMMARY)</span>
          <div className="h-[120px] w-full bg-[#050505] rounded-xl flex items-end justify-between p-3">
            {[23, 45, 67, 34, 56, 89, 72, 41, 58, 62].map((h, i) => (
              <div key={i} className="w-[8%] bg-[#8b5cf6]/35 rounded-t group relative cursor-pointer" style={{ height: `${h}%` }}>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-black text-[8px] font-mono rounded px-1 text-white py-0.5 opacity-0 group-hover:opacity-100 transition-opacity mb-1 z-10 border border-white/10">
                  {h / 100}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Anomaly metrics card */}
        <div className="p-4 rounded-2xl bg-[#101010] border border-white/5">
          <span className="text-[10px] font-mono text-white/40 block mb-2">INGESTION VOLUME HISTORY (24H)</span>
          <div className="h-[120px] w-full bg-[#050505] rounded-xl flex items-end justify-between p-3">
            {[45, 32, 54, 76, 89, 65, 50, 48, 72, 95].map((h, i) => (
              <div key={i} className="w-[8%] bg-[#3b82f6]/35 rounded-t group relative cursor-pointer" style={{ height: `${h}%` }}>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-black text-[8px] font-mono rounded px-1 text-white py-0.5 opacity-0 group-hover:opacity-100 transition-opacity mb-1 z-10 border border-white/10">
                  {h * 23}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
