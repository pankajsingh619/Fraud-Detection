"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, FileText, Settings, Cpu, ShieldAlert, CheckCircle, 
  Bell, LogOut, Search, User, Keyboard, Layers, ArrowRight
} from "lucide-react";

import WorkspaceDashboard from "./WorkspaceDashboard";
import CaseExplorer, { Case } from "./CaseExplorer";
import AIAnalysisLab from "./AIAnalysisLab";
import APIPlayground from "./APIPlayground";
import SettingsPanel from "./SettingsPanel";
import CommandPalette from "./CommandPalette";

interface SaaSWorkspaceProps {
  userRole: string;
  onLogout: () => void;
}

export default function SaaSWorkspace({ userRole, onLogout }: SaaSWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedCaseTx, setSelectedCaseTx] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to open Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      
      // Ctrl+Enter to analyze if in lab tab
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        // Trigger alert info or click run button if possible
        alert("Keyboard Shortcut: Analyzing current workspace transaction parameters...");
      }

      // / to focus search
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelectCase = (c: Case) => {
    const txObj = {
      amount: c.amount,
      merchant: c.merchant,
      country: c.country,
      device: c.device,
      timeOfDay: c.timeOfDay,
      spendingPattern: c.spendingPattern,
      velocity: c.velocity,
      ipReputation: c.ipReputation,
      merchantRisk: c.merchantRisk
    };
    setSelectedCaseTx(txObj);
    setActiveTab("lab");
  };

  const applyCommandPreset = (preset: string) => {
    // Inject preset payload
    const defaultFraud = {
      amount: 82000,
      merchant: "Amazon SG",
      country: "Singapore",
      device: "New Device (MacOS)",
      timeOfDay: "Midnight (23:45)",
      spendingPattern: "Sudden High Deviation",
      velocity: "High Velocity (5 txn/hr)",
      ipReputation: "Suspicious Proxy",
      merchantRisk: "High Risk (e-commerce)"
    };
    const defaultClean = {
      amount: 5000,
      merchant: "Local Grocery",
      country: "India",
      device: "Trusted iPhone (iOS 19)",
      timeOfDay: "Morning (08:45)",
      spendingPattern: "Regular Small Spends",
      velocity: "Normal Velocity (1 txn/day)",
      ipReputation: "Clean Residential IP",
      merchantRisk: "Low Risk"
    };

    setSelectedCaseTx(preset === "default_fraud" ? defaultFraud : defaultClean);
    setActiveTab("lab");
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <Layers size={14} /> },
    { id: "explorer", label: "Case Explorer", icon: <FileText size={14} /> },
    { id: "lab", label: "AI Analysis Lab", icon: <Cpu size={14} /> },
    { id: "api", label: "API Sandbox", icon: <Terminal size={14} /> },
    { id: "settings", label: "Settings", icon: <Settings size={14} /> },
  ];

  const recentCases = [
    { id: "Case #1432", name: "Singapore ATO run", detail: "₹82k Amazon SG" },
    { id: "Case #9811", name: "Nigeria crypto drain", detail: "₹150k Binance" },
    { id: "Case #2341", name: "US Walmart shift", detail: "₹35k Walmart" },
  ];

  return (
    <div className="flex h-screen bg-[#050505] text-[#cbd5e1] font-sans overflow-hidden">
      
      {/* Command Palette Keyboard overlay */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(tab) => setActiveTab(tab)}
        onApplyPreset={applyCommandPreset}
      />

      {/* ================= LEFT SIDEBAR ================= */}
      <div className="w-[240px] bg-[#0c0c0c] border-r border-white/5 flex flex-col justify-between p-4 z-30">
        
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2 px-2 pb-2 border-b border-white/5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
            <span className="font-display font-extrabold tracking-widest text-xs text-[#f8fafc]">GUARDIANEYE</span>
          </div>

          {/* Search Trigger box */}
          <div 
            onClick={() => setIsCommandPaletteOpen(true)}
            className="w-full bg-[#101010] border border-white/5 rounded-xl py-2 px-3 flex items-center justify-between text-[#94a3b8]/60 hover:text-white cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <Search size={12} />
              <span>Search...</span>
            </div>
            <div className="flex items-center gap-0.5 text-[8px] font-mono px-1 py-0.5 rounded bg-white/5 border border-white/5">
              <span>Ctrl</span>
              <span>K</span>
            </div>
          </div>

          {/* Main Navigation Links */}
          <div className="space-y-1">
            <span className="text-[8px] font-mono text-white/30 tracking-wider uppercase block px-2 mb-1.5">WORKSPACE LINKS</span>
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === "lab" && !selectedCaseTx) {
                      // Apply default fraud case variables to avoid empty fields
                      applyCommandPreset("default_fraud");
                    }
                  }}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-3.5 transition-all cursor-pointer ${
                    active 
                      ? "bg-[#3b82f6] text-white shadow-glow" 
                      : "text-[#94a3b8] hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Recent Case Logs Sidebar navigation */}
          <div className="space-y-1 pt-3 border-t border-white/5 text-left">
            <span className="text-[8px] font-mono text-white/30 tracking-wider uppercase block px-2 mb-2">RECENT CASE LOGS</span>
            <div className="space-y-1">
              {recentCases.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    // Match mock details for quick load
                    const mockCases: Record<string, Case> = {
                      "Case #1432": {
                        id: "Case #1432", amount: 82000, country: "Singapore", merchant: "Amazon SG",
                        device: "New Device (MacOS)", timeOfDay: "Midnight (23:45)", spendingPattern: "Sudden High Deviation",
                        velocity: "High Velocity (5 txn/hr)", ipReputation: "Suspicious Proxy", merchantRisk: "High Risk (e-commerce)",
                        status: "Under Investigation", riskLevel: "HIGH", anomalyScore: 78
                      },
                      "Case #9811": {
                        id: "Case #9811", amount: 150000, country: "Nigeria", merchant: "Binance Crypto",
                        device: "Unknown Android", timeOfDay: "Morning (09:12)", spendingPattern: "Sudden High Deviation",
                        velocity: "High Velocity (5 txn/hr)", ipReputation: "Suspicious Proxy", merchantRisk: "High Risk (e-commerce)",
                        status: "Resolved", riskLevel: "HIGH", anomalyScore: 92
                      },
                      "Case #2341": {
                        id: "Case #2341", amount: 35000, country: "United States", merchant: "Walmart US",
                        device: "New Device (MacOS)", timeOfDay: "Evening (18:22)", spendingPattern: "Sudden High Deviation",
                        velocity: "Normal Velocity (1 txn/day)", ipReputation: "Clean Residential IP", merchantRisk: "High Risk (e-commerce)",
                        status: "Step-Up Sent", riskLevel: "MEDIUM", anomalyScore: 54
                      }
                    };
                    handleSelectCase(mockCases[c.id]);
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-white/5 group border border-transparent transition-all cursor-pointer block"
                >
                  <div className="flex justify-between items-center text-[10px] font-bold text-white mb-0.5">
                    <span>{c.id}</span>
                    <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#3b82f6]" />
                  </div>
                  <div className="text-[9px] text-[#94a3b8] leading-none">{c.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Auditor Profile Section */}
        <div className="pt-3 border-t border-white/5 flex flex-col gap-2.5 text-left font-mono text-[9px]">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-7 h-7 rounded-lg bg-[#3b82f6]/15 border border-[#3b82f6]/30 flex items-center justify-center text-[#3b82f6]">
              <User size={14} />
            </div>
            <div>
              <div className="font-bold text-white text-[10px]">{userRole}</div>
              <div className="text-white/40">auditor@guardianeye.ai</div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-[#ef4444] border border-red-500/10 hover:border-red-500/20 text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut size={12} />
            <span>Logout session</span>
          </button>
        </div>

      </div>

      {/* ================= MAIN PANEL ================= */}
      <div className="flex-grow flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-14 bg-[#0a0a0a] border-b border-white/5 px-6 flex justify-between items-center z-20 shrink-0">
          {/* Global search trigger */}
          <div 
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center gap-2 text-xs text-[#94a3b8] hover:text-white cursor-pointer transition-colors font-mono"
          >
            <Search size={14} />
            <span>Search Case Files (Ctrl+K)</span>
          </div>

          {/* Right widgets */}
          <div className="flex items-center gap-4">
            
            {/* Shortcuts help */}
            <div className="hidden sm:flex items-center gap-1.5 text-[9px] font-mono text-white/30 border border-white/5 rounded-lg px-2 py-1">
              <Keyboard size={12} />
              <span>Ctrl+Enter (Analyze)</span>
            </div>

            {/* Notification bell dropdown trigger */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-white flex items-center justify-center cursor-pointer relative"
              >
                <Bell size={14} />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#ef4444]" />
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-[280px] rounded-xl glass-panel border border-white/10 p-3 shadow-2xl font-mono text-[9px] text-[#cbd5e1] space-y-2.5 z-40 bg-[#0a0a0a]"
                  >
                    <div className="text-white/40 border-b border-white/5 pb-1 flex justify-between items-center">
                      <span>AUDIT ALERTS QUEUE</span>
                      <span className="text-[#ef4444] font-bold">3 ALERTS</span>
                    </div>

                    <div className="space-y-2">
                      <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-[#ef4444]">
                        <span className="font-bold block mb-0.5">⚠️ CRITICAL: HIGH RISK DETECTED</span>
                        TX-98423 (Nigeria Binance) flagged 98.4%. Immediate action requested.
                      </div>
                      <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500">
                        <span className="font-bold block mb-0.5">⚠️ ALERT: FEATURE DRIFT</span>
                        Covariate drift index on transaction amounts exceeds 0.85 PSI thresholds.
                      </div>
                      <div className="p-2 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e]">
                        <span className="font-bold block mb-0.5">🟢 INFO: STEP-UP COMPLETE</span>
                        Case #2341 verified successfully via OTP step-up MFA challenge.
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* Tab Panel contents view */}
        <main className="flex-grow p-6 overflow-y-auto bg-[#050505] relative">
          <div className="max-w-[1200px] mx-auto">
            {activeTab === "dashboard" && <WorkspaceDashboard />}
            {activeTab === "explorer" && <CaseExplorer onSelectCase={handleSelectCase} />}
            {activeTab === "lab" && <AIAnalysisLab preselectedTx={selectedCaseTx} />}
            {activeTab === "api" && <APIPlayground />}
            {activeTab === "settings" && <SettingsPanel />}
          </div>
        </main>

      </div>

    </div>
  );
}
