"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, User, Lock, ArrowRight } from "lucide-react";

interface LoginModalProps {
  onLogin: (role: string) => void;
}

export default function LoginModal({ onLogin }: LoginModalProps) {
  const [email, setEmail] = useState("auditor@guardianeye.ai");
  const [password, setPassword] = useState("••••••••");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin("Lead Auditor");
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-[420px] rounded-2xl glass-panel p-6 border border-[#3b82f6]/30 shadow-glow relative text-left bg-[#0a0a0a]"
      >
        {/* Decorative background glow */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-[#3b82f6]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-[#8b5cf6]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#3b82f6]/10 border border-[#3b82f6]/30 flex items-center justify-center mb-4 text-[#3b82f6] shadow-glow">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-xl font-bold font-display text-white tracking-tight">Access GuardianEye Workspace</h2>
          <p className="text-xs text-[#94a3b8] mt-1 max-w-[280px]">
            Log in to manage compliance queues, investigate transactions, and query AI agents.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-[#94a3b8] uppercase tracking-wider mb-1.5">Auditor Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/30">
                <User size={13} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#050505] border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-[#3b82f6] transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-[#94a3b8] uppercase tracking-wider mb-1.5">Security Token / Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/30">
                <Lock size={13} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#050505] border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-[#3b82f6] transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-xs font-bold text-white transition-all duration-300 shadow-glow flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Authenticate Secure Session</span>
            <ArrowRight size={13} />
          </button>
        </form>

        <div className="relative my-5 flex items-center justify-center">
          <div className="absolute inset-x-0 h-[1px] bg-white/5" />
          <span className="relative px-3 bg-[#0a0a0a] text-[9px] font-mono text-white/30 uppercase tracking-widest">or</span>
        </div>

        <button
          onClick={() => onLogin("Guest Auditor")}
          className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-white transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Launch Workspace as Guest</span>
        </button>

        <div className="mt-5 text-center text-[10px] font-mono text-[#94a3b8]/40 leading-normal">
          SECURE LOGS INDEXED IN COMPLIANCE AUDIT VAULT
        </div>
      </motion.div>
    </div>
  );
}
