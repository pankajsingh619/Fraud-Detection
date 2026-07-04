"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Play } from "lucide-react";

export default function Navbar({ onLaunchClick }: { onLaunchClick?: () => void } = {}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show navbar after scrolling about 300px (around 20-30% of screen height)
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: -70, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -70, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-[1000px] h-14 rounded-full z-50 glass-panel border border-white/10 px-6 flex items-center justify-between shadow-2xl backdrop-blur-md"
        >
          {/* Logo */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] group-hover:scale-125 transition-transform duration-300" />
            <span className="font-display font-extrabold tracking-widest text-xs text-[#f8fafc]">GUARDIANEYE</span>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-6 text-[11px] font-mono tracking-wider text-[#94a3b8]">
            <button 
              onClick={() => scrollToSection("product-features")} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Product
            </button>
            <button 
              onClick={() => scrollToSection("architecture")} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Architecture
            </button>
            <button 
              onClick={() => scrollToSection("research")} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Research
            </button>
            <button 
              onClick={() => scrollToSection("performance")} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Performance
            </button>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition-colors flex items-center gap-0.5"
            >
              <span>GitHub</span>
              <ExternalLink size={10} />
            </a>
          </div>

          {/* CTA */}
          <button 
            onClick={() => {
              if (onLaunchClick) onLaunchClick();
              else scrollToSection("analysis-lab");
            }}
            className="px-4 py-1.5 rounded-full bg-[#3b82f6]/20 border border-[#3b82f6]/40 hover:bg-[#3b82f6] text-white hover:text-black transition-all duration-300 text-[10px] font-mono tracking-wider uppercase flex items-center gap-1.5 cursor-pointer"
          >
            <Play size={10} fill="currentColor" />
            <span>Launch Workspace</span>
          </button>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
