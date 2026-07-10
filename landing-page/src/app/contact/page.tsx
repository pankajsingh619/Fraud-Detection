"use client";

import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LoginModal from "../../components/LoginModal";
import { useRouter } from "next/navigation";
import { Send, Check } from "lucide-react";

export default function ContactPage() {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [sent, setSent] = useState<boolean>(false);

  const handleLaunchWorkspace = () => {
    setShowLoginModal(true);
  };

  const handleLoginSuccess = (role: string) => {
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("userRole", role);
    setShowLoginModal(false);
    router.push("/workspace");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
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

      <main className="flex-grow max-w-[600px] mx-auto w-full px-6 py-16 text-left space-y-8">
        <div className="space-y-3">
          <span className="text-[10px] font-mono tracking-widest text-[#3b82f6] uppercase">Get In Touch</span>
          <h1 className="text-4xl font-black font-display tracking-tight text-white leading-tight">
            Contact Support & Ops
          </h1>
          <p className="text-xs text-[#cbd5e1]/70 leading-relaxed font-light">
            Inquire about ensembling models training parameters, deployment reverse proxy templates, or license agreements.
          </p>
        </div>

        {sent ? (
          <div className="p-6 rounded-2xl bg-[#22c55e]/5 border border-[#22c55e]/20 text-center space-y-2 font-mono text-xs">
            <Check size={20} className="text-[#22c55e] mx-auto animate-bounce" />
            <div className="font-bold text-white">Message Dispatched successfully</div>
            <p className="text-[#cbd5e1]/60">Our Compliance Operations division will reply within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-[10px]">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-white/40 uppercase">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-[#101010] border border-white/5 focus:border-[#3b82f6] rounded-xl p-3 text-white focus:outline-none transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-white/40 uppercase">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-[#101010] border border-white/5 focus:border-[#3b82f6] rounded-xl p-3 text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-white/40 uppercase">Subject</label>
              <input 
                type="text" 
                required
                className="w-full bg-[#101010] border border-white/5 focus:border-[#3b82f6] rounded-xl p-3 text-white focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-white/40 uppercase">Detailed Message</label>
              <textarea 
                rows={5}
                required
                className="w-full bg-[#101010] border border-white/5 focus:border-[#3b82f6] rounded-xl p-3 text-white focus:outline-none transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:opacity-90 text-white font-bold flex items-center justify-center gap-2 cursor-pointer transition-opacity"
            >
              <Send size={12} />
              <span>Send Message</span>
            </button>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
