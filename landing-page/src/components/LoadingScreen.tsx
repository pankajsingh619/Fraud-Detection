"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);

  const stages = [
    "Initializing GuardianEye Kernel...",
    "Loading Stacking ML Models...",
    "Connecting Qdrant Vector DB...",
    "Preparing Multi-Agent RAG consensus...",
    "System Ready"
  ];

  // Tick progress bar
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    return () => clearInterval(progressInterval);
  }, []);

  // Cycle text stages
  useEffect(() => {
    if (stage < stages.length - 1) {
      const stageTimeout = setTimeout(() => {
        setStage((prev) => prev + 1);
      }, 700);
      return () => clearTimeout(stageTimeout);
    } else if (progress >= 100) {
      const exitTimeout = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(exitTimeout);
    }
  }, [stage, progress, onComplete]);

  // Fallback trigger if progress loads faster than stage index
  useEffect(() => {
    if (progress >= 100 && stage < stages.length - 1) {
      setStage(stages.length - 1);
    }
  }, [progress, stage]);

  return (
    <div className="fixed inset-0 bg-[#050505] z-50 flex flex-col items-center justify-center font-mono">
      {/* Glow Halo */}
      <div className="absolute w-80 h-80 bg-[#3b82f6]/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex flex-col items-center max-w-[360px] w-full px-6 text-center space-y-8"
      >
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#3b82f6] shadow-[0_0_15px_rgba(59,130,246,0.15)]">
          <ShieldCheck size={24} className="animate-pulse" />
        </div>

        <div className="space-y-2 w-full text-center">
          <span className="text-[10px] text-white/40 uppercase tracking-widest block">SYSTEM INGESTION INITIALIZER</span>
          <span className="text-white text-xs block h-5 transition-all duration-300">
            {stages[stage]}
          </span>
        </div>

        {/* Progress bar container */}
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative border border-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-[#3b82f6] via-[#8b5cf6] to-[#00e5ff]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-[10px] text-white/30 tracking-wider">
          LOADING: {progress}%
        </span>
      </motion.div>
    </div>
  );
}
