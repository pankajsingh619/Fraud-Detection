"use client";

import React, { useState } from "react";
import { Key, Copy, Check, Trash, Info, RefreshCw } from "lucide-react";

export default function SettingsPanel() {
  const [threshold, setThreshold] = useState<number>(0.52);
  const [apiKeys, setApiKeys] = useState<{ id: string; key: string; name: string }[]>([
    { id: "1", key: "ge_live_8390b1c93a0bcf428941bc", name: "FastAPI Ingestion Key" }
  ]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const generateKey = () => {
    const chars = "abcdef0123456789";
    let keyString = "ge_live_";
    for (let i = 0; i < 22; i++) {
      keyString += chars[Math.floor(Math.random() * chars.length)];
    }
    const newKey = {
      id: Math.random().toString(),
      key: keyString,
      name: `External Auditor API Key ${apiKeys.length + 1}`
    };
    setApiKeys(prev => [...prev, newKey]);
  };

  const deleteKey = (id: string) => {
    setApiKeys(prev => prev.filter(k => k.id !== id));
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in text-left max-w-[800px]">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-white/5">
        <div>
          <h2 className="text-xl font-bold font-display text-white">System Settings</h2>
          <p className="text-xs text-[#94a3b8] mt-0.5">Configure compliance thresholds and external API credentials.</p>
        </div>
      </div>

      {/* Threshold Slider Card */}
      <div className="p-5 rounded-2xl bg-[#101010] border border-white/5 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-bold text-white">Risk Stacking Verdict Threshold</h3>
            <p className="text-[11px] text-[#94a3b8] mt-0.5 leading-relaxed">
              Adjust the probability classification threshold determining when a transaction triggers a compliance step-up challenge or is blocked.
            </p>
          </div>
          <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-[#3b82f6]/20 border border-[#3b82f6]/40 text-[#3b82f6]">
            {threshold} threshold
          </span>
        </div>

        <div className="space-y-2">
          <input 
            type="range" 
            min="0.10" 
            max="0.95" 
            step="0.05"
            value={threshold} 
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-full accent-[#3b82f6] bg-[#1a1a1a] h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[9px] font-mono text-white/30">
            <span>0.10 (HIGH SENSITIVITY)</span>
            <span className="text-[#22c55e]">0.52 (COST OPTIMAL)</span>
            <span>0.95 (LOW SENSITIVITY)</span>
          </div>
        </div>
      </div>

      {/* API Credentials */}
      <div className="p-5 rounded-2xl bg-[#101010] border border-white/5 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-white">External API Credentials</h3>
            <p className="text-[11px] text-[#94a3b8] mt-0.5">
              Secure Bearer tokens to connect downstream services to GuardianEye's FastAPI inference layer.
            </p>
          </div>
          <button
            onClick={generateKey}
            className="px-3 py-1.5 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-[10px] font-mono font-bold text-white transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
          >
            <Key size={12} />
            <span>Generate Token</span>
          </button>
        </div>

        <div className="space-y-2 font-mono text-[10px]">
          {apiKeys.length > 0 ? (
            apiKeys.map((k) => (
              <div key={k.id} className="p-3 rounded-xl bg-[#050505] border border-white/5 flex items-center justify-between gap-4">
                <div className="text-left">
                  <span className="text-[9px] text-[#cbd5e1] block mb-1">{k.name}</span>
                  <span className="text-[#3b82f6] font-bold block">{k.key}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => copyKey(k.key)}
                    className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedKey === k.key ? <Check size={12} className="text-[#22c55e]" /> : <Copy size={12} />}
                  </button>
                  <button
                    onClick={() => deleteKey(k.id)}
                    className="p-2 rounded-lg bg-red-500/10 border border-red-500/10 hover:bg-red-500/20 hover:border-red-500/20 text-[#ef4444] transition-colors cursor-pointer"
                  >
                    <Trash size={12} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-[#94a3b8]/40 border border-dashed border-white/5 rounded-xl">
              No API keys generated. Click Generate Token to create one.
            </div>
          )}
        </div>
      </div>

      <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[10px] text-[#cbd5e1] leading-relaxed flex items-start gap-2">
        <Info size={14} className="shrink-0 text-[#3b82f6] mt-0.5" />
        <p>
          Bearer tokens represent live authorization scopes. Never share keys publicly or expose them in client-side repositories. GuardianEye logs all external API accesses for audit trail reviews.
        </p>
      </div>
    </div>
  );
}
