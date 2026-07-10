"use client";

import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import APIPlayground from "../../components/APIPlayground";
import Footer from "../../components/Footer";
import LoginModal from "../../components/LoginModal";
import { useRouter } from "next/navigation";
import { Terminal, Database, Server, Settings, Check } from "lucide-react";

export default function DocumentationPage() {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<"api" | "db" | "deploy">("api");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleLaunchWorkspace = () => {
    setShowLoginModal(true);
  };

  const handleLoginSuccess = (role: string) => {
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("userRole", role);
    setShowLoginModal(false);
    router.push("/workspace");
  };

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const dbDDL = `-- Role Based Enums
CREATE TYPE user_role AS ENUM ('Administrator', 'Fraud Analyst', 'Compliance Officer', 'Auditor', 'Viewer');
CREATE TYPE case_status AS ENUM ('Open', 'In Review', 'Escalated', 'Closed', 'Archived');
CREATE TYPE risk_level AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- Users Table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cases Table
CREATE TABLE cases (
    case_id VARCHAR(50) PRIMARY KEY,
    transaction_amt NUMERIC(15, 2) NOT NULL,
    merchant VARCHAR(255) NOT NULL,
    country VARCHAR(3) NOT NULL,
    risk risk_level NOT NULL,
    anomaly_score INTEGER NOT NULL,
    status case_status NOT NULL DEFAULT 'Open',
    assigned_to UUID REFERENCES users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Immutable Security Audit Trail Table
CREATE TABLE audit_logs (
    log_id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES users(user_id),
    action VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    payload_snapshot JSONB
);`;

  const nginxConfig = `server {
    listen 443 ssl http2;
    server_name guardianeye.bank.internal;

    ssl_certificate /etc/ssl/certs/guardianeye.crt;
    ssl_certificate_key /etc/ssl/private/guardianeye.key;

    # Rate Limiting configuration
    limit_req zone=api_zone burst=20 nodelay;

    location /api/ {
        proxy_pass http://fastapi_backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://nextjs_frontend:3000;
        proxy_set_header Host $host;
    }
}`;

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-[#f8fafc] overflow-x-hidden font-sans">
      
      {/* Navbar */}
      <Navbar onLaunchClick={handleLaunchWorkspace} />

      {/* Login Modal Overlay */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onLogin={handleLoginSuccess} 
      />

      {/* Header spacer */}
      <div className="h-20 shrink-0" />

      {/* Documentation container */}
      <main className="flex-grow max-w-[1200px] mx-auto w-full px-6 py-16 grid grid-cols-1 lg:grid-cols-4 gap-10 text-left">
        
        {/* Navigation Sidebar Panel */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest text-white/30 uppercase block mb-3">Developer Guides</span>
            {[
              { id: "api", label: "REST API Sandbox", icon: <Terminal size={14} /> },
              { id: "db", label: "PostgreSQL DDL Schemas", icon: <Database size={14} /> },
              { id: "deploy", label: "Reverse Proxy Setup", icon: <Server size={14} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
                  activeSubTab === tab.id 
                    ? "bg-white/5 border border-white/5 text-white font-bold" 
                    : "text-[#94a3b8] hover:text-white"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-[#101010]/60 border border-white/5 font-mono text-[9px] text-[#cbd5e1] leading-relaxed">
            <span className="font-bold text-[#3b82f6] block mb-1">🔐 Auth Protocol</span>
            API requests require an asymmetric RS256 JWT signature headers trace. Check settings to generate keys.
          </div>
        </aside>

        {/* Content Pane */}
        <section className="lg:col-span-3 space-y-8">
          
          {activeSubTab === "api" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-display text-white">REST API Sandbox Playground</h2>
                <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">
                  Interact with local API servers. Edit payload values, choose endpoints, and click compile to see pretty-printed schema responses.
                </p>
              </div>
              <APIPlayground />
            </div>
          )}

          {activeSubTab === "db" && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold font-display text-white">PostgreSQL Schemas DDL</h2>
                    <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">
                      Enterprise relational tables to model user roles, audit trails, and versioned case dossiers.
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyText(dbDDL, 1)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-white font-mono text-[9px] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedIndex === 1 ? <Check size={10} className="text-[#22c55e]" /> : <Terminal size={10} />}
                    <span>{copiedIndex === 1 ? "Copied" : "Copy SQL"}</span>
                  </button>
                </div>
              </div>

              {/* Code view */}
              <div className="relative rounded-xl overflow-hidden border border-white/5 bg-[#050505] p-5 font-mono text-[10px] text-[#cbd5e1] whitespace-pre overflow-x-auto max-h-[380px] overflow-y-auto leading-relaxed">
                {dbDDL}
              </div>
            </div>
          )}

          {activeSubTab === "deploy" && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold font-display text-white">Nginx Reverse Proxy Configuration</h2>
                    <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">
                      SSL termination and rate limiter routing rules configurations for production deployment servers.
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyText(nginxConfig, 2)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-white font-mono text-[9px] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedIndex === 2 ? <Check size={10} className="text-[#22c55e]" /> : <Terminal size={10} />}
                    <span>{copiedIndex === 2 ? "Copied" : "Copy Nginx"}</span>
                  </button>
                </div>
              </div>

              {/* Code view */}
              <div className="relative rounded-xl overflow-hidden border border-white/5 bg-[#050505] p-5 font-mono text-[10px] text-[#cbd5e1] whitespace-pre overflow-x-auto max-h-[380px] overflow-y-auto leading-relaxed">
                {nginxConfig}
              </div>
            </div>
          )}

        </section>

      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
