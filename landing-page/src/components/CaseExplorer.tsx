"use client";

import React, { useState } from "react";
import { Search, AlertTriangle, ShieldCheck, ShieldAlert, ArrowRight } from "lucide-react";

export interface Case {
  id: string;
  amount: number;
  country: string;
  merchant: string;
  device: string;
  timeOfDay: string;
  spendingPattern: string;
  velocity: string;
  ipReputation: string;
  merchantRisk: string;
  status: "Under Investigation" | "Resolved" | "Step-Up Sent";
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  anomalyScore: number;
}

interface CaseExplorerProps {
  onSelectCase: (c: Case) => void;
}

export default function CaseExplorer({ onSelectCase }: CaseExplorerProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const initialCases: Case[] = [
    {
      id: "Case #1432",
      amount: 82000,
      country: "Singapore",
      merchant: "Amazon SG",
      device: "New Device (MacOS)",
      timeOfDay: "Midnight (23:45)",
      spendingPattern: "Sudden High Deviation",
      velocity: "High Velocity (5 txn/hr)",
      ipReputation: "Suspicious Proxy",
      merchantRisk: "High Risk (e-commerce)",
      status: "Under Investigation",
      riskLevel: "HIGH",
      anomalyScore: 78
    },
    {
      id: "Case #9811",
      amount: 150000,
      country: "Nigeria",
      merchant: "Binance Crypto",
      device: "Unknown Android",
      timeOfDay: "Morning (09:12)",
      spendingPattern: "Sudden High Deviation",
      velocity: "High Velocity (5 txn/hr)",
      ipReputation: "Suspicious Proxy",
      merchantRisk: "High Risk (e-commerce)",
      status: "Resolved",
      riskLevel: "HIGH",
      anomalyScore: 92
    },
    {
      id: "Case #2341",
      amount: 35000,
      country: "United States",
      merchant: "Walmart US",
      device: "New Device (MacOS)",
      timeOfDay: "Evening (18:22)",
      spendingPattern: "Sudden High Deviation",
      velocity: "Normal Velocity (1 txn/day)",
      ipReputation: "Clean Residential IP",
      merchantRisk: "High Risk (e-commerce)",
      status: "Step-Up Sent",
      riskLevel: "MEDIUM",
      anomalyScore: 54
    },
    {
      id: "Case #3412",
      amount: 499,
      country: "India",
      merchant: "Uber India",
      device: "Trusted iPhone (iOS 19)",
      timeOfDay: "Afternoon (14:30)",
      spendingPattern: "Regular Small Spends",
      velocity: "Normal Velocity (1 txn/day)",
      ipReputation: "Clean Residential IP",
      merchantRisk: "High Risk (e-commerce)",
      status: "Resolved",
      riskLevel: "LOW",
      anomalyScore: 8
    },
    {
      id: "Case #7213",
      amount: 5000,
      country: "India",
      merchant: "Local Grocery",
      device: "Trusted iPhone (iOS 19)",
      timeOfDay: "Morning (08:45)",
      spendingPattern: "Regular Small Spends",
      velocity: "Normal Velocity (1 txn/day)",
      ipReputation: "Clean Residential IP",
      merchantRisk: "High Risk (e-commerce)",
      status: "Resolved",
      riskLevel: "LOW",
      anomalyScore: 12
    }
  ];

  const filtered = initialCases.filter((c) => {
    const matchesQuery =
      c.id.toLowerCase().includes(query.toLowerCase()) ||
      c.merchant.toLowerCase().includes(query.toLowerCase()) ||
      c.country.toLowerCase().includes(query.toLowerCase());

    const matchesStatus = statusFilter === "All" || c.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-white/5">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Case Explorer</h2>
          <p className="text-xs text-[#94a3b8] mt-0.5">Browse and audit historical fraud investigation files.</p>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/30">
            <Search size={14} />
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Case ID, Merchant, Country..."
            className="w-full bg-[#101010] border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-[#3b82f6] transition-colors"
          />
        </div>

        <div className="flex gap-2 shrink-0 font-mono text-[10px]">
          {["All", "Under Investigation", "Resolved", "Step-Up Sent"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                statusFilter === status 
                  ? "bg-[#3b82f6] text-white" 
                  : "bg-[#101010] text-[#94a3b8] hover:text-white border border-white/5"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => {
          let riskColor = "text-[#22c55e]";
          let statusColor = "bg-white/5 text-[#94a3b8] border-white/5";

          if (c.riskLevel === "HIGH") riskColor = "text-[#ef4444]";
          else if (c.riskLevel === "MEDIUM") riskColor = "text-[#f97316]";

          if (c.status === "Under Investigation") statusColor = "bg-[#ef4444]/10 border-[#ef4444]/20 text-[#ef4444]";
          else if (c.status === "Step-Up Sent") statusColor = "bg-[#f97316]/10 border-[#f97316]/20 text-[#f97316]";
          else if (c.status === "Resolved") statusColor = "bg-[#22c55e]/10 border-[#22c55e]/20 text-[#22c55e]";

          return (
            <div
              key={c.id}
              onClick={() => onSelectCase(c)}
              className="rounded-2xl bg-[#101010] border border-white/5 p-4 flex flex-col justify-between hover:border-white/10 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-mono font-bold text-white text-xs">{c.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-mono font-extrabold uppercase ${statusColor}`}>
                    {c.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs mb-4">
                  <div className="text-[10px] text-[#94a3b8] font-mono">
                    Merchant: <span className="text-white font-sans font-semibold">{c.merchant}</span>
                  </div>
                  <div className="text-[10px] text-[#94a3b8] font-mono">
                    Amount: <span className="text-white font-sans font-semibold">₹{c.amount.toLocaleString()}</span>
                  </div>
                  <div className="text-[10px] text-[#94a3b8] font-mono">
                    Country: <span className="text-white font-sans font-semibold">{c.country}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="text-[10px] font-mono text-white/50">
                  Risk: <span className={`font-bold ${riskColor}`}>{c.riskLevel} ({c.anomalyScore}%)</span>
                </div>
                <div className="text-[10px] font-mono text-[#3b82f6] flex items-center gap-1">
                  <span>Open Audit</span>
                  <ArrowRight size={10} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
