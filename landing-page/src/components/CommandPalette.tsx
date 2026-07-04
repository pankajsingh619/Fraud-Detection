"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Terminal, FileText, Settings, ShieldAlert, Cpu, Keyboard } from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onApplyPreset: (preset: string) => void;
}

export default function CommandPalette({ isOpen, onClose, onNavigate, onApplyPreset }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const commands = [
    { name: "Go to Analytics Dashboard", category: "Navigation", icon: <Terminal size={14} />, action: () => onNavigate("dashboard"), shortcut: "G + D" },
    { name: "Go to Case Explorer", category: "Navigation", icon: <FileText size={14} />, action: () => onNavigate("explorer"), shortcut: "G + E" },
    { name: "Go to AI Analysis Lab", category: "Navigation", icon: <Cpu size={14} />, action: () => onNavigate("lab"), shortcut: "G + L" },
    { name: "Go to API Playground", category: "Navigation", icon: <Terminal size={14} />, action: () => onNavigate("api"), shortcut: "G + A" },
    { name: "Go to Workspace Settings", category: "Navigation", icon: <Settings size={14} />, action: () => onNavigate("settings"), shortcut: "G + S" },
    { name: "Load Target Alert Scenario", category: "Presets", icon: <ShieldAlert size={14} className="text-[#ef4444]" />, action: () => onApplyPreset("default_fraud"), shortcut: "P + T" },
    { name: "Load Clean Slate Scenario", category: "Presets", icon: <Cpu size={14} className="text-[#22c55e]" />, action: () => onApplyPreset("normal_velocity"), shortcut: "P + C" },
  ];

  const filtered = commands.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            className="w-full max-w-[560px] rounded-2xl glass-panel border border-white/10 shadow-2xl overflow-hidden bg-[#0c0c0c]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input header */}
            <div className="p-4 border-b border-white/5 flex items-center gap-3">
              <Search size={16} className="text-[#94a3b8]" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or navigation..."
                className="w-full bg-transparent border-none text-xs text-white focus:outline-none placeholder-white/35 font-sans"
              />
              <Keyboard size={14} className="text-[#94a3b8] opacity-50" />
            </div>

            {/* List */}
            <div className="max-h-[300px] overflow-y-auto p-2 no-scrollbar">
              {filtered.length > 0 ? (
                <div className="space-y-1">
                  {filtered.map((cmd, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        cmd.action();
                        onClose();
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-white/5 text-left flex items-center justify-between text-xs text-[#cbd5e1] hover:text-white transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[#94a3b8] group-hover:text-white transition-colors">{cmd.icon}</span>
                        <span>{cmd.name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] text-white/40 font-mono tracking-wide">
                          {cmd.category}
                        </span>
                      </div>
                      <span className="font-mono text-[9px] text-[#cbd5e1]/40">{cmd.shortcut}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-[#cbd5e1]/40 font-mono">
                  No matching commands found.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-[#050505] p-3 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-white/30 px-4">
              <span>Use arrows to navigate, Enter to select</span>
              <span>ESC to close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
