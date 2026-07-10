"use client";

import React, { useState } from "react";
import AppLayout from "../../components/AppLayout";
import { Info, BarChart2, ShieldAlert, Award, Clock, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<"roc" | "calibration" | "drift" | "cost">("roc");

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in text-left">
        
        {/* Upper Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold font-display text-white">Model Diagnostics & Analytics</h2>
            <p className="text-xs text-[#94a3b8] mt-0.5">High-fidelity metrics, statistical stability indexes, and cross-dataset validation.</p>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-[#00e5ff] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-pulse" />
            <span>Telemetry Calibrated</span>
          </div>
        </div>

        {/* Analytics Top Level KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Temporal split ROC-AUC", val: "0.8399", desc: "IEEE-CIS benchmark split", color: "text-[#3b82f6]", icon: <Award size={14} /> },
            { label: "Cross-domain ROC-AUC", val: "0.9076", desc: "Sparkov generalization test", color: "text-[#8b5cf6]", icon: <Award size={14} /> },
            { label: "Active Drift Warning", val: "0.8529 PSI", desc: "Amount feature distribution", color: "text-red-500", icon: <ShieldAlert size={14} /> },
            { label: "Pipeline average latency", val: "32ms", desc: "Stacking inference cost", color: "text-[#22c55e]", icon: <Clock size={14} /> },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#101010] border border-white/5 flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-[#94a3b8] uppercase tracking-wider block">{item.label}</span>
                <span className={`text-xl font-extrabold font-display ${item.color} block`}>{item.val}</span>
                <span className="text-[9px] text-white/40 block font-mono">{item.desc}</span>
              </div>
              <div className="p-1 rounded bg-white/5 text-white/30">{item.icon}</div>
            </div>
          ))}
        </div>

        {/* Tabs Control */}
        <div className="flex border-b border-white/5 gap-1.5 text-xs font-mono">
          {[
            { id: "roc", label: "ROC Curve" },
            { id: "calibration", label: "Model Calibration" },
            { id: "drift", label: "Feature Drift (PSI)" },
            { id: "cost", label: "Operational Cost Curve" }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`pb-2.5 px-4 cursor-pointer transition-colors relative ${
                activeTab === t.id ? "text-white font-bold" : "text-white/40 hover:text-white"
              }`}
            >
              {t.label}
              {activeTab === t.id && (
                <span className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Visualizer Pane */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-[#101010]/60 border border-white/5 flex flex-col items-center justify-center min-h-[360px]">
            
            {activeTab === "roc" && (
              <div className="w-full space-y-4 text-center">
                <span className="text-[10px] font-mono text-white/50 block text-left">RECEIVER OPERATING CHARACTERISTIC (ROC-AUC)</span>
                <div className="w-full max-w-[400px] h-[260px] mx-auto bg-black border border-white/5 rounded-lg relative overflow-hidden flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full p-4 overflow-visible">
                    {/* Grid */}
                    <line x1="0" y1="100" x2="100" y2="100" stroke="#222" strokeWidth="0.5" />
                    <line x1="0" y1="0" x2="0" y2="100" stroke="#222" strokeWidth="0.5" />
                    <line x1="0" y1="100" x2="100" y2="0" stroke="#111" strokeWidth="0.5" strokeDasharray="2,2" />
                    
                    {/* ROC Curve */}
                    <path 
                      d="M 0 100 Q 15 35 100 0" 
                      fill="none" 
                      stroke="url(#rocGrad)" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                    />
                    
                    {/* Linear Regression curve (cross-domain) */}
                    <path 
                      d="M 0 100 Q 30 50 100 0" 
                      fill="none" 
                      stroke="#8b5cf6" 
                      strokeWidth="1" 
                      strokeDasharray="3,3"
                    />

                    {/* Gradients */}
                    <defs>
                      <linearGradient id="rocGrad" x1="0" y1="1" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#00e5ff" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Legend Overlay */}
                  <div className="absolute bottom-3 right-3 font-mono text-[8px] space-y-1 bg-black/60 p-2 rounded border border-white/5 text-left">
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-[#00e5ff]" /> Stacking Ensemble: 0.8399</div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-[#8b5cf6] border-dashed border-t" /> Logistic Regression: 0.9076</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "calibration" && (
              <div className="w-full space-y-4 text-center">
                <span className="text-[10px] font-mono text-white/50 block text-left">MODEL PROBABILITY CALIBRATION CURVE</span>
                <div className="w-full max-w-[400px] h-[260px] mx-auto bg-black border border-white/5 rounded-lg relative overflow-hidden flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full p-4 overflow-visible">
                    {/* Grid */}
                    <line x1="0" y1="100" x2="100" y2="100" stroke="#222" strokeWidth="0.5" />
                    <line x1="0" y1="0" x2="0" y2="100" stroke="#222" strokeWidth="0.5" />
                    {/* Perfect Calibration line */}
                    <line x1="0" y1="100" x2="100" y2="0" stroke="#444" strokeWidth="0.75" />

                    {/* Calibrated meta curve */}
                    <path d="M 0 100 L 25 78 L 50 48 L 75 22 L 100 0" fill="none" stroke="#22c55e" strokeWidth="1.5" />
                    <circle cx="25" cy="78" r="1.5" fill="#22c55e" />
                    <circle cx="50" cy="48" r="1.5" fill="#22c55e" />
                    <circle cx="75" cy="22" r="1.5" fill="#22c55e" />

                    {/* Uncalibrated trees curve */}
                    <path d="M 0 100 L 25 89 L 50 38 L 75 10 L 100 0" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="2,2" />
                  </svg>
                  
                  {/* Legend Overlay */}
                  <div className="absolute bottom-3 right-3 font-mono text-[8px] space-y-1 bg-black/60 p-2 rounded border border-white/5 text-left">
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-[#22c55e]" /> Calibrated Ensemble (Brier: 0.076)</div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-[#ef4444] border-dashed border-t" /> Uncalibrated Trees (Brier: 0.142)</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "drift" && (
              <div className="w-full space-y-4 text-left">
                <span className="text-[10px] font-mono text-white/50 block">POPULATION STABILITY INDEX (PSI) DISTRIBUTION TRENDS</span>
                
                {/* PSI Dataframe Mock */}
                <div className="rounded-xl overflow-hidden border border-white/5 font-mono text-[10px]">
                  <table className="w-full bg-black border-collapse text-left">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/5 text-[#94a3b8] text-[9px]">
                        <th className="py-2 px-3">FEATURE</th>
                        <th className="py-2 px-3 text-right">PSI SCORE</th>
                        <th className="py-2 px-3 text-right">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { f: "TransactionAmt", val: 0.8529, s: "🚨 SIGNIFICANT DRIFT", color: "text-[#ef4444]" },
                        { f: "spend_ratio_avg", val: 0.2312, s: "🟡 MODERATE DRIFT", color: "text-[#f59e0b]" },
                        { f: "hour_of_day", val: 0.0412, s: "🟢 STABLE", color: "text-[#22c55e]" },
                        { f: "geo_distance_km", val: 0.0225, s: "🟢 STABLE", color: "text-[#22c55e]" }
                      ].map((row, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 text-white">{row.f}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#00e5ff]">{row.val}</td>
                          <td className={`py-2.5 px-3 text-right font-bold ${row.color}`}>{row.s}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "cost" && (
              <div className="w-full space-y-4 text-center">
                <span className="text-[10px] font-mono text-white/50 block text-left">OPERATIONAL COST-SENSITIVE VERDICT THRESHOLD</span>
                <div className="w-full max-w-[400px] h-[260px] mx-auto bg-black border border-white/5 rounded-lg relative overflow-hidden flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full p-4 overflow-visible">
                    {/* Grid */}
                    <line x1="0" y1="100" x2="100" y2="100" stroke="#222" strokeWidth="0.5" />
                    <line x1="0" y1="0" x2="0" y2="100" stroke="#222" strokeWidth="0.5" />
                    
                    {/* Total cost curve */}
                    <path d="M 0 30 Q 52 95 100 20" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                    
                    {/* Optimal threshold vertical line */}
                    <line x1="52" y1="0" x2="52" y2="100" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4,4" />
                    <circle cx="52" cy="74" r="2.5" fill="#3b82f6" />
                  </svg>
                  
                  {/* Legend Overlay */}
                  <div className="absolute top-3 right-3 font-mono text-[8px] space-y-1 bg-black/60 p-2 rounded border border-white/5 text-left">
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-[#f59e0b]" /> Operational Review Cost</div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-[#3b82f6] border-dashed border-t" /> Optimal Threshold: p=0.5200</div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right explanation panel */}
          <div className="p-5 rounded-2xl bg-[#101010]/60 border border-white/5 flex flex-col justify-between text-left space-y-4">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white/50 mb-2">Metrics Context</h3>
              <p className="text-[11px] text-[#94a3b8] leading-relaxed">
                {activeTab === "roc" && "ROC Curves measure performance metrics at varying decision boundaries. An AUC of 0.8399 confirms high discriminative power for ensembled gradients."}
                {activeTab === "calibration" && "Calibration curves display the correlation between predicted risk percentages and empirical actual fraud rates. Calibrated meta estimators prevent scale overconfidence."}
                {activeTab === "drift" && "Population Stability Index (PSI) audits covariates drift over time. Features drift alerts (>0.25 PSI) automatically queue retraining hooks to resolve domain shifts."}
                {activeTab === "cost" && "Operational cost optimization balances review friction against raw fraud losses. Dynamic thresholds optimize holds at p=0.5200 to protect corporate bottom lines."}
              </p>
            </div>
            
            <div className="p-3 bg-black/60 rounded-xl border border-white/5 space-y-2 text-[10px] font-mono leading-relaxed">
              <span className="font-bold text-[#8b5cf6] block">💡 Diagnostics Insight:</span>
              <p className="text-white/60">
                Temporal covariate shifts on Amount indicate potential shopping profile changes. Queue retraining to realign metadata boundaries.
              </p>
            </div>
          </div>

        </div>

      </div>
    </AppLayout>
  );
}
