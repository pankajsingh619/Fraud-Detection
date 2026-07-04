"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, AlertTriangle, ArrowRight } from "lucide-react";

interface LiveTransaction {
  id: string;
  amount: number;
  country: string;
  merchant: string;
  status: "safe" | "review" | "blocked";
  time: string;
}

const mockMerchants = ["Amazon SG", "Binance Crypto", "Uber India", "Walmart US", "Netflix", "Shell Petrol", "Local Grocery"];
const mockCountries = ["India", "Singapore", "United States", "Nigeria", "United Kingdom", "Russia"];

export default function LiveTransactionStream() {
  const [transactions, setTransactions] = useState<LiveTransaction[]>([
    { id: "TX-98412", amount: 82000, country: "Singapore", merchant: "Amazon SG", status: "blocked", time: "10:54:12" },
    { id: "TX-98411", amount: 499, country: "India", merchant: "Amazon IN", status: "safe", time: "10:53:50" },
    { id: "TX-98410", amount: 150000, country: "Nigeria", merchant: "Binance Crypto", status: "blocked", time: "10:52:11" },
    { id: "TX-98409", amount: 1200, country: "India", merchant: "Uber India", status: "safe", time: "10:50:40" },
    { id: "TX-98408", amount: 35000, country: "United States", merchant: "Walmart US", status: "review", time: "10:48:15" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randAmount = Math.floor(Math.random() * 145000) + 500;
      const randCountry = mockCountries[Math.floor(Math.random() * mockCountries.length)];
      const randMerchant = mockMerchants[Math.floor(Math.random() * mockMerchants.length)];
      
      let status: "safe" | "review" | "blocked" = "safe";
      if (randAmount > 100000 || randCountry === "Nigeria") {
        status = "blocked";
      } else if (randAmount > 40000 || randCountry !== "India") {
        status = "review";
      }

      const newTx: LiveTransaction = {
        id: `TX-${Math.floor(Math.random() * 90000) + 10000}`,
        amount: randAmount,
        country: randCountry,
        merchant: randMerchant,
        status,
        time: new Date().toLocaleTimeString(),
      };

      setTransactions((prev) => [newTx, ...prev.slice(0, 4)]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="live-feed" className="py-32 px-6 bg-[#050505] relative text-left">
      {/* Soft color glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#ef4444]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left col: Title and hierarchy statement */}
        <div className="lg:col-span-5 space-y-6 pt-4">
          <span className="text-[10px] font-mono tracking-[0.2em] text-[#ef4444] uppercase block">Operations Center Feed</span>
          <h2 className="text-3xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">
            Live Transaction Stream
          </h2>
          <p className="text-xs text-[#cbd5e1]/60 leading-relaxed font-light">
            Audit simulated transactional traffic flowing through our API servers. The pipeline executes baseline classifiers, weights attributions, and triggers policy locks within milliseconds of ingestion.
          </p>
          <div className="flex gap-6 font-mono text-[9px] text-[#cbd5e1]/30">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#22c55e]" /> SAFE (Green)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#f97316]" /> REVIEW (Orange)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#ef4444]" /> BLOCKED (Red)</span>
          </div>
        </div>

        {/* Right col: Feeds stream container */}
        <div className="lg:col-span-7 w-full max-w-[650px] rounded-2xl glass-panel p-4 border border-white/5 space-y-3 relative">
          
          <div className="flex justify-between items-center text-[9px] font-mono text-white/30 pb-2 border-b border-white/5 px-2">
            <span>TRANSACTION INGESTION PROFILE</span>
            <span>DIAGNOSTIC STATUS</span>
          </div>

          <div className="relative overflow-hidden min-h-[310px]">
            <AnimatePresence initial={false}>
              {transactions.map((tx) => {
                let badgeColor = "border-[#22c55e]/25 text-[#22c55e] bg-[#22c55e]/5";
                let Icon = ShieldCheck;
                let statusLabel = "SAFE APPROVED";

                if (tx.status === "blocked") {
                  badgeColor = "border-[#ef4444]/25 text-[#ef4444] bg-[#ef4444]/5";
                  Icon = ShieldAlert;
                  statusLabel = "BLOCKED";
                } else if (tx.status === "review") {
                  badgeColor = "border-[#f97316]/25 text-[#f97316] bg-[#f97316]/5";
                  Icon = AlertTriangle;
                  statusLabel = "REVIEW REQ";
                }

                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: -20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: 20, height: 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className="overflow-hidden mb-2"
                  >
                    <div className="p-3 rounded-xl bg-[#0a0a0a] border border-white/5 flex items-center justify-between hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-3 text-left">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${badgeColor}`}>
                          <Icon size={14} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-white">{tx.id}</span>
                            <span className="text-[9px] text-white/30 font-mono">{tx.time}</span>
                          </div>
                          <div className="text-[10px] text-[#cbd5e1]/70 font-mono mt-0.5">
                            ₹{tx.amount.toLocaleString()} <ArrowRight size={8} className="inline mx-1 text-white/20" /> {tx.merchant} ({tx.country})
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <span className={`px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase ${badgeColor}`}>
                          {statusLabel}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  );
}
