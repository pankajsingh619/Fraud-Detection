"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Layers, FileText, Cpu, Settings, LogOut, Search, User, 
  ArrowRight, ShieldAlert, Cpu as AI, Send, Check, Copy, Sparkles, BookOpen
} from "lucide-react";
import LoginModal from "./LoginModal";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>("Guest Auditor");
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // AI Copilot States
  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "copilot"; text: string }>>([
    { role: "copilot", text: "System calibrated. I am GuardianEye AI Copilot. Ask me to explain a fraud case, summarize audit findings, or generate compliance reports." }
  ]);
  const [isCopilotTyping, setIsCopilotTyping] = useState<boolean>(false);
  const [showCopilot, setShowCopilot] = useState<boolean>(true);

  // Check auth status on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = sessionStorage.getItem("isLoggedIn") === "true";
      const role = sessionStorage.getItem("userRole") || "Lead Auditor";
      setIsLoggedIn(auth);
      setUserRole(role);
      if (!auth) {
        setShowLoginModal(true);
      }
    }
  }, []);

  const handleLoginSuccess = (role: string) => {
    setIsLoggedIn(true);
    setUserRole(role);
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("userRole", role);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("userRole");
    router.push("/");
  };

  const handleSendChat = (text: string) => {
    if (!text.trim()) return;
    
    // Add user message
    const updated = [...chatMessages, { role: "user" as const, text }];
    setChatMessages(updated);
    setChatInput("");
    setIsCopilotTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      let responseText = "";
      const textLower = text.toLowerCase();
      
      if (textLower.includes("explain") || textLower.includes("why")) {
        responseText = "TX-98412 is flagged HIGH RISK (96.8% probability) primarily due to (1) high spending deviation (14.5x average limits), (2) geographic shift to Singapore, and (3) proxy network headers mismatch. Checked and validated by the Evidence Validator agent.";
      } else if (textLower.includes("similar") || textLower.includes("case")) {
        responseText = "Retrieval match: Correlation with Case #1432 (Singapore Amazon ATO cluster) is 82.0% similar. Both share unverified Safari signatures, occur at midnight, and target cross-border e-commerce gateways.";
      } else if (textLower.includes("report") || textLower.includes("generate")) {
        responseText = "Case report compiled. Layout generated strictly following (1) Executive Summary -> (2) Prediction -> (3) Evidence -> (4) Retrieved Documents -> (5) Compliance -> (6) Explainability -> (7) Consensus -> (8) Recommendation -> (9) Validation. Click 'Download Markdown' in the Investigations Lab to export.";
      } else if (textLower.includes("compliance") || textLower.includes("rbi")) {
        responseText = "Audit result: High-value transaction above ₹50,000 threshold triggers RBI Guidelines Section 7.2. Multi-factor challenge step-up is mandatory. Non-compliance shifts liability to the gateway provider.";
      } else {
        responseText = `GuardianEye AI Copilot has reviewed your query: "${text}". I can confirm that active Stacking predictions, local SHAP attributions, and compliance guidelines [RBI_RULE_7_2] support a HOLD & STEP-UP action.`;
      }

      setChatMessages(prev => [...prev, { role: "copilot" as const, text: responseText }]);
      setIsCopilotTyping(false);
    }, 1000);
  };

  const sidebarLinks = [
    { id: "dashboard", label: "Dashboard Workspace", path: "/workspace", icon: <Layers size={14} /> },
    { id: "investigations", label: "Investigations Lab", path: "/investigations", icon: <Cpu size={14} /> },
    { id: "analytics", label: "Model Diagnostics", path: "/analytics", icon: <FileText size={14} /> },
    { id: "documentation", label: "Developer Docs", path: "/documentation", icon: <BookOpen size={14} /> },
  ];

  return (
    <div className="flex h-screen w-screen bg-[#050505] text-[#cbd5e1] font-sans overflow-hidden">
      
      {/* MOCK AUTH LOGIN MODAL ON GUEST MODE BLOCK */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => {
          // If close without login, send back to home page
          if (!isLoggedIn) {
            router.push("/");
          }
        }} 
        onLogin={handleLoginSuccess} 
      />

      {isLoggedIn && (
        <>
          {/* ================= LEFT SIDEBAR ================= */}
          <aside className="w-[240px] bg-[#080808] border-r border-white/5 flex flex-col justify-between p-4 z-30 shrink-0 select-none">
            <div className="space-y-6">
              {/* Logo */}
              <div 
                onClick={() => router.push("/")}
                className="flex items-center gap-2 px-2 pb-2 border-b border-white/5 cursor-pointer hover:opacity-80 transition-opacity text-left"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]" />
                <span className="font-display font-extrabold tracking-widest text-xs text-[#f8fafc]">GUARDIANEYE</span>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1 text-left">
                <span className="text-[8px] font-mono text-white/30 tracking-wider uppercase block px-2 mb-1.5">WORKSPACE NAVIGATION</span>
                {sidebarLinks.map((link) => {
                  const active = pathname === link.path;
                  return (
                    <button
                      key={link.id}
                      onClick={() => router.push(link.path)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-3.5 transition-all duration-200 cursor-pointer ${
                        active 
                          ? "bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white shadow-glow" 
                          : "text-[#94a3b8] hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Profile & Logout */}
            <div className="pt-3 border-t border-white/5 flex flex-col gap-2.5 text-left font-mono text-[9px]">
              <div className="flex items-center gap-2.5 px-1">
                <div className="w-7 h-7 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center text-[#3b82f6]">
                  <User size={12} />
                </div>
                <div>
                  <div className="font-bold text-white text-[10px] truncate max-w-[130px]">{userRole}</div>
                  <div className="text-white/40">auditor@guardianeye.ai</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-[#ef4444] border border-red-500/10 hover:border-red-500/20 text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut size={12} />
                <span>Logout session</span>
              </button>
            </div>
          </aside>

          {/* ================= CENTER WORKSPACE PANEL ================= */}
          <main className="flex-grow flex flex-col overflow-hidden relative">
            <div className="flex-grow overflow-y-auto no-scrollbar relative p-6">
              {children}
            </div>
          </main>

          {/* ================= RIGHT AI COPILOT PANEL ================= */}
          {showCopilot && (
            <aside className="w-[300px] bg-[#080808] border-l border-white/5 flex flex-col justify-between shrink-0 z-30 select-none">
              
              {/* Copilot Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-[#00e5ff]" />
                  <span className="font-display font-extrabold text-[10px] text-white uppercase tracking-wider">GuardianEye Copilot</span>
                </div>
                <div className="flex items-center gap-1 bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] px-1.5 py-0.5 rounded text-[8px] font-mono">
                  <span className="w-1 h-1 rounded-full bg-[#22c55e] animate-pulse" />
                  <span>AI Active</span>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-grow overflow-y-auto p-4 space-y-4 no-scrollbar text-left font-sans">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`space-y-1 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                    <span className="text-[8px] font-mono text-white/30 tracking-wider block">
                      {msg.role === "user" ? "AUDITOR" : "COPILOT"}
                    </span>
                    <div className={`p-3 rounded-2xl text-[10px] leading-relaxed max-w-[90%] inline-block text-left ${
                      msg.role === "user" 
                        ? "bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-white rounded-tr-none" 
                        : "bg-[#101010] border border-white/5 text-[#cbd5e1] rounded-tl-none"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isCopilotTyping && (
                  <div className="space-y-1">
                    <span className="text-[8px] font-mono text-white/30 tracking-wider block">COPILOT</span>
                    <div className="p-3 rounded-2xl bg-[#101010] border border-white/5 text-[10px] text-[#cbd5e1] rounded-tl-none inline-block">
                      <span className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-[#cbd5e1] animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1 h-1 rounded-full bg-[#cbd5e1] animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1 h-1 rounded-full bg-[#cbd5e1] animate-bounce" />
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Prompt Shortcuts & Text Input */}
              <div className="p-4 border-t border-white/5 space-y-3">
                <div className="space-y-1.5">
                  <span className="text-[8px] font-mono text-white/30 uppercase tracking-wider block text-left">Quick Prompts</span>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { label: "Explain prediction", query: "Explain this prediction details" },
                      { label: "Find similar cases", query: "Find similar fraud cases in database" },
                      { label: "Summarize case", query: "Summarize this case investigation" },
                      { label: "Compliance audit", query: "Show applicable RBI Section 7.2 compliance details" }
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendChat(p.query)}
                        className="px-2 py-1 rounded bg-[#101010] border border-white/5 hover:border-[#3b82f6] text-white/60 hover:text-white text-[8px] font-mono transition-colors cursor-pointer"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text input area */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendChat(chatInput);
                  }}
                  className="relative flex items-center"
                >
                  <input 
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask Copilot..."
                    className="w-full bg-[#101010] border border-white/5 focus:border-[#3b82f6] rounded-xl pl-3 pr-9 py-2 text-[10px] text-white font-mono focus:outline-none placeholder-white/20 transition-colors"
                  />
                  <button 
                    type="submit"
                    className="absolute right-1 px-2 py-1.5 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[#3b82f6] hover:bg-[#3b82f6]/20 transition-colors cursor-pointer"
                  >
                    <Send size={10} />
                  </button>
                </form>
              </div>

            </aside>
          )}
        </>
      )}

    </div>
  );
}
