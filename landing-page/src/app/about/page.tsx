"use client";

import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoginModal from "../../components/LoginModal";
import { useRouter } from "next/navigation";
import { ShieldCheck, Users, Milestone, Award } from "lucide-react";

export default function AboutPage() {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  const handleLaunchWorkspace = () => {
    setShowLoginModal(true);
  };

  const handleLoginSuccess = (role: string) => {
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("userRole", role);
    setShowLoginModal(false);
    router.push("/workspace");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-[#f8fafc] overflow-x-hidden font-sans">
      <Navbar onLaunchClick={handleLaunchWorkspace} />

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onLogin={handleLoginSuccess} 
      />

      <div className="h-20 shrink-0" />

      <main className="flex-grow max-w-[800px] mx-auto w-full px-6 py-16 text-left space-y-12">
        <div className="space-y-4">
          <span className="text-[10px] font-mono tracking-widest text-[#3b82f6] uppercase">Our Mission</span>
          <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">
            Building the Future of Explainable Financial Security
          </h1>
          <p className="text-xs text-[#cbd5e1]/70 leading-relaxed font-light">
            GuardianEye is a financial intelligence platform founded by ML researchers and cyber security engineers. We believe that critical AI-driven automated locks must be fully explainable and auditable in real-time, preventing black-box mistakes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
          <div className="p-5 rounded-2xl bg-[#101010]/60 border border-white/5 space-y-2">
            <div className="p-1 rounded bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[#3b82f6] w-fit">
              <ShieldCheck size={16} />
            </div>
            <h3 className="font-bold text-white font-display">Responsible Automation</h3>
            <p className="text-white/40">Integrating SHAP explanations and LIME linear slopes helps cardholders understand holds instantly.</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#101010]/60 border border-white/5 space-y-2">
            <div className="p-1 rounded bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#8b5cf6] w-fit">
              <Users size={16} />
            </div>
            <h3 className="font-bold text-white font-display">Decentralized Agent Mesh</h3>
            <p className="text-white/40">Dynamic reviews coordinate Fraud, Compliance, Risk, and Validator opinions on transactions.</p>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
