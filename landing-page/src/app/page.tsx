"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import LiveTransactionStream from "../components/LiveTransactionStream";
import GlowingBrainSphere from "../components/GlowingBrainSphere";
import AIAnalysisLab from "../components/AIAnalysisLab";
import Architecture from "../components/Architecture";
import DashboardShowcase from "../components/DashboardShowcase";
import Performance from "../components/Performance";
import Research from "../components/Research";
import Footer from "../components/Footer";
import LoginModal from "../components/LoginModal";
import SaaSWorkspace from "../components/SaaSWorkspace";
import LoadingScreen from "../components/LoadingScreen";

// Type definitions
interface TechBadge {
  name: string;
  category: "core" | "ml" | "rag" | "infra";
}

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>("Guest Auditor");
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  const handleLaunchWorkspace = () => {
    setShowLoginModal(true);
  };

  const handleLoginSuccess = (role: string) => {
    setUserRole(role);
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // Tech Badge Array
  const techBadges: TechBadge[] = [
    { name: "Python", category: "core" },
    { name: "FastAPI", category: "core" },
    { name: "Streamlit", category: "core" },
    { name: "LightGBM", category: "ml" },
    { name: "CatBoost", category: "ml" },
    { name: "XGBoost", category: "ml" },
    { name: "SHAP", category: "ml" },
    { name: "LangChain", category: "rag" },
    { name: "Gemini AI", category: "rag" },
    { name: "TF-IDF Vector", category: "rag" },
    { name: "Neo4j Graph", category: "infra" },
    { name: "Docker", category: "infra" },
    { name: "Apache Kafka", category: "infra" }
  ];

  if (isLoading && !isLoggedIn) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-[#f8fafc] overflow-x-hidden font-sans">
      
      {isLoggedIn ? (
        // RENDER AUTHENTICATED WORKSPACE PANEL
        <SaaSWorkspace userRole={userRole} onLogout={handleLogout} />
      ) : (
        // RENDER MARKETING & DOCUMENTATION LANDING CHANNELS
        <>
          {/* Floating Glassmorphic Navigation */}
          <Navbar onLaunchClick={handleLaunchWorkspace} />

          {/* Hero Section */}
          <Hero />

          {/* ================= STORY SECTION 1: THE PROBLEM ================= */}
          <section id="product-features" className="py-36 px-6 bg-[#050505] relative text-left">
            {/* Background glowing halo */}
            <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-[#ef4444]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-[1200px] mx-auto space-y-16">
              
              {/* Huge typography statement */}
              <div className="space-y-6 max-w-[900px]">
                <span className="text-[10px] font-mono tracking-[0.2em] text-[#ef4444] uppercase block">The Cost of Invisibility</span>
                <h2 className="text-4xl md:text-7xl font-black font-display tracking-tight text-white leading-[0.95]">
                  Millions of credit card transactions are hijacked. Traditional rule engines fail.
                </h2>
              </div>

              {/* Spacing details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-[#cbd5e1]/70 leading-relaxed font-light text-sm">
                <p>
                  Legacy credit filters split decisions on rigid absolute values. When card usage patterns drift or fraudsters rotate proxy routing servers across border domains, static checks fail. The result is millions in unresolved leakage.
                </p>
                <p>
                  GuardianEye replaces static bounds with a real-time risk stacking pipeline. By checking transaction logs against ensembled ML models and mapping attributes using SHAP game theory, card holds are explained before escalation.
                </p>
              </div>

            </div>
          </section>

          {/* ================= STORY SECTION 2: INGESTION ================= */}
          <LiveTransactionStream />

          {/* ================= STORY SECTION 3: PIPELINE ================= */}
          {/* How GuardianEye Thinks: Reasoning Pipeline */}
          <section className="py-36 px-6 bg-[#050505] relative border-t border-white/5">
            {/* Background glowing halo */}
            <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-[#3b82f6]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              
              {/* Left sticky column */}
              <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
                <span className="text-[10px] font-mono tracking-[0.2em] text-[#3b82f6] uppercase block">Ingestion Trace Pipeline</span>
                <h2 className="text-3xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">
                  How GuardianEye Thinks
                </h2>
                <p className="text-xs text-[#cbd5e1]/60 leading-relaxed font-light">
                  Watch features translate sequentially. As data packets resolve, ensembled tree models compute probabilities, SHAP explains variables push, and RAG retrieves precedent files.
                </p>
              </div>

              {/* Right timeline column */}
              <div className="lg:col-span-7 relative border-l border-white/5 pl-8 space-y-12 text-left">
                {[
                  { title: "1. Transaction Ingestion", desc: "Intercepts raw data points, IP coordinates, and hardware log strings." },
                  { title: "2. Haversine Distance Extraction", desc: "Computes geodesic physical distances and spend velocity indexes." },
                  { title: "3. Isolation Forest Outliers", desc: "Aggregates an unsupervised anomaly index scoring typical pattern deviations." },
                  { title: "4. Stacking Ensemble Scoring", desc: "LightGBM, XGBoost, and CatBoost output votes compiled by a meta-Logistic Regression model." },
                  { title: "5. Local SHAP Log-Odds", desc: "TreeSHAP calculates log-odds attributions showing feature push vectors." },
                  { title: "6. Regulatory Circular Audits", desc: "Compares transaction variables against active RBI compliance circulars." },
                  { title: "7. Hybrid Vector Retrieval", desc: "RAG scan references corresponding banking policies and historical case precedent." },
                  { title: "8. Agent consensus", desc: "Collaborative models (Compliance, Fraud, Risk agents) federate final verdicts." },
                  { title: "9. Dossier Compilation", desc: "A Suspicious Activity Report (SAR) markdown file is exported to the audit cache." }
                ].map((step, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-[#050505] border border-white/10 flex items-center justify-center text-[9px] font-mono font-bold group-hover:border-[#3b82f6] group-hover:text-[#3b82f6] transition-colors timeline-dot">
                      {idx + 1}
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1.5 font-display">{step.title}</h3>
                    <p className="text-xs text-[#cbd5e1]/60 leading-relaxed font-light">{step.desc}</p>
                  </div>
                ))}
              </div>

            </div>
          </section>

          {/* ================= STORY SECTION 4: THE CORE ================= */}
          <section className="py-36 px-6 border-t border-white/5 bg-[#080808]">
            <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
              
              <div className="max-w-[500px] text-left space-y-6">
                <span className="text-[10px] font-mono tracking-[0.2em] text-[#8b5cf6] uppercase block">Model Registry Core</span>
                <h2 className="text-3xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">The AI Core</h2>
                <p className="text-xs text-[#cbd5e1]/70 leading-relaxed font-light">
                  A synchronized mesh layer housing the stacking classifiers, tree attributions explainers, vector database RAG indexes, and regulatory policy nodes. When you modify input variables, the entire pipeline is recalculated.
                </p>
              </div>

              <div className="flex-1 flex justify-center">
                <GlowingBrainSphere />
              </div>

            </div>
          </section>

          {/* ================= STORY SECTION 5: PLAYGROUND ================= */}
          <section id="analysis-lab" className="py-36 border-t border-white/5 bg-[#050505] relative">
            {/* Background glowing halo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#3b82f6]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center mb-12 max-w-xl mx-auto space-y-3">
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#3b82f6] uppercase block">Interactive Diagnostics Playground</span>
              <h2 className="text-3xl font-black font-display text-white">Investigate suspicous events</h2>
              <p className="text-xs text-[#cbd5e1]/60 font-light">
                Use the playground panel below to adjust transaction metrics. Watch ensembled probabilities, compliance codes, and agent opinions recalculate in real-time.
              </p>
            </div>
            <AIAnalysisLab />
          </section>

          {/* ================= STORY SECTION 6: ARCHITECTURE ================= */}
          <Architecture />

          {/* ================= STORY SECTION 7: DEMO LAPTOP ================= */}
          <DashboardShowcase />

          {/* ================= STORY SECTION 8: PERFORMANCE ================= */}
          <Performance />

          {/* ================= STORY SECTION 9: TECH STACK ================= */}
          <section className="py-36 px-6 border-t border-white/5 bg-[#050505] relative">
            {/* Background glowing halo */}
            <div className="absolute top-1/2 right-10 w-96 h-96 bg-[#8b5cf6]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-[800px] mx-auto text-center space-y-6">
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#8b5cf6] uppercase block">Operational Integration Badges</span>
              <h2 className="text-3xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">The Technology Stack</h2>
              <p className="text-xs text-[#cbd5e1]/60 max-w-lg mx-auto leading-relaxed font-light">
                GuardianEye combines open-source modeling engines, vector stores, and deployment infrastructure. Hover over category badges to review scopes.
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                {techBadges.map((tech, idx) => {
                  let borderClass = "border-white/5 hover:border-[#3b82f6] hover:shadow-[0_0_10px_#3b82f6/15]";
                  let colorClass = "text-[#cbd5e1]/70";

                  if (tech.category === "ml") {
                    borderClass = "border-white/5 hover:border-[#00e5ff] hover:shadow-[0_0_10px_rgba(0,229,255,0.1)]";
                    colorClass = "text-[#00e5ff]";
                  } else if (tech.category === "rag") {
                    borderClass = "border-white/5 hover:border-[#8b5cf6] hover:shadow-[0_0_10px_rgba(139,92,246,0.1)]";
                    colorClass = "text-[#8b5cf6]";
                  } else if (tech.category === "infra") {
                    borderClass = "border-white/5 hover:border-[#22c55e] hover:shadow-[0_0_10px_rgba(34,197,94,0.1)]";
                    colorClass = "text-[#22c55e]";
                  }

                  return (
                    <div
                      key={idx}
                      className={`py-2 px-4.5 rounded-xl bg-[#0a0a0a] border text-[11px] font-mono transition-all duration-300 transform hover:scale-102 select-none ${borderClass} ${colorClass}`}
                    >
                      {tech.name}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Scientific Research grid highlighting */}
          <Research />

          {/* ================= STORY SECTION 10: WORKSPACE LAUNCH CTA ================= */}
          <section className="py-36 px-6 bg-[#080808] border-t border-white/5 relative">
            {/* Background glowing halo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3b82f6]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-[760px] mx-auto rounded-3xl glass-panel p-8 md:p-12 border border-white/10 relative text-center space-y-8 shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden">
              {/* Secondary internal glow */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#8b5cf6]/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#3b82f6]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-4 max-w-xl mx-auto">
                <span className="text-[10px] font-mono tracking-[0.2em] text-[#3b82f6] uppercase block">Administrative Control Deck</span>
                <h2 className="text-3xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">
                  Enter the Auditor Workspace
                </h2>
                <p className="text-xs text-[#cbd5e1]/60 leading-relaxed font-light">
                  Authenticate secure sessions to manage pipeline configurations, evaluate active case queues, consult LLM compliance copilots, and extract PDF/Markdown case dossiers.
                </p>
              </div>

              <button
                id="launch-btn-cta"
                onClick={handleLaunchWorkspace}
                className="px-8 py-3.5 rounded-xl bg-white text-black hover:bg-white/90 text-xs font-bold transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2 cursor-pointer mx-auto"
              >
                <span>Launch Workspace Dashboard</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </section>

          {/* Styled platform footer */}
          <Footer />

          {/* Interactive Login Overlay Triggered by Launch demo */}
          {showLoginModal && (
            <LoginModal onLogin={handleLoginSuccess} />
          )}
        </>
      )}

    </div>
  );
}
