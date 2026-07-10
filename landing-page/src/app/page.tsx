"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, AlertTriangle, Layers, Cpu, Server, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import LiveTransactionStream from "../components/LiveTransactionStream";
import GlowingBrainSphere from "../components/GlowingBrainSphere";
import DashboardShowcase from "../components/DashboardShowcase";
import Performance from "../components/Performance";
import Footer from "../components/Footer";
import LoginModal from "../components/LoginModal";

export default function Home() {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  const handleLaunchWorkspace = () => {
    if (sessionStorage.getItem("isLoggedIn") === "true") {
      router.push("/workspace");
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = (role: string) => {
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("userRole", role);
    setShowLoginModal(false);
    router.push("/workspace");
  };

  const techBadges = [
    { name: "Python", category: "core" },
    { name: "FastAPI", category: "core" },
    { name: "Streamlit", category: "core" },
    { name: "LightGBM", category: "ml" },
    { name: "CatBoost", category: "ml" },
    { name: "XGBoost", category: "ml" },
    { name: "SHAP Explainer", category: "ml" },
    { name: "Gemini AI", category: "rag" },
    { name: "TF-IDF Vector", category: "rag" },
    { name: "PostgreSQL", category: "infra" },
    { name: "Docker Compose", category: "infra" },
    { name: "Redis Cache", category: "infra" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-[#f8fafc] overflow-x-hidden font-sans">
      
      {/* Navbar visible immediately */}
      <Navbar onLaunchClick={handleLaunchWorkspace} forceVisible={true} />

      {/* Hero Section */}
      <Hero />

      {/* Inbound Live Transaction stream */}
      <LiveTransactionStream />

      {/* ================= STORY SECTION 1: THE PROBLEM ================= */}
      <section className="py-36 px-6 bg-[#050505] relative text-left">
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-[#ef4444]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1200px] mx-auto space-y-16">
          <div className="space-y-6 max-w-[900px]">
            <span className="text-[10px] font-mono tracking-[0.2em] text-[#ef4444] uppercase block">The Cost of Invisibility</span>
            <h2 className="text-4xl md:text-7xl font-black font-display tracking-tight text-white leading-[0.95]">
              Millions of credit card transactions are hijacked. Traditional rule engines fail.
            </h2>
          </div>

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

      {/* ================= STORY SECTION 2: PIPELINE TIMELINE ================= */}
      <section className="py-36 px-6 bg-[#050505] relative border-t border-white/5">
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-[#3b82f6]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6 text-left">
            <span className="text-[10px] font-mono tracking-[0.2em] text-[#3b82f6] uppercase block">Ingestion Trace Pipeline</span>
            <h2 className="text-3xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">
              How GuardianEye Thinks
            </h2>
            <p className="text-xs text-[#cbd5e1]/60 leading-relaxed font-light">
              Watch features translate sequentially. As data packets resolve, ensembled tree models compute probabilities, SHAP explains variables push, and TF-IDF retrieves precedent files.
            </p>
          </div>

          <div className="lg:col-span-7 relative border-l border-white/5 pl-8 space-y-12 text-left">
            {[
              { title: "1. Transaction Ingestion", desc: "Intercepts raw data points, IP coordinates, and hardware log strings." },
              { title: "2. Haversine Distance Extraction", desc: "Computes geodesic physical distances and spend velocity indexes." },
              { title: "3. Isolation Forest Outliers", desc: "Aggregates an unsupervised anomaly index scoring typical pattern deviations." },
              { title: "4. Stacking Ensemble Scoring", desc: "LightGBM, XGBoost, and CatBoost output votes compiled by a meta-Logistic Regression model." },
              { title: "5. Local SHAP Log-Odds", desc: "TreeSHAP calculates log-odds attributions showing feature push vectors." },
              { title: "6. Regulatory Circular Audits", desc: "Compares transaction variables against active RBI compliance circulars." },
              { title: "7. TF-IDF Lexical Retrieval", desc: "TF-IDF search extracts relevant guidelines and similar historical case patterns from local compliance catalog files." },
              { title: "8. Multi-Agent & Evidence Validation Check", desc: "Cooperative agents (Fraud, Compliance, Risk, Case Investigator) federate opinions, validated by the Evidence Validator to verify citations." },
              { title: "9. Case Report Compilation", desc: "Compiles the final evidence-validated dossier detailing risk factors, compliance checks, and resolutions." }
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

      {/* ================= STORY SECTION 3: THE AI CORE ================= */}
      <section className="py-36 px-6 border-t border-white/5 bg-[#080808]">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 text-left">
          <div className="max-w-[500px] space-y-6">
            <span className="text-[10px] font-mono tracking-[0.2em] text-[#8b5cf6] uppercase block">Model Registry Core</span>
            <h2 className="text-3xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">The AI Core</h2>
            <p className="text-xs text-[#cbd5e1]/70 leading-relaxed font-light">
              A synchronized mesh layer housing the stacking classifiers, tree attributions explainers, vector database indexes, and regulatory policy nodes. When you modify input variables, the entire pipeline is recalculated.
            </p>
          </div>

          <div className="flex-1 flex justify-center">
            <GlowingBrainSphere />
          </div>
        </div>
      </section>

      {/* Interactive Platform Mockup showcase */}
      <DashboardShowcase />

      {/* Performance section */}
      <Performance />

      {/* Technology grid */}
      <section className="py-36 px-6 border-t border-white/5 bg-[#050505] relative text-center">
        <div className="absolute top-1/2 right-10 w-96 h-96 bg-[#8b5cf6]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[800px] mx-auto space-y-8">
          <span className="text-[10px] font-mono tracking-[0.2em] text-[#8b5cf6] uppercase block">Operational Integration Badges</span>
          <h2 className="text-3xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">The Technology Stack</h2>
          <p className="text-xs text-[#cbd5e1]/60 max-w-lg mx-auto leading-relaxed font-light">
            GuardianEye combines open-source modeling engines, database storage registries, and deployment infrastructure.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {techBadges.map((tech, idx) => {
              let borderClass = "border-white/5 hover:border-[#3b82f6] hover:shadow-[0_0_10px_rgba(59,130,246,0.1)]";
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
                  className={`py-2.5 px-4.5 rounded-xl bg-[#0a0a0a] border text-[11px] font-mono transition-all duration-300 transform hover:scale-102 select-none ${borderClass} ${colorClass}`}
                >
                  {tech.name}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= STORY SECTION 4: WORKSPACE LAUNCH CTA ================= */}
      <section className="py-36 px-6 bg-[#080808] border-t border-white/5 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3b82f6]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[760px] mx-auto rounded-3xl glass-panel p-8 md:p-12 border border-white/10 relative text-center space-y-8 shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden">
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
            onClick={handleLaunchWorkspace}
            className="px-8 py-3.5 rounded-xl bg-white text-black hover:bg-white/90 text-xs font-bold transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2 cursor-pointer mx-auto"
          >
            <span>Launch Workspace Dashboard</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Credentials Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onLogin={handleLoginSuccess} 
      />

    </div>
  );
}
