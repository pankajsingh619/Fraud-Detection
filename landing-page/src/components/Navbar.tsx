"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { ExternalLink, Play, Menu, X } from "lucide-react";

interface NavbarProps {
  onLaunchClick?: () => void;
  forceVisible?: boolean;
}

export default function Navbar({ onLaunchClick, forceVisible = false }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [scrollVisible, setScrollVisible] = useState(false);

  useEffect(() => {
    if (forceVisible) return;
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setScrollVisible(true);
      } else {
        setScrollVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [forceVisible]);

  const activeVisible = forceVisible || scrollVisible;

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Workspace", path: "/workspace" },
    { label: "Research", path: "/research" },
    { label: "Documentation", path: "/documentation" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" }
  ];

  return (
    <AnimatePresence>
      {activeVisible && (
        <motion.nav
          initial={{ y: -70, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          exit={{ y: -70, opacity: 0, x: "-50%" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed top-4 left-1/2 w-[90%] max-w-[1000px] h-14 rounded-full z-50 glass-panel border border-white/10 px-6 flex items-center justify-between shadow-2xl backdrop-blur-md"
        >
          {/* Logo */}
          <div 
            onClick={() => router.push("/")}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] group-hover:scale-125 transition-transform duration-300" />
            <span className="font-display font-extrabold tracking-widest text-xs text-[#f8fafc]">GUARDIANEYE</span>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-6 text-[10px] font-mono tracking-wider text-[#94a3b8]">
            {navLinks.map((link, idx) => {
              const active = pathname === link.path;
              return (
                <button
                  key={idx}
                  onClick={() => router.push(link.path)}
                  className={`transition-colors cursor-pointer uppercase ${
                    active ? "text-white font-bold" : "hover:text-white"
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* CTA */}
          <button 
            onClick={() => {
              if (onLaunchClick) {
                onLaunchClick();
              } else {
                router.push("/workspace");
              }
            }}
            className="px-4 py-1.5 rounded-full bg-[#3b82f6]/20 border border-[#3b82f6]/40 hover:bg-[#3b82f6] text-white hover:text-black transition-all duration-300 text-[10px] font-mono tracking-wider uppercase flex items-center gap-1.5 cursor-pointer"
          >
            <Play size={10} fill="currentColor" />
            <span>Workspace</span>
          </button>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
