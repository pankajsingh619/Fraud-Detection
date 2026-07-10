"use client";

import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Research from "../../components/Research";
import Architecture from "../../components/Architecture";
import Footer from "../../components/Footer";
import LoginModal from "../../components/LoginModal";
import { useRouter } from "next/navigation";

export default function ResearchPage() {
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
      
      {/* Floating Header */}
      <Navbar onLaunchClick={handleLaunchWorkspace} />

      {/* Login Modal Overlay */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onLogin={handleLoginSuccess} 
      />

      {/* Hero Header spacer */}
      <div className="h-20 shrink-0" />

      {/* Main Research Content */}
      <main className="flex-grow">
        <Research />
        
        {/* Interactive System Architecture Graph */}
        <section className="py-24 border-t border-white/5 bg-[#050505] relative">
          <div className="max-w-[1200px] mx-auto text-center space-y-4 mb-12">
            <span className="text-[10px] font-mono tracking-[0.2em] text-[#3b82f6] uppercase">System Specifications</span>
            <h2 className="text-3xl font-bold font-display text-white">Platform System Design</h2>
            <p className="text-xs text-[#cbd5e1]/60 max-w-md mx-auto leading-relaxed">
              Click architectural blocks in the diagram below to inspect local components parameters, pipeline logic and API payloads.
            </p>
          </div>
          <Architecture />
        </section>
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
