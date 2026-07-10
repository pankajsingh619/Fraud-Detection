"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cpu, FileText, Info, Layers, RefreshCw } from "lucide-react";

interface NodeDetails {
  title: string;
  purpose: string;
  technology: string;
  output: string;
  color: string;
}

export default function Architecture() {
  const [selectedNode, setSelectedNode] = useState<NodeDetails | null>(null);

  const nodeMap: Record<string, NodeDetails> = {
    nextjs: {
      title: "Next.js SaaS Auditor Workspace",
      purpose: "Serves as the administrative control deck. Provides transaction editors, timeline tracers, telemetry cards, and API playground sandboxes.",
      technology: "Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion.",
      output: "Glassmorphic interfaces displaying risk ratings, SHAP coefficients, and compliance dossiers.",
      color: "border-[#3b82f6]/40 text-[#3b82f6]"
    },
    fastapi: {
      title: "FastAPI Backend API Layer",
      purpose: "Exposes asynchronous endpoints under v1 routes, executing model predictions and database session tasks.",
      technology: "Python, Uvicorn, Asynchronous execution loops, Pydantic data schemas.",
      output: "JSON response payloads containing model class probabilities, SHAP vectors, and compliance checklists.",
      color: "border-[#3b82f6]/40 text-[#3b82f6]"
    },
    core: {
      title: "GuardianEye Core Orchestrator",
      purpose: "Coordinates transactional evaluations: runs feature scaling, passes features to ensembled trees, triggers compliance, and fetches database indices.",
      technology: "Modular Pipeline framework, sequential routing triggers.",
      output: "Structured transaction context dict routed to SHAP explainer and multi-agent loops.",
      color: "border-[#8b5cf6]/40 text-[#8b5cf6]"
    },
    ml: {
      title: "Stacking Classifier Ensemble",
      purpose: "Aggregates predictions from baseline estimators (LightGBM, XGBoost, CatBoost) via a Logistic Regression meta-learner.",
      technology: "Scikit-Learn StackingClassifier, LightGBM, CatBoostClassifier, XGBClassifier.",
      output: "Standardized risk probability ratio and Isolation Forest unsupervised anomaly rating.",
      color: "border-[#3b82f6]/40 text-[#3b82f6]"
    },
    shap: {
      title: "SHAP Explainer (Explainability)",
      purpose: "Quantifies game-theoretic feature attributions, explaining the positive or negative log-odds push of transaction dimensions.",
      technology: "TreeSHAP attribution, local explainability caching.",
      output: "Float contribution metrics mapping feature vectors to fraud risk indicators.",
      color: "border-[#00e5ff]/40 text-[#00e5ff]"
    },
    rag: {
      title: "TF-IDF Lexical Retriever",
      purpose: "Queries indexed folders containing policies and historical logs using lexical keyword metrics.",
      technology: "TF-IDF sparse search, Cosine Similarity matching (dense embeddings planned).",
      output: "Matched regulatory directives and historical case summaries.",
      color: "border-[#8b5cf6]/40 text-[#8b5cf6]"
    },
    rules: {
      title: "RBI Compliance Rules Engine",
      purpose: "Validates transaction attributes against regulatory constraints and internal bank limits (e.g. ₹50k caps).",
      technology: "Deterministic limits checker, RBI Section 7.2 guideline schemas.",
      output: "Boolean violation triggers, MFA challenges, and audit warnings.",
      color: "border-[#22c55e]/40 text-[#22c55e]"
    },
    vector_db: {
      title: "Compliance Vector Stores",
      purpose: "Retrieves contextually relevant regulatory guidelines and historical audit reports.",
      technology: "In-memory document index, metadata-filtered lexical vector weights.",
      output: "Target compliance directives matching transaction features.",
      color: "border-[#8b5cf6]/40 text-[#8b5cf6]"
    },
    dossier: {
      title: "Executive SAR Dossier Generator",
      purpose: "Compiles markdown investigation reports detailing risk verdicts, compliance violations, and agent notes.",
      technology: "Unified templating engine, export download hooks (Markdown/PDF/JSON/CSV).",
      output: "Audit-ready markdown case files and downloadable datasets.",
      color: "border-[#22c55e]/40 text-[#22c55e]"
    }
  };

  return (
    <section id="architecture" className="py-32 px-6 bg-[#080808] relative text-left">
      {/* Glow Halo */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#00e5ff]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left column: Text */}
        <div className="lg:col-span-4 space-y-6">
          <span className="text-[10px] font-mono tracking-[0.2em] text-[#00e5ff] uppercase block">Platform Topology Map</span>
          <h2 className="text-3xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">
            Pipeline Architecture
          </h2>
          <p className="text-xs text-[#cbd5e1]/60 leading-relaxed font-light">
            GuardianEye routes transaction inputs through a distributed system. Click on any architecture node to inspect its tech stack, functional role, and output interfaces.
          </p>
          <div className="p-3 bg-[#0a0a0a] rounded-xl border border-white/5 text-[9px] font-mono text-white/40 leading-relaxed">
            <span className="font-bold text-[#00e5ff] block mb-1">Interactive Node Map:</span>
            Moving packets represent active JSON API signals shifting between backend estimators.
          </div>
        </div>

        {/* Right column: Interactive SVG node map with moving packets */}
        <div className="lg:col-span-8 w-full rounded-2xl glass-panel p-6 border border-white/5 overflow-x-auto no-scrollbar relative">
          <svg viewBox="0 0 800 350" className="w-full min-w-[700px] h-[300px]">
            <defs>
              <linearGradient id="bluePurple" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <filter id="svgGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Connecting Paths */}
            {/* Nextjs -> FastAPI */}
            <path id="path_next_api" d="M120,175 L200,175" fill="none" stroke="#161616" strokeWidth="2" />
            <path d="M120,175 L200,175" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4,4" className="opacity-50" />

            {/* FastAPI -> Core */}
            <path id="path_api_core" d="M300,175 L380,175" fill="none" stroke="#161616" strokeWidth="2" />
            <path d="M300,175 L380,175" fill="none" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="4,4" className="opacity-50" />

            {/* Core -> ML/SHAP/RAG/Rules */}
            <path id="path_core_ml" d="M480,175 L560,95" fill="none" stroke="#161616" strokeWidth="1.5" />
            <path id="path_core_shap" d="M480,175 L560,145" fill="none" stroke="#161616" strokeWidth="1.5" />
            <path id="path_core_rag" d="M480,175 L560,205" fill="none" stroke="#161616" strokeWidth="1.5" />
            <path id="path_core_rules" d="M480,175 L560,255" fill="none" stroke="#161616" strokeWidth="1.5" />

            <path d="M480,175 L560,95" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,3" className="opacity-40" />
            <path d="M480,175 L560,145" fill="none" stroke="#00e5ff" strokeWidth="1" strokeDasharray="3,3" className="opacity-40" />
            <path d="M480,175 L560,205" fill="none" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="3,3" className="opacity-40" />
            <path d="M480,175 L560,255" fill="none" stroke="#22c55e" strokeWidth="1" strokeDasharray="3,3" className="opacity-40" />

            {/* RAG -> Vector DB */}
            <path id="path_rag_db" d="M680,205 L720,205" fill="none" stroke="#161616" strokeWidth="1.5" />
            {/* Rules -> Dossier */}
            <path id="path_rules_dossier" d="M680,255 L720,255" fill="none" stroke="#161616" strokeWidth="1.5" />

            {/* Moving Packets (Data flow animation) */}
            <circle r="3.5" fill="#3b82f6" filter="url(#svgGlow)">
              <animateMotion dur="2.5s" repeatCount="indefinite">
                <mpath href="#path_next_api" />
              </animateMotion>
            </circle>

            <circle r="3.5" fill="#8b5cf6" filter="url(#svgGlow)">
              <animateMotion dur="2.5s" repeatCount="indefinite">
                <mpath href="#path_api_core" />
              </animateMotion>
            </circle>

            <circle r="2.5" fill="#3b82f6">
              <animateMotion dur="3s" repeatCount="indefinite">
                <mpath href="#path_core_ml" />
              </animateMotion>
            </circle>
            <circle r="2.5" fill="#00e5ff">
              <animateMotion dur="3.2s" repeatCount="indefinite">
                <mpath href="#path_core_shap" />
              </animateMotion>
            </circle>
            <circle r="2.5" fill="#8b5cf6">
              <animateMotion dur="3.5s" repeatCount="indefinite">
                <mpath href="#path_core_rag" />
              </animateMotion>
            </circle>
            <circle r="2.5" fill="#22c55e">
              <animateMotion dur="2.8s" repeatCount="indefinite">
                <mpath href="#path_core_rules" />
              </animateMotion>
            </circle>

            {/* Nodes */}
            {/* Next.js Workspace */}
            <g onClick={() => setSelectedNode(nodeMap.nextjs)} className="cursor-pointer group">
              <rect x="20" y="150" width="100" height="50" rx="10" fill="#0a0a0a" stroke="#3b82f6" strokeWidth="1.5" className="group-hover:stroke-white transition-colors" />
              <text x="70" y="174" fill="white" fontSize="9" textAnchor="middle" fontWeight="bold" fontFamily="monospace">Next.js</text>
              <text x="70" y="186" fill="white" fontSize="8" textAnchor="middle" fontFamily="monospace">Workspace</text>
            </g>

            {/* FastAPI */}
            <g onClick={() => setSelectedNode(nodeMap.fastapi)} className="cursor-pointer group">
              <rect x="200" y="150" width="100" height="50" rx="10" fill="#0a0a0a" stroke="#3b82f6" strokeWidth="1.5" className="group-hover:stroke-white transition-colors" />
              <text x="250" y="174" fill="white" fontSize="9" textAnchor="middle" fontWeight="bold" fontFamily="monospace">FastAPI</text>
              <text x="250" y="186" fill="white" fontSize="8" textAnchor="middle" fontFamily="monospace">Backend API</text>
            </g>

            {/* GuardianEye Core */}
            <g onClick={() => setSelectedNode(nodeMap.core)} className="cursor-pointer group">
              <rect x="380" y="140" width="100" height="70" rx="12" fill="url(#bluePurple)" filter="url(#svgGlow)" />
              <text x="430" y="175" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">GuardianEye</text>
              <text x="430" y="188" fill="white" fontSize="8" textAnchor="middle" fontFamily="monospace">Core Orchestrator</text>
            </g>

            {/* ML Stacking */}
            <g onClick={() => setSelectedNode(nodeMap.ml)} className="cursor-pointer group">
              <rect x="560" y="75" width="120" height="40" rx="8" fill="#0a0a0a" stroke="#3b82f6" strokeWidth="1" />
              <text x="620" y="99" fill="white" fontSize="8" textAnchor="middle" fontFamily="monospace">Stacking Ensemble</text>
            </g>

            {/* SHAP Explainer */}
            <g onClick={() => setSelectedNode(nodeMap.shap)} className="cursor-pointer group">
              <rect x="560" y="125" width="120" height="40" rx="8" fill="#0a0a0a" stroke="#00e5ff" strokeWidth="1" />
              <text x="620" y="149" fill="white" fontSize="8" textAnchor="middle" fontFamily="monospace">SHAP Explainer</text>
            </g>

            {/* TF-IDF Search */}
            <g onClick={() => setSelectedNode(nodeMap.rag)} className="cursor-pointer group">
              <rect x="560" y="175" width="120" height="40" rx="8" fill="#0a0a0a" stroke="#8b5cf6" strokeWidth="1" />
              <text x="620" y="199" fill="white" fontSize="8" textAnchor="middle" fontFamily="monospace">TF-IDF Search</text>
            </g>

            {/* Compliance Rules */}
            <g onClick={() => setSelectedNode(nodeMap.rules)} className="cursor-pointer group">
              <rect x="560" y="225" width="120" height="40" rx="8" fill="#0a0a0a" stroke="#22c55e" strokeWidth="1" />
              <text x="620" y="249" fill="white" fontSize="8" textAnchor="middle" fontFamily="monospace">Compliance Rules</text>
            </g>

            {/* Vector DB */}
            <g onClick={() => setSelectedNode(nodeMap.vector_db)} className="cursor-pointer group">
              <rect x="710" y="185" width="70" height="40" rx="8" fill="#0a0a0a" stroke="#8b5cf6" strokeWidth="1" />
              <text x="745" y="209" fill="white" fontSize="8" textAnchor="middle" fontFamily="monospace">Vector DB</text>
            </g>

            {/* Dossier File */}
            <g onClick={() => setSelectedNode(nodeMap.dossier)} className="cursor-pointer group">
              <rect x="710" y="235" width="70" height="40" rx="8" fill="#0a0a0a" stroke="#22c55e" strokeWidth="1.5" />
              <text x="745" y="259" fill="white" fontSize="8" textAnchor="middle" fontFamily="monospace">SAR Dossier</text>
            </g>
          </svg>
        </div>

      </div>

      {/* Slide-in Modal for Node Explanations */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedNode(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className={`w-full max-w-[500px] rounded-2xl glass-panel p-6 border ${selectedNode.color} relative text-left`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedNode(null)}
                className="absolute top-4 right-4 text-[#94a3b8] hover:text-[#f8fafc] transition-colors p-1 cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-white">
                  <Info size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold font-display text-white">{selectedNode.title}</h3>
                  <span className="text-[9px] font-mono tracking-widest uppercase text-[#94a3b8]">Component Audit Blueprint</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-3.5 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-white/50 block mb-1">Purpose & Role</span>
                  <p className="text-xs text-[#cbd5e1] leading-relaxed">{selectedNode.purpose}</p>
                </div>

                <div className="p-3.5 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-[#3b82f6] block mb-1">Technical Stack</span>
                  <p className="text-xs text-[#cbd5e1] leading-relaxed font-mono">{selectedNode.technology}</p>
                </div>

                <div className="p-3.5 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-[#22c55e] block mb-1">Output Interface</span>
                  <p className="text-xs text-[#cbd5e1] leading-relaxed font-mono">{selectedNode.output}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedNode(null)}
                className="w-full mt-6 py-2.5 bg-white/5 hover:bg-white/10 text-xs font-semibold rounded-xl text-white transition-colors border border-white/5 cursor-pointer"
              >
                Audit Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
