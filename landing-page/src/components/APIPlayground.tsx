"use client";

import React, { useState } from "react";
import { Terminal, Send, Copy, Check, Info } from "lucide-react";

export default function APIPlayground() {
  const [activeRoute, setActiveRoute] = useState<string>("predict");
  const [requestBody, setRequestBody] = useState<string>(
    JSON.stringify({ amount: 82000, merchant: "Amazon SG", country: "Singapore" }, null, 2)
  );
  const [responseOutput, setResponseOutput] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const routes = [
    { id: "predict", method: "POST", path: "/api/predict", desc: "Runs baseline and ensembled classifiers." },
    { id: "investigate", method: "POST", path: "/api/investigate", desc: "Fetches local SHAP log-odds and compliance checklists." },
    { id: "report", method: "GET", path: "/api/report", desc: "Generates Suspicious Activity Report markdown dossiers." }
  ];

  // Helper to compile dynamic response simulation
  const handleSend = () => {
    setIsSending(true);
    setResponseOutput("");

    setTimeout(() => {
      try {
        const parsed = JSON.parse(requestBody);
        const amount = parsed.amount || 5000;
        const country = parsed.country || "India";
        const merchant = parsed.merchant || "Local Store";

        let prob = 5.6;
        let risk = "LOW";
        let action = "Approve Transaction";

        if (amount > 100000 || country === "Nigeria") {
          prob = 98.4;
          risk = "HIGH";
          action = "Hold & Escalate";
        } else if (amount > 50000 || country !== "India") {
          prob = 84.8;
          risk = "HIGH";
          action = "Hold & Escalate";
        } else if (amount > 20000) {
          prob = 41.2;
          risk = "MEDIUM";
          action = "Step-Up Verification";
        }

        let respObj = {};

        if (activeRoute === "predict") {
          respObj = {
            status: "success",
            timestamp: new Date().toISOString(),
            payload: {
              transaction_id: `TX-${Math.floor(Math.random() * 90000) + 10000}`,
              model_verdicts: {
                stacking_ensemble: `${prob}%`,
                logistic_regression: `${prob > 50 ? (prob * 0.95).toFixed(1) : (prob * 1.5).toFixed(1)}%`,
                lightgbm: `${prob > 50 ? 87.5 : 5.6}%`
              },
              risk_metrics: {
                probability: prob,
                risk_level: risk,
                anomaly_index: `${(prob * 0.92).toFixed(0)}%`
              }
            }
          };
        } else if (activeRoute === "investigate") {
          respObj = {
            status: "success",
            timestamp: new Date().toISOString(),
            payload: {
              shap_explanations: {
                attributions: [
                  { feature: "amount", push: amount > 50000 ? 0.38 : -0.22 },
                  { feature: "country", push: country !== "India" ? 0.28 : -0.32 }
                ],
                latency_ms: 32
              },
              compliance: {
                violations: amount > 50000 ? ["RBI_SEC_7_2_HIGH_VALUE_BREACH"] : [],
                action_required: action
              }
            }
          };
        } else {
          respObj = {
            status: "success",
            timestamp: new Date().toISOString(),
            payload: {
              report_meta: {
                reference: "SAR-TX-98412",
                status: risk === "HIGH" ? "ESCALATED" : "RESOLVED"
              },
              markdown_dossier: `# GUARDIANEYE SAR CASE FILE\n\nVERDICT: ${risk} RISK\nRECOMENDATION: ${action}\n`
            }
          };
        }

        setResponseOutput(JSON.stringify(respObj, null, 2));
      } catch (err) {
        setResponseOutput(JSON.stringify({ error: "Invalid JSON request payload payload" }, null, 2));
      } finally {
        setIsSending(false);
      }
    }, 800);
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(responseOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-white/5">
        <div>
          <h2 className="text-xl font-bold font-display text-white">REST API Sandbox</h2>
          <p className="text-xs text-[#94a3b8] mt-0.5">Test prediction, explanation, and report endpoints directly.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left endpoint list (4/12 width) */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-[10px] font-mono text-white/40 block tracking-wider">AVAILABLE ENDPOINTS</span>
          
          <div className="space-y-2">
            {routes.map((r) => {
              const isActive = activeRoute === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    setActiveRoute(r.id);
                    setResponseOutput("");
                    if (r.id === "report") {
                      setRequestBody("");
                    } else {
                      setRequestBody(JSON.stringify({ amount: 82000, merchant: "Amazon SG", country: "Singapore" }, null, 2));
                    }
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isActive 
                      ? "bg-[#3b82f6]/10 border-[#3b82f6]/40 text-white" 
                      : "bg-[#101010] border-white/5 text-[#cbd5e1] hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5 font-mono text-[10px]">
                    <span className={`px-2 py-0.5 rounded font-extrabold ${r.method === "POST" ? "bg-[#3b82f6]/20 text-[#3b82f6]" : "bg-emerald-500/20 text-emerald-500"}`}>
                      {r.method}
                    </span>
                    <span className="font-bold">{r.path}</span>
                  </div>
                  <p className="text-[10px] text-[#94a3b8] leading-relaxed">{r.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right editor sandbox (8/12 width) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* JSON request editor */}
          <div className="rounded-xl bg-[#101010] border border-white/5 p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-white/40 block mb-2">REQUEST PAYLOAD (JSON)</span>
              {activeRoute !== "report" ? (
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="w-full h-[180px] bg-[#050505] border border-white/5 rounded-xl p-3 font-mono text-[10px] text-white focus:outline-none focus:border-[#3b82f6] resize-none"
                />
              ) : (
                <div className="h-[180px] bg-[#050505] border border-white/5 rounded-xl p-3 font-mono text-[10px] text-white/30 flex items-center justify-center">
                  [ No request body required for GET request ]
                </div>
              )}
            </div>

            <button
              onClick={handleSend}
              disabled={isSending}
              className="w-full mt-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-xs font-bold text-white rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send size={12} />
              <span>{isSending ? "Executing Query..." : "Execute API Request"}</span>
            </button>
          </div>

          {/* JSON response outputs */}
          <div className="rounded-xl bg-[#101010] border border-white/5 p-4 flex flex-col justify-between">
            <div className="flex-grow flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono text-white/40">RESPONSE BODY</span>
                {responseOutput && (
                  <button 
                    onClick={copyResponse}
                    className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-mono text-white/50 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check size={10} className="text-[#22c55e]" /> : <Copy size={10} />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                )}
              </div>

              <div className="flex-grow bg-[#050505] border border-white/5 rounded-xl p-3 font-mono text-[10px] text-[#22c55e] overflow-auto h-[180px]">
                {responseOutput ? (
                  <pre>{responseOutput}</pre>
                ) : (
                  <div className="text-[#cbd5e1]/40 h-full flex items-center justify-center text-center leading-relaxed">
                    {isSending ? "[ Executing Request... ]" : "[ Click Execute to retrieve payload ]"}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

      <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[10px] text-[#cbd5e1] leading-relaxed flex items-start gap-2 max-w-[800px]">
        <Info size={14} className="shrink-0 text-[#3b82f6] mt-0.5" />
        <p>
          API keys are injected automatically via dashboard authorization headers. To generate custom bearer keys for external deployment integrations, navigate to the **Settings** panel.
        </p>
      </div>
    </div>
  );
}
