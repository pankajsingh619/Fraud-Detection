"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Activity, Cpu, Database, Scale, GitBranch, X } from "lucide-react";

interface ResearchCard {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  stats?: string;
  insight?: string;
  content: string;
  chartType: "roc" | "drift" | "cost" | "shap" | "rag" | "roadmap";
}

export default function Research() {
  const [selectedResearch, setSelectedResearch] = useState<ResearchCard | null>(null);

  const researchCards: ResearchCard[] = [
    {
      id: "domain_shift",
      title: "Domain Shift & Overfitting",
      subtitle: "Generalizability Degradation",
      icon: <Layers className="text-[#3b82f6]" />,
      stats: "Ensemble ROC: 0.5638 | LR ROC: 0.9076",
      insight: "Tree GBDTs split on exact values and overfit home datasets. Separately-standardized linear models capture trends robustly out-of-domain.",
      content: "Evaluating models across distributions reveals severe performance degradation for tree-based ensembling (LightGBM, XGBoost, CatBoost) when tested on Sparkov transaction distributions after training on IEEE-CIS. Tree thresholds rely on absolute scale coordinates, causing overfitting. Standardized Logistic Regression baseline models achieve a generalization ROC-AUC of 0.9076, demonstrating the need for adaptive scaling and linear baselines in cross-dataset financial networks.",
      chartType: "roc"
    },
    {
      id: "feature_drift",
      title: "Feature Distribution Drift",
      subtitle: "Population Stability Index Checks",
      icon: <Activity className="text-[#00e5ff]" />,
      stats: "Transaction Amt PSI: 0.8529",
      insight: "PSI index > 0.25 represents significant drift. Every shared transactional feature exhibited severe covariate shift.",
      content: "We quantify shift using Population Stability Index (PSI) and Jensen-Shannon Divergence. Significant covariate shift (PSI >= 0.25) was calculated for transaction amounts, hour of day, and location ratios. This quantitative assessment provides actionable triggers indicating when models need retraining or separate scale standardizations before ensembling.",
      chartType: "drift"
    },
    {
      id: "cost_sensitive",
      title: "Cost-Sensitive Thresholds",
      subtitle: "Friction Loss Optimization Curve",
      icon: <Scale className="text-[#22c55e]" />,
      stats: "Optimal Verdict Threshold: 0.52",
      insight: "Balancing verification call costs ($10) against FN fraud losses. Optimal cost achieved at threshold 0.52.",
      content: "Financial platforms must balance user friction against fraud loss. We model a cost-sensitive optimization curve charting false positive verification call friction (estimated at $10) against actual false negative transaction leakages. The stacking ensemble minimizes operational exposure at an optimal trigger probability threshold of 0.52.",
      chartType: "cost"
    },
    {
      id: "shap_local",
      title: "Explainable Attributions",
      subtitle: "SHAP Log-Odds Contributions",
      icon: <Cpu className="text-[#8b5cf6]" />,
      stats: "Avg Explainer latency: 32ms",
      insight: "SHAP calculates game-theory contributions for log-odds push of each individual transaction feature.",
      content: "Rather than black-box verdicts, GuardianEye maps local decision paths using TreeSHAP on LightGBM estimators. This provides clear log-odds attributes indicating precisely why a transaction was flagged, transforming raw risk probability into explainable threat vectors for corporate compliance investigators.",
      chartType: "shap"
    },
    {
      id: "rag_compliance",
      title: "Hybrid Sparse Lexical RAG",
      subtitle: "Metadata Concept Tag Alignment",
      icon: <Database className="text-[#8b5cf6]" />,
      stats: "Retrieval Precision@5: 0.85",
      insight: "Retrievals combine keyword indexes (TF-IDF) with regulatory metadata tag matching.",
      content: "The platform integrates standard lexical TF-IDF retrieval with concept tags to query internal security SOPs and Reserve Bank of India (RBI) guidelines. By checking incoming indicators (amount thresholds, cross-border locations) against compliance guidelines, the RAG investigator grounds generated reports, ensuring 0% compliance hallucinations.",
      chartType: "rag"
    },
    {
      id: "graph_roadmap",
      title: "Roadmap: Graph RAG",
      subtitle: "Entity Linkage via Neo4j Graphs",
      icon: <GitBranch className="text-[#3b82f6]" />,
      stats: "Target Integration: Q3 2026",
      insight: "Transitioning RAG vectors to relational graphs to map device shares and device-card chains.",
      content: "Future work addresses mapping complex network relationships using Neo4j. By linking device hardware fingerprints, geographical IP routing coordinates, and credit card nodes, the multi-agent reasoning layer will be able to detect structured Account Takeover (ATO) rings and cluster fraud trends that standard tabular models miss.",
      chartType: "roadmap"
    }
  ];

  // Helper to render mini visual SVGs in research cards
  const renderMiniChart = (type: string) => {
    switch (type) {
      case "roc":
        return (
          <svg viewBox="0 0 100 60" className="w-full h-16 opacity-50 hover:opacity-100 transition-opacity">
            <line x1="10" y1="50" x2="90" y2="50" stroke="#333" strokeWidth="1" />
            <line x1="10" y1="10" x2="10" y2="50" stroke="#333" strokeWidth="1" />
            {/* Diagonal baseline */}
            <line x1="10" y1="50" x2="90" y2="10" stroke="#222" strokeWidth="0.8" strokeDasharray="2,2" />
            {/* Logistic Regression ROC (high domain ROC) */}
            <path d="M10,50 Q40,15 90,10" fill="none" stroke="#22c55e" strokeWidth="1.2" />
            {/* Ensemble Stacking ROC (low domain ROC) */}
            <path d="M10,50 Q60,40 90,10" fill="none" stroke="#ef4444" strokeWidth="1.2" />
          </svg>
        );
      case "drift":
        return (
          <svg viewBox="0 0 100 60" className="w-full h-16 opacity-50 hover:opacity-100 transition-opacity">
            <line x1="10" y1="50" x2="90" y2="50" stroke="#333" strokeWidth="1" />
            {/* IEEE-CIS Distribution */}
            <path d="M10,50 Q30,10 50,50" fill="none" stroke="#3b82f6" strokeWidth="1.2" />
            {/* Sparkov Distribution (shifted) */}
            <path d="M40,50 Q60,15 80,50" fill="none" stroke="#00e5ff" strokeWidth="1.2" />
          </svg>
        );
      case "cost":
        return (
          <svg viewBox="0 0 100 60" className="w-full h-16 opacity-50 hover:opacity-100 transition-opacity">
            <line x1="10" y1="50" x2="90" y2="50" stroke="#333" strokeWidth="1" />
            {/* U-Shape Cost Curve */}
            <path d="M15,15 Q50,45 85,15" fill="none" stroke="#22c55e" strokeWidth="1.2" />
            {/* Marker at minimum */}
            <circle cx="50" cy="30" r="2" fill="#ef4444" />
          </svg>
        );
      case "shap":
        return (
          <svg viewBox="0 0 100 60" className="w-full h-16 opacity-50 hover:opacity-100 transition-opacity">
            <line x1="50" y1="5" x2="50" y2="55" stroke="#333" strokeWidth="1" />
            <rect x="50" y="10" width="30" height="6" fill="#ef4444" rx="1" />
            <rect x="25" y="22" width="25" height="6" fill="#22c55e" rx="1" />
            <rect x="50" y="34" width="18" height="6" fill="#ef4444" rx="1" />
            <rect x="40" y="46" width="10" height="6" fill="#22c55e" rx="1" />
          </svg>
        );
      case "rag":
        return (
          <svg viewBox="0 0 100 60" className="w-full h-16 opacity-50 hover:opacity-100 transition-opacity">
            <rect x="10" y="10" width="35" height="15" rx="3" fill="#101010" stroke="#8b5cf6" strokeWidth="0.8" />
            <rect x="55" y="10" width="35" height="15" rx="3" fill="#101010" stroke="#8b5cf6" strokeWidth="0.8" />
            <rect x="32" y="38" width="35" height="15" rx="3" fill="#8b5cf6" opacity="0.4" />
            {/* Connections */}
            <line x1="27" y1="25" x2="50" y2="38" stroke="#333" strokeWidth="0.8" />
            <line x1="72" y1="25" x2="50" y2="38" stroke="#333" strokeWidth="0.8" />
          </svg>
        );
      case "roadmap":
        return (
          <svg viewBox="0 0 100 60" className="w-full h-16 opacity-50 hover:opacity-100 transition-opacity">
            <circle cx="50" cy="30" r="6" fill="#3b82f6" />
            <circle cx="20" cy="15" r="4" fill="#00e5ff" />
            <circle cx="80" cy="15" r="4" fill="#8b5cf6" />
            <circle cx="35" cy="48" r="4" fill="#22c55e" />
            {/* Lines */}
            <line x1="20" y1="15" x2="50" y2="30" stroke="#333" strokeWidth="0.8" />
            <line x1="80" y1="15" x2="50" y2="30" stroke="#333" strokeWidth="0.8" />
            <line x1="35" y1="48" x2="50" y2="30" stroke="#333" strokeWidth="0.8" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <section id="research" className="py-24 px-6 border-t border-white/5 bg-[#080808] relative">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Title */}
        <div className="text-center mb-16">
          <span className="text-[10px] font-mono tracking-[0.2em] text-[#22c55e] uppercase">Scientific Methodologies</span>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-white mt-2">Research Highlights</h2>
          <p className="text-sm text-[#94a3b8] mt-2">
            Apple-style interactive grids highlighting domain shift observations, statistical tests, cost optimizations, and future roadmap directions.
          </p>
        </div>

        {/* Research Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {researchCards.map((card, idx) => (
            <div 
              key={idx}
              onClick={() => setSelectedResearch(card)}
              className="rounded-2xl glass-panel p-6 border border-white/5 hover:border-white/10 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    {card.icon}
                  </div>
                  {/* Mini visual inline chart */}
                  <div className="w-24">
                    {renderMiniChart(card.chartType)}
                  </div>
                </div>
                <h3 className="text-base font-bold font-display text-white mb-1">{card.title}</h3>
                <span className="text-[9px] font-mono text-[#94a3b8] uppercase tracking-wider block mb-3">{card.subtitle}</span>
                <p className="text-xs text-[#cbd5e1] leading-relaxed line-clamp-3">{card.content}</p>
              </div>
              
              {card.stats && (
                <div className="mt-4 pt-3 border-t border-white/5 text-[9px] font-mono text-[#22c55e] font-bold">
                  {card.stats}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Expanded Popup Modal */}
      <AnimatePresence>
        {selectedResearch && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedResearch(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-[600px] rounded-2xl glass-panel p-6 border border-white/10 relative text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedResearch(null)}
                className="absolute top-4 right-4 text-[#94a3b8] hover:text-[#f8fafc] transition-colors p-1"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                  {selectedResearch.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-white">{selectedResearch.title}</h3>
                  <span className="text-[10px] font-mono text-[#94a3b8] tracking-widest uppercase block">{selectedResearch.subtitle}</span>
                </div>
              </div>

              <div className="space-y-4">
                {selectedResearch.stats && (
                  <div className="py-2 px-3 rounded bg-white/5 border border-white/5 text-[10px] font-mono text-[#22c55e] font-semibold">
                    Metric Indicator: {selectedResearch.stats}
                  </div>
                )}

                {selectedResearch.insight && (
                  <div className="p-3 rounded-lg border border-[#3b82f6]/30 bg-[#3b82f6]/5 text-xs text-[#cbd5e1] leading-relaxed">
                    <span className="font-bold text-white block mb-0.5">Key Research Insight:</span>
                    {selectedResearch.insight}
                  </div>
                )}

                <div className="text-xs text-[#cbd5e1] leading-relaxed space-y-2">
                  <span className="font-bold text-white block">Detailed Analysis:</span>
                  <p>{selectedResearch.content}</p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedResearch(null)}
                className="w-full mt-6 py-2.5 bg-white/5 hover:bg-white/10 text-xs font-semibold rounded-xl text-white transition-colors border border-white/5 cursor-pointer"
              >
                Close Document
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
