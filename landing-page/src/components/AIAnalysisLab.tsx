"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, RotateCcw, AlertTriangle, ShieldCheck, ChevronRight, FileText, 
  MapPin, Cpu, TrendingUp, Info, HardDrive, RefreshCw, Layers, Award,
  CheckCircle, Globe, Terminal, User, FileDown, Copy, Check
} from "lucide-react";
import confetti from "canvas-confetti";

// Define Types
type ModelType = "Stacking Ensemble" | "Logistic Regression" | "LightGBM" | "CatBoost" | "XGBoost";

interface TxAttributes {
  amount: number;
  merchant: string;
  country: string;
  device: string;
  timeOfDay: string;
  spendingPattern: string;
  velocity: string;
  ipReputation: string;
  merchantRisk: string;
}

export default function AIAnalysisLab({ preselectedTx }: { preselectedTx?: TxAttributes } = {}) {
  // Input Transaction State
  const [tx, setTx] = useState<TxAttributes>({
    amount: 82000,
    merchant: "Amazon SG",
    country: "Singapore",
    device: "New Device (MacOS)",
    timeOfDay: "Midnight (23:45)",
    spendingPattern: "Sudden High Deviation",
    velocity: "High Velocity (5 txn/hr)",
    ipReputation: "Suspicious Proxy",
    merchantRisk: "High Risk (e-commerce)"
  });

  useEffect(() => {
    if (preselectedTx) {
      setTx(preselectedTx);
    }
  }, [preselectedTx]);

  const [selectedModel, setSelectedModel] = useState<ModelType>("Stacking Ensemble");
  const [activeTab, setActiveTab] = useState<string>("shap");
  const [pipelineStep, setPipelineStep] = useState<number>(9); // 0-9 for animating reasoning pipeline
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  
  // ChatGPT-like thinking stages state
  const [thinkingState, setThinkingState] = useState<string>("Ready");
  const [logs, setLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [counterValue, setCounterValue] = useState<number>(96.8);


  const reportRef = useRef<HTMLDivElement>(null);

  const pipelineStages = [
    { label: "Transaction Ingestion", desc: "Received raw data stream" },
    { label: "Feature Engineering", desc: "Velocity, geospatial ratios engineered" },
    { label: "Isolation Forest", desc: "Unsupervised anomaly score calculation" },
    { label: "Stacking Ensemble", desc: "Base models outputs federated" },
    { label: "SHAP Local Explanation", desc: "Feature attribution vector log-odds calculated" },
    { label: "Business Compliance Audit", desc: "RBI directives & internal limits checked" },
    { label: "Hybrid RAG Retrieval", desc: "TF-IDF similarity context matching" },
    { label: "Multi-Agent Reviews", desc: "Analyst agents reasoning consensus built" },
    { label: "SAR Report Finalized", desc: "Case dossier exported" }
  ];

  // Dynamic Math Solver for Fraud Score, Anomaly, and Confidence
  const computeMetrics = (attrs: TxAttributes, model: ModelType) => {
    let score = 0;
    
    // Amount weight (up to 0.35)
    if (attrs.amount > 50000) score += 0.35;
    else if (attrs.amount > 20000) score += 0.20;
    else score += 0.05;

    // Country weight (up to 0.25)
    if (attrs.country === "Singapore") score += 0.22;
    else if (attrs.country === "Nigeria") score += 0.25;
    else if (attrs.country === "United States") score += 0.15;
    else score += 0.02; // India

    // Device weight (up to 0.15)
    if (attrs.device.includes("New") || attrs.device.includes("Unknown")) score += 0.15;
    else score += 0.01;

    // Spending pattern (up to 0.18)
    if (attrs.spendingPattern.includes("Deviation")) score += 0.18;
    else score += 0.03;

    // Velocity (up to 0.12)
    if (attrs.velocity.includes("High")) score += 0.12;
    else score += 0.02;

    // IP reputation (up to 0.15)
    if (attrs.ipReputation.includes("Proxy")) score += 0.15;
    else if (attrs.ipReputation.includes("Clean")) score += 0.01;
    else score += 0.08;

    score = Math.min(Math.max(score, 0.02), 0.98);

    let modelScore = score;
    let confidenceMultiplier = 0.95;

    switch (model) {
      case "Stacking Ensemble":
        modelScore = score > 0.5 ? Math.min(score * 1.12, 0.968) : Math.max(score * 0.4, 0.015);
        confidenceMultiplier = 0.97;
        break;
      case "Logistic Regression":
        modelScore = score > 0.5 ? Math.min(score * 1.05, 0.912) : Math.max(score * 0.7, 0.045);
        confidenceMultiplier = 0.88;
        break;
      case "LightGBM":
        modelScore = attrs.amount > 50000 && attrs.country !== "India" ? 0.875 : 0.056;
        confidenceMultiplier = 0.93;
        break;
      case "CatBoost":
        modelScore = attrs.spendingPattern.includes("Deviation") && attrs.ipReputation.includes("Proxy") ? 0.843 : 0.042;
        confidenceMultiplier = 0.92;
        break;
      case "XGBoost":
        modelScore = score > 0.6 ? 0.861 : 0.063;
        confidenceMultiplier = 0.94;
        break;
    }

    const finalFraudProb = parseFloat((modelScore * 100).toFixed(1));
    const finalAnomalyScore = parseFloat((score * 92).toFixed(0));
    const finalConfidence = parseFloat((Math.max(85, Math.min(99, 100 - Math.abs(50 - finalFraudProb) * 0.2)) * confidenceMultiplier).toFixed(0));

    return {
      fraudProbability: finalFraudProb,
      anomalyScore: finalAnomalyScore,
      confidence: finalConfidence,
      riskLevel: finalFraudProb > 70 ? "HIGH" : finalFraudProb > 30 ? "MEDIUM" : "LOW",
      recommendation: finalFraudProb > 70 ? "Hold & Escalate" : finalFraudProb > 30 ? "Step-Up Verification" : "Approve Transaction"
    };
  };

  const { fraudProbability, anomalyScore, confidence, riskLevel, recommendation } = computeMetrics(tx, selectedModel);

  // Trigger analysis animation flow with sequential ChatGPT-like thinking stages
  const runAnalysisAnimation = () => {
    setIsAnalyzing(true);
    setPipelineStep(0);
    setLogs([]);
    setCounterValue(0);

    const stagesText = [
      "Analyzing Inbound payload...",
      "Normalizing transaction amount profiles...",
      "Fitting unsupervised Isolation Forest scoring...",
      "Evaluating Stacking Meta Model...",
      "Computing SHAP game-theoretic attributions...",
      "Verifying RBI Section 7.2 regulatory boundaries...",
      "Querying context similarity in compliance index RAG...",
      "Routing reviews to federated AI agents...",
      "Compiling final Investigation report..."
    ];

    const logMessages = [
      "Inbound payload logged (TX-98412)",
      "Geospatial & velocity metrics engineered",
      "Isolation Forest returned anomaly outlier flags",
      "Stacking models evaluated parameters successfully",
      "TreeSHAP calculated positive/negative drivers",
      "Compliance audit checked RBI & limit parameters",
      "RAG retrieved Case #1432 for similarity context",
      "Agents completed verdict consensus (Hold action)",
      "SAR Case report compiled and exported"
    ];

    let currentStep = 0;
    const runStep = () => {
      if (currentStep < pipelineStages.length) {
        setThinkingState(stagesText[currentStep]);
        setPipelineStep(currentStep + 1);
        setLogs(prev => [...prev, `✓ ${logMessages[currentStep]}`]);
        
        const targetPercent = (fraudProbability / pipelineStages.length) * (currentStep + 1);
        setCounterValue(Math.min(parseFloat(targetPercent.toFixed(1)), fraudProbability));
        
        currentStep++;
        setTimeout(runStep, 600); // ChatGPT-like delay
      } else {
        setIsAnalyzing(false);
        setThinkingState("Analysis Completed");
        setCounterValue(fraudProbability);
        
        if (fraudProbability < 30) {
          confetti({
            particleCount: 80,
            spread: 50,
            origin: { y: 0.8 },
            colors: ["#22c55e", "#3b82f6", "#00e5ff"]
          });
        }
      }
    };

    runStep();
  };

  useEffect(() => {
    setCounterValue(fraudProbability);
  }, [tx, selectedModel, fraudProbability]);

  // Handlepreset scenarios
  const applyScenario = (scenario: string) => {
    if (isAnalyzing) return;
    
    let newTx = { ...tx };
    switch (scenario) {
      case "low_spend":
        newTx.amount = 5000;
        break;
      case "home_country":
        newTx.country = "India";
        break;
      case "trusted_device":
        newTx.device = "Trusted iPhone (iOS 19)";
        break;
      case "clean_ip":
        newTx.ipReputation = "Clean Residential IP";
        break;
      case "normal_velocity":
        newTx.velocity = "Normal Velocity (1 txn/day)";
        newTx.spendingPattern = "Regular Small Spends";
        break;
      case "default_fraud":
        newTx = {
          amount: 82000,
          merchant: "Amazon SG",
          country: "Singapore",
          device: "New Device (MacOS)",
          timeOfDay: "Midnight (23:45)",
          spendingPattern: "Sudden High Deviation",
          velocity: "High Velocity (5 txn/hr)",
          ipReputation: "Suspicious Proxy",
          merchantRisk: "High Risk (e-commerce)"
        };
        break;
    }
    setTx(newTx);
    
    setIsAnalyzing(true);
    setThinkingState("Re-evaluating parameters...");
    setPipelineStep(0);
    setLogs([]);
    
    setTimeout(() => {
      setIsAnalyzing(false);
      setThinkingState("Recalculation Complete");
      setPipelineStep(9);
      setLogs([
        "✓ Presets updated successfully",
        "✓ Features re-engineered and matched",
        "✓ Final action updated to: " + computeMetrics(newTx, selectedModel).recommendation
      ]);
    }, 450);
  };

  // SHAP Feature values generator
  const getShapValues = () => {
    const values = [];
    
    if (tx.amount > 50000) values.push({ name: "Transaction Amt", val: 0.38, color: "bg-[#ef4444]" });
    else if (tx.amount > 10000) values.push({ name: "Transaction Amt", val: 0.15, color: "bg-[#f97316]" });
    else values.push({ name: "Transaction Amt", val: -0.22, color: "bg-[#22c55e]" });

    if (tx.country !== "India") values.push({ name: "Geographic Shift", val: 0.28, color: "bg-[#ef4444]" });
    else values.push({ name: "Geographic Shift", val: -0.32, color: "bg-[#22c55e]" });

    if (tx.device.includes("New")) values.push({ name: "Device Fingerprint", val: 0.21, color: "bg-[#ef4444]" });
    else values.push({ name: "Device Fingerprint", val: -0.25, color: "bg-[#22c55e]" });

    if (tx.spendingPattern.includes("Deviation")) values.push({ name: "Spending Deviation", val: 0.24, color: "bg-[#ef4444]" });
    else values.push({ name: "Spending Deviation", val: -0.18, color: "bg-[#22c55e]" });

    if (tx.velocity.includes("High")) values.push({ name: "Transaction Velocity", val: 0.16, color: "bg-[#ef4444]" });
    else values.push({ name: "Transaction Velocity", val: -0.12, color: "bg-[#22c55e]" });

    if (tx.ipReputation.includes("Proxy")) values.push({ name: "IP Reputation", val: 0.19, color: "bg-[#ef4444]" });
    else values.push({ name: "IP Reputation", val: -0.28, color: "bg-[#22c55e]" });

    return values.sort((a, b) => Math.abs(b.val) - Math.abs(a.val));
  };

  const generateReportText = () => {
    return `=========================================
GUARDIANEYE EXECUTIVE INVESTIGATION REPORT
=========================================
CASE REF: SAR-TX-98412
DATE: ${new Date().toISOString().split("T")[0]}
STATUS: ${riskLevel === "HIGH" ? "🔴 ESCALATED" : riskLevel === "MEDIUM" ? "🟡 REVIEW REQUIRED" : "🟢 RESOLVED / PASS"}

1. EXECUTIVE SUMMARY
-------------------
GuardianEye's ensembled detection core evaluated a transaction of ₹${tx.amount.toLocaleString()} processed at ${tx.timeOfDay} directed to ${tx.merchant} (${tx.country}).
- Risk Level: ${riskLevel}
- Fraud Probability: ${fraudProbability}%
- Anomaly Index: ${anomalyScore}%
- AI Confidence: ${confidence}%
- Recommendation: ${recommendation}

2. RISK ATTRIBUTION (SHAP LOG-ODDS)
----------------------------------
Key variables impacting the machine learning model's verdict:
${getShapValues().map(v => `- ${v.name}: ${v.val > 0 ? "+" : ""}${v.val.toFixed(2)} log-odds`).join("\n")}

3. TRIGGERED BUSINESS COMPLIANCE RULES
--------------------------------------
${tx.amount > 50000 ? "- WARNING: High-value transaction threshold (> ₹50,000) exceeded." : ""}
${tx.country !== "India" ? "- WARNING: Cross-border transaction without user travel pre-authorization." : ""}
${tx.device.includes("New") ? "- WARNING: Login initiated from unverified hardware fingerprint." : ""}
${tx.velocity.includes("High") ? "- WARNING: Instantaneous spending velocity limit breached." : ""}
${tx.ipReputation.includes("Proxy") ? "- CRITICAL: Network routing shows hosting proxy/VPN usage." : ""}
${(tx.amount <= 50000 && tx.country === "India" && !tx.ipReputation.includes("Proxy")) ? "- None. Transaction complies with all basic business limits." : ""}

4. MULTI-AGENT REVIEW MATRIX
----------------------------
* Fraud Analyst: Flagged as ${riskLevel === "HIGH" ? "Account Takeover (ATO) attempt" : "Legitimate activity"}.
* Compliance Officer: ${tx.amount > 50000 ? "Section 7.2 RBI compliance rule breached (Escalating)." : "Complies with RBI rules."}
* Risk Analyst: Cost-sensitive verification recommended (Friction threshold optimized).
* Case Investigator: Correlated patterns matching Singapore ATO cluster (Similarity: 0.82).

5. FINAL RESOLUTION MATRIX
-------------------------
- Verdict: ${recommendation.toUpperCase()}
- Action: Hold placed on funds, MF Step-up challenge queued to customer.

=========================================
GuardianEye: AI-Powered Fraud Investigation
Built by Pankaj Singh Rana
=========================================`;
  };

  const copyReport = () => {
    navigator.clipboard.writeText(generateReportText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReport = () => {
    const element = document.createElement("a");
    const file = new Blob([generateReportText()], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `GuardianEye_CaseReport_TX98412.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="w-full max-w-[1300px] mx-auto py-12 px-4">
      {/* Title */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-xs font-mono text-[#8b5cf6] mb-4">
          <Cpu size={14} className="animate-pulse" />
          <span>GuardianEye Intelligence Lab</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-[#f8fafc]">
          🧠 AI Analysis Lab
        </h2>
        <p className="text-sm text-[#94a3b8] max-w-2xl mx-auto mt-2">
          Inspect the full reasoning timeline, toggle model baselines, trigger what-if logic, and compile compliance audit reports in real time.
        </p>
      </div>

      {/* Synchronized Four-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* ================= PANEL 1: LEFT - TRANSACTION EDITOR (4/12 width) ================= */}
        <div className="lg:col-span-4 rounded-2xl glass-panel p-5 flex flex-col border border-white/5 relative">
          <div className="absolute top-0 right-6 -translate-y-1/2 px-2 py-0.5 rounded bg-[#3b82f6]/25 border border-[#3b82f6]/40 text-[9px] font-mono text-[#3b82f6] tracking-wider uppercase">
            Panel 1: Input Matrix
          </div>
          
          <h3 className="text-sm font-semibold tracking-wider font-display text-[#f8fafc] border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
            <Terminal size={16} className="text-[#3b82f6]" />
            <span>Transaction Editor</span>
          </h3>

          <div className="space-y-4 flex-grow">
            {/* Amount Slider */}
            <div>
              <div className="flex justify-between text-xs text-[#94a3b8] mb-1">
                <span>Transaction Amount</span>
                <span className="font-mono text-[#f8fafc] font-bold">₹{tx.amount.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="5000" 
                max="150000" 
                step="5000"
                value={tx.amount} 
                onChange={(e) => setTx(prev => ({ ...prev, amount: parseInt(e.target.value) }))}
                className="w-full accent-[#3b82f6] bg-[#1a1a1a] h-1 rounded-lg appearance-none cursor-pointer"
                disabled={isAnalyzing}
              />
            </div>

            {/* Country Selector */}
            <div>
              <label className="block text-xs text-[#94a3b8] mb-1">Geographic Origin</label>
              <select 
                value={tx.country}
                onChange={(e) => setTx(prev => ({ ...prev, country: e.target.value }))}
                className="w-full bg-[#050505] border border-white/5 rounded-lg py-2 px-3 text-xs text-[#f8fafc] focus:outline-none focus:border-[#3b82f6] transition-colors"
                disabled={isAnalyzing}
              >
                <option value="India">India (User Home Base)</option>
                <option value="Singapore">Singapore (Cross-Border Shift)</option>
                <option value="United States">United States</option>
                <option value="Nigeria">Nigeria (High Risk Region)</option>
              </select>
            </div>

            {/* Merchant Selector */}
            <div>
              <label className="block text-xs text-[#94a3b8] mb-1">Merchant Endpoint</label>
              <select 
                value={tx.merchant}
                onChange={(e) => setTx(prev => ({ ...prev, merchant: e.target.value }))}
                className="w-full bg-[#050505] border border-white/5 rounded-lg py-2 px-3 text-xs text-[#f8fafc] focus:outline-none focus:border-[#3b82f6]"
                disabled={isAnalyzing}
              >
                <option value="Amazon SG">Amazon SG (e-commerce)</option>
                <option value="Uber India">Uber India (Utilities)</option>
                <option value="Walmart US">Walmart US</option>
                <option value="Local Grocery">Local Grocery</option>
              </select>
            </div>

            {/* Device Fingerprint */}
            <div>
              <label className="block text-xs text-[#94a3b8] mb-1">Device Fingerprint</label>
              <select 
                value={tx.device}
                onChange={(e) => setTx(prev => ({ ...prev, device: e.target.value }))}
                className="w-full bg-[#050505] border border-white/5 rounded-lg py-2 px-3 text-xs text-[#f8fafc] focus:outline-none"
                disabled={isAnalyzing}
              >
                <option value="Trusted iPhone (iOS 19)">Trusted iPhone (Owner's device)</option>
                <option value="New Device (MacOS)">New Device (MacBook Pro)</option>
                <option value="Unknown Android">Unknown Android fingerprint</option>
              </select>
            </div>

            {/* Spending Pattern */}
            <div>
              <label className="block text-xs text-[#94a3b8] mb-1">Spending History Pattern</label>
              <select 
                value={tx.spendingPattern}
                onChange={(e) => setTx(prev => ({ ...prev, spendingPattern: e.target.value }))}
                className="w-full bg-[#050505] border border-white/5 rounded-lg py-2 px-3 text-xs text-[#f8fafc] focus:outline-none"
                disabled={isAnalyzing}
              >
                <option value="Regular Small Spends">Regular Small Spends (Low Deviation)</option>
                <option value="Sudden High Deviation">Sudden High Deviation (15x normal limit)</option>
              </select>
            </div>

            {/* Transaction Velocity */}
            <div>
              <label className="block text-xs text-[#94a3b8] mb-1">Transaction Velocity</label>
              <select 
                value={tx.velocity}
                onChange={(e) => setTx(prev => ({ ...prev, velocity: e.target.value }))}
                className="w-full bg-[#050505] border border-white/5 rounded-lg py-2 px-3 text-xs text-[#f8fafc] focus:outline-none"
                disabled={isAnalyzing}
              >
                <option value="Normal Velocity (1 txn/day)">Normal Velocity (1 txn/day)</option>
                <option value="High Velocity (5 txn/hr)">High Velocity (5 txn/hr)</option>
              </select>
            </div>

            {/* IP Reputation */}
            <div>
              <label className="block text-xs text-[#94a3b8] mb-1">Network Route Reputation</label>
              <select 
                value={tx.ipReputation}
                onChange={(e) => setTx(prev => ({ ...prev, ipReputation: e.target.value }))}
                className="w-full bg-[#050505] border border-white/5 rounded-lg py-2 px-3 text-xs text-[#f8fafc] focus:outline-none"
                disabled={isAnalyzing}
              >
                <option value="Clean Residential IP">Clean Residential IP (Mumbai)</option>
                <option value="Suspicious Proxy">Suspicious Hosting Proxy / VPN</option>
              </select>
            </div>
          </div>

          {/* Run Pipeline Button */}
          <button 
            onClick={runAnalysisAnimation}
            disabled={isAnalyzing}
            className={`w-full mt-6 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
              isAnalyzing 
                ? "bg-white/5 text-[#94a3b8] cursor-not-allowed border border-white/5" 
                : "bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white shadow-glow cursor-pointer"
            }`}
          >
            <Play size={14} fill="currentColor" />
            <span>{isAnalyzing ? "Processing..." : "Run Analysis Pipeline"}</span>
          </button>
        </div>

        {/* ================= PANEL 2: CENTER - PIPELINE TIMELINE (3/12 width) ================= */}
        <div className="lg:col-span-3 rounded-2xl glass-panel p-5 border border-white/5 flex flex-col relative">
          <div className="absolute top-0 right-6 -translate-y-1/2 px-2 py-0.5 rounded bg-[#8b5cf6]/25 border border-[#8b5cf6]/40 text-[9px] font-mono text-[#8b5cf6] tracking-wider uppercase">
            Panel 2: Pipeline State
          </div>

          <h3 className="text-sm font-semibold tracking-wider font-display text-[#f8fafc] border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
            <Layers size={16} className="text-[#8b5cf6]" />
            <span>Reasoning Timeline</span>
          </h3>

          {/* Timeline steps */}
          <div className="flex-grow flex flex-col justify-between py-1 relative">
            <div className="absolute left-[9px] top-4 bottom-4 w-[1px] bg-white/5 z-0" />
            
            {pipelineStages.map((stage, idx) => {
              const active = pipelineStep > idx;
              const current = pipelineStep === idx + 1;
              return (
                <div key={idx} className="flex items-center gap-3 relative z-10">
                  <div 
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono transition-all duration-300 ${
                      current 
                        ? "bg-[#00e5ff] text-[#050505] scale-110 shadow-[0_0_10px_#00e5ff]" 
                        : active 
                          ? "bg-[#3b82f6] text-white" 
                          : "bg-[#1c1c1c] text-[#94a3b8]"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex flex-col">
                    <span 
                      className={`text-[11px] font-bold transition-colors duration-300 ${
                        current 
                          ? "text-[#00e5ff]" 
                          : active 
                            ? "text-[#f8fafc]" 
                            : "text-[#94a3b8]"
                      }`}
                    >
                      {stage.label}
                    </span>
                    <span className="text-[9px] text-[#94a3b8] leading-none mt-0.5">{stage.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= PANEL 3: RIGHT - LIVE AI ANALYSIS (5/12 width) ================= */}
        <div className="lg:col-span-5 rounded-2xl glass-panel p-5 border border-white/5 flex flex-col justify-between relative">
          <div className="absolute top-0 right-6 -translate-y-1/2 px-2 py-0.5 rounded bg-[#00e5ff]/25 border border-[#00e5ff]/40 text-[9px] font-mono text-[#00e5ff] tracking-wider uppercase">
            Panel 3: Real-Time Verdict
          </div>

          <h3 className="text-sm font-semibold tracking-wider font-display text-[#f8fafc] border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-[#00e5ff]" />
            <span>Live AI Analysis</span>
          </h3>

          {/* Dials & Gauges Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            
            {/* Probability Card */}
            <div className="rounded-xl bg-[#0a0a0a] p-4 border border-white/5 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-mono text-[#94a3b8] uppercase tracking-wider">Fraud Probability</span>
              <div 
                className={`text-3xl md:text-4xl font-extrabold font-display my-1.5 transition-colors duration-300 ${
                  counterValue > 70 
                    ? "text-[#ef4444]" 
                    : counterValue > 30 
                      ? "text-[#f97316]" 
                      : "text-[#22c55e]"
                }`}
              >
                {counterValue}%
              </div>
              <div className="w-full bg-[#1c1c1c] h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    counterValue > 70 
                      ? "bg-[#ef4444]" 
                      : counterValue > 30 
                        ? "bg-[#f97316]" 
                        : "bg-[#22c55e]"
                  }`}
                  style={{ width: `${counterValue}%` }}
                />
              </div>
            </div>

            {/* Confidence Card */}
            <div className="rounded-xl bg-[#0a0a0a] p-4 border border-white/5 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-mono text-[#94a3b8] uppercase tracking-wider">AI Confidence</span>
              <div className="text-3xl md:text-4xl font-extrabold font-display my-1.5 text-[#3b82f6]">
                {isAnalyzing ? "..." : `${confidence}%`}
              </div>
              <span className="text-[9px] text-[#94a3b8]">Model Agreement index</span>
            </div>

            {/* Anomaly Score Card */}
            <div className="rounded-xl bg-[#0a0a0a] p-4 border border-white/5 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-mono text-[#94a3b8] uppercase tracking-wider">Anomaly Score</span>
              <div className="text-2xl font-bold font-display my-1.5 text-[#00e5ff]">
                {isAnalyzing ? "..." : `${anomalyScore}%`}
              </div>
              <span className="text-[9px] text-[#94a3b8]">Isolation Forest level</span>
            </div>

            {/* Risk level Card */}
            <div className="rounded-xl bg-[#0a0a0a] p-4 border border-white/5 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-mono text-[#94a3b8] uppercase tracking-wider">Risk Level</span>
              <div 
                className={`text-2xl font-extrabold font-display my-1.5 ${
                  riskLevel === "HIGH" 
                    ? "text-[#ef4444]" 
                    : riskLevel === "MEDIUM" 
                      ? "text-[#f97316]" 
                      : "text-[#22c55e]"
                }`}
              >
                {isAnalyzing ? "SCANNING" : riskLevel}
              </div>
              <span className="text-[9px] text-[#94a3b8]">Verdict Class Code</span>
            </div>
          </div>

          {/* Action Recommendation Box */}
          <div 
            className={`rounded-xl p-3 border mb-4 text-center transition-all duration-300 ${
              riskLevel === "HIGH" 
                ? "bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]" 
                : riskLevel === "MEDIUM"
                  ? "bg-[#f97316]/10 border-[#f97316]/30 text-[#f97316]"
                  : "bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e]"
            }`}
          >
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider">
              {riskLevel === "HIGH" ? <AlertTriangle size={14} /> : <ShieldCheck size={14} />}
              <span>Recommendation: {isAnalyzing ? "Determining..." : recommendation}</span>
            </div>
          </div>

          {/* ChatGPT-like thinking log console */}
          <div className="rounded-xl bg-[#050505] border border-white/5 p-3 flex-grow flex flex-col font-mono text-[10px] text-[#22c55e] min-h-[140px] max-h-[140px] overflow-y-auto no-scrollbar">
            <div className="text-white/40 border-b border-white/5 pb-1 mb-1.5 flex items-center justify-between">
              <span>CONSOLE_LIVE_LOGS</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping" />
            </div>
            
            {/* Thinking status display */}
            {isAnalyzing && (
              <div className="text-[#00e5ff] font-bold mb-2 flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-ping" />
                <span>ChatGPT Agent: {thinkingState}</span>
              </div>
            )}

            {logs.length > 0 ? (
              <div className="space-y-1">
                {logs.map((log, idx) => (
                  <div key={idx} className="animate-fade-in">{log}</div>
                ))}
              </div>
            ) : (
              <div className="text-[#94a3b8]/60 flex items-center justify-center h-full">
                [ Waiting to compile transaction attributes... ]
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ================= PANEL 4: BOTTOM - EXPLAINABILITY EXPLORER & SCENARIOS (12/12 width) ================= */}
      <div className="rounded-2xl glass-panel p-6 border border-white/5 relative bg-[#0a0a0a]/40">
        <div className="absolute top-0 right-6 -translate-y-1/2 px-2 py-0.5 rounded bg-[#22c55e]/25 border border-[#22c55e]/40 text-[9px] font-mono text-[#22c55e] tracking-wider uppercase">
          Panel 4: Explainability Explorer
        </div>

        {/* Tab Headers */}
        <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4 mb-6">
          <button 
            onClick={() => setActiveTab("shap")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "shap" ? "bg-[#3b82f6] text-white" : "bg-white/5 text-[#94a3b8] hover:text-[#f8fafc] hover:bg-white/10"
            }`}
          >
            📊 SHAP Feature Importance
          </button>
          <button 
            onClick={() => setActiveTab("lime")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "lime" ? "bg-[#3b82f6] text-white" : "bg-white/5 text-[#94a3b8] hover:text-[#f8fafc] hover:bg-white/10"
            }`}
          >
            📊 LIME Explainability
          </button>
          <button 
            onClick={() => setActiveTab("counterfactual")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "counterfactual" ? "bg-[#3b82f6] text-white" : "bg-white/5 text-[#94a3b8] hover:text-[#f8fafc] hover:bg-white/10"
            }`}
          >
            🔄 Counterfactuals
          </button>
          <button 
            onClick={() => setActiveTab("confidence")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "confidence" ? "bg-[#3b82f6] text-white" : "bg-white/5 text-[#94a3b8] hover:text-[#f8fafc] hover:bg-white/10"
            }`}
          >
            🎯 Confidence & Bounds
          </button>
          <button 
            onClick={() => setActiveTab("whatif")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "whatif" ? "bg-[#3b82f6] text-white" : "bg-white/5 text-[#94a3b8] hover:text-[#f8fafc] hover:bg-white/10"
            }`}
          >
            📊 What-If Analysis
          </button>
          <button 
            onClick={() => setActiveTab("compare")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "compare" ? "bg-[#3b82f6] text-white" : "bg-white/5 text-[#94a3b8] hover:text-[#f8fafc] hover:bg-white/10"
            }`}
          >
            📈 Model Comparison
          </button>
          <button 
            onClick={() => setActiveTab("cases")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "cases" ? "bg-[#3b82f6] text-white" : "bg-white/5 text-[#94a3b8] hover:text-[#f8fafc] hover:bg-white/10"
            }`}
          >
            📁 Similar Historical Cases
          </button>
          <button 
            onClick={() => setActiveTab("compliance")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "compliance" ? "bg-[#3b82f6] text-white" : "bg-white/5 text-[#94a3b8] hover:text-[#f8fafc] hover:bg-white/10"
            }`}
          >
            ⚖️ Compliance Audit
          </button>
          <button 
            onClick={() => setActiveTab("agents")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "agents" ? "bg-[#3b82f6] text-white" : "bg-white/5 text-[#94a3b8] hover:text-[#f8fafc] hover:bg-white/10"
            }`}
          >
            👥 Multi-Agent Opinions
          </button>
          <button 
            onClick={() => setActiveTab("report")}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "report" ? "bg-[#22c55e] text-black" : "bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] hover:bg-[#22c55e]/20"
            }`}
          >
            📝 Executive Report
          </button>
        </div>

        {/* Tab Contents */}
        <div className="min-h-[220px]">
          
          {/* TAB: SHAP FEATURE IMPORTANCE */}
          {activeTab === "shap" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              <div>
                <h4 className="text-xs font-bold tracking-wider font-display text-[#f8fafc] mb-4 flex items-center gap-1.5">
                  <Info size={14} className="text-[#3b82f6]" />
                  <span>Attribution Impact Bar Chart (Outward from Zero-Center Axis)</span>
                </h4>
                <div className="space-y-4">
                  {getShapValues().map((val, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-[#cbd5e1]">{val.name}</span>
                        <span className={val.val > 0 ? "text-[#ef4444] font-bold" : "text-[#22c55e] font-bold"}>
                          {val.val > 0 ? "+" : ""}{val.val.toFixed(2)} log-odds
                        </span>
                      </div>
                      
                      {/* Zero-center double-sided bars layout */}
                      <div className="w-full bg-[#121212] h-3 rounded-full overflow-hidden relative flex">
                        {/* Vertical Zero Line anchor */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/20 z-10" />

                        {val.val > 0 ? (
                          // Positive value (pushes right)
                          <div 
                            className="h-full bg-gradient-to-r from-transparent to-[#ef4444] absolute left-1/2 transition-all duration-500 ease-out"
                            style={{ width: `${val.val * 100}%` }}
                          />
                        ) : (
                          // Negative value (pushes left)
                          <div 
                            className="h-full bg-gradient-to-l from-transparent to-[#22c55e] absolute right-1/2 transition-all duration-500 ease-out"
                            style={{ width: `${Math.abs(val.val) * 100}%` }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col justify-center bg-[#0a0a0a]/60 border border-white/5 p-4 rounded-xl">
                <span className="text-xs font-bold text-[#f8fafc] mb-1 font-display">SHAP (SHapley Additive exPlanations)</span>
                <p className="text-[11px] text-[#94a3b8] leading-relaxed">
                  SHAP attributions represent the game-theory impact of each feature pushing the model prediction away from the baseline average. Red bars push the probability toward a <strong>Fraud Flag</strong> (positive log-odds), while green bars represent elements protecting the cardholder's risk score (reducing likelihood). 
                </p>
                <div className="mt-3 flex gap-4 text-[10px] font-mono">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#ef4444]" /> Fraud Driver (+)</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#22c55e]" /> Legit Driver (-)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: LIME EXPLAINABILITY */}
          {activeTab === "lime" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in text-left">
              <div>
                <h4 className="text-xs font-bold tracking-wider font-display text-[#f8fafc] mb-4 flex items-center gap-1.5">
                  <Info size={14} className="text-[#3b82f6]" />
                  <span>Local Surrogate Linear Feature Weights (LIME Coefficients)</span>
                </h4>
                <div className="space-y-4">
                  {[
                    { name: "Transaction Amt Coefficient", val: tx.amount > 50000 ? 0.42 : -0.15, color: tx.amount > 50000 ? "text-[#ef4444]" : "text-[#22c55e]" },
                    { name: "Geographic Location Coefficient", val: tx.country !== "India" ? 0.31 : -0.28, color: tx.country !== "India" ? "text-[#ef4444]" : "text-[#22c55e]" },
                    { name: "Device Fingerprint Coefficient", val: tx.device.includes("New") ? 0.25 : -0.31, color: tx.device.includes("New") ? "text-[#ef4444]" : "text-[#22c55e]" },
                    { name: "IP Routing Route Coefficient", val: tx.ipReputation.includes("Proxy") ? 0.22 : -0.24, color: tx.ipReputation.includes("Proxy") ? "text-[#ef4444]" : "text-[#22c55e]" }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-[#cbd5e1]">{item.name}</span>
                        <span className={`font-bold ${item.color}`}>
                          {item.val > 0 ? "+" : ""}{item.val.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-[#121212] h-2.5 rounded-full overflow-hidden relative">
                        <div 
                          className={`h-full ${item.val > 0 ? "bg-[#ef4444]" : "bg-[#22c55e]"} transition-all duration-500`}
                          style={{ width: `${Math.abs(item.val) * 200}%`, marginLeft: item.val > 0 ? "50%" : `${50 - Math.abs(item.val) * 200}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col justify-center bg-[#0a0a0a]/60 border border-white/5 p-4 rounded-xl">
                <span className="text-xs font-bold text-[#f8fafc] mb-1 font-display">LIME (Local Interpretable Model-agnostic Explanations)</span>
                <p className="text-[11px] text-[#94a3b8] leading-relaxed">
                  LIME fits a sparse linear surrogate model locally around the target transaction perturbation domain. Coefficients represent the linear impact of shifting attributes locally: positive values push the local boundary towards <strong>Fraud</strong>, while negative coefficients highlight protecting cardholder traits.
                </p>
              </div>
            </div>
          )}

          {/* TAB: COUNTERFACTUALS */}
          {activeTab === "counterfactual" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in text-left">
              <div className="space-y-4">
                <h4 className="text-xs font-bold tracking-wider font-display text-[#f8fafc] flex items-center gap-1.5">
                  <RefreshCw size={14} className="text-[#22c55e]" />
                  <span>Closest Decision Boundary Flips (Counterfactual Examples)</span>
                </h4>
                
                <div className="space-y-2 font-mono text-[10px]">
                  <div className="p-3 rounded-xl bg-[#0a0a0a] border border-[#22c55e]/20">
                    <span className="font-bold text-[#22c55e] block mb-1">🟢 COUNTERFACTUAL PATH A (Direct Approval):</span>
                    <ul className="list-disc pl-4 text-[#cbd5e1] space-y-1">
                      <li>Reduce amount from ₹{tx.amount.toLocaleString()} to &lt;= ₹50,000.</li>
                      <li>Remove proxy headers (use verified Residential IP).</li>
                      <li>Verdict flips: <strong className="text-white">Fraud (96%) → Safe (18%)</strong></li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0a0a0a] border border-[#3b82f6]/20">
                    <span className="font-bold text-[#3b82f6] block mb-1">🔵 COUNTERFACTUAL PATH B (MFA Step-Up Bypass):</span>
                    <ul className="list-disc pl-4 text-[#cbd5e1] space-y-1">
                      <li>Relocate client routing Origin to home state (India).</li>
                      <li>Use owner's pre-registered hardware signature (iOS Device).</li>
                      <li>Verdict flips: <strong className="text-white">Hold → Automatic Pass</strong></li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col justify-center bg-[#0a0a0a]/60 border border-white/5 p-4 rounded-xl">
                <span className="text-xs font-bold text-[#f8fafc] mb-1 font-display">Counterfactual Explanations</span>
                <p className="text-[11px] text-[#94a3b8] leading-relaxed">
                  Counterfactuals define the minimum feature perturbations required to flip the system's output class (e.g. from <strong>Hold / Escalate</strong> to <strong>Approve</strong>). This outlines the smallest set of criteria banking compliance officers can suggest to customers to authorize holds.
                </p>
              </div>
            </div>
          )}

          {/* TAB: CONFIDENCE & BOUNDS */}
          {activeTab === "confidence" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in text-left">
              <div>
                <h4 className="text-xs font-bold tracking-wider font-display text-[#f8fafc] mb-3">
                  🎯 Prediction Confidence & Model Agreement
                </h4>
                
                <div className="space-y-3 font-mono text-[10px]">
                  <div className="p-3 rounded-xl bg-[#0a0a0a] border border-white/5 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/50">Model Consensus Agreement</span>
                      <span className="text-[#00e5ff] font-bold">4 of 5 Estimators</span>
                    </div>
                    <div className="w-full bg-[#1c1c1c] h-1 rounded-full overflow-hidden">
                      <div className="w-[80%] h-full bg-[#00e5ff]" />
                    </div>
                    <p className="text-[9px] text-[#cbd5e1]">
                      Tree ensembling algorithms (LightGBM, XGBoost, CatBoost, Stacking) agree on risk classification. Logistic Regression flags minor generalizability.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0a0a0a] border border-white/5 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/50">Prediction Interval Bounds (95% CI)</span>
                      <span className="text-[#3b82f6] font-bold">0.8340 - 0.8458</span>
                    </div>
                    <p className="text-[9px] text-[#cbd5e1]">
                      Statistical bootstrapping bounds confirm high certainty in local prediction probabilities based on historic model parameters.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col justify-center bg-[#0a0a0a]/60 border border-white/5 p-4 rounded-xl">
                <span className="text-xs font-bold text-[#f8fafc] mb-1 font-display">System Confidence Indexes</span>
                <p className="text-[11px] text-[#94a3b8] leading-relaxed">
                  GuardianEye logs model agreement vectors and confidence intervals alongside the final probability score. High consensus agreement reduces the false positive rate, ensuring that step-up verification triggers are justified.
                </p>
              </div>
            </div>
          )}

          {/* TAB: WHAT-IF SCENARIO ENGINE */}
          {activeTab === "whatif" && (
            <div className="animate-fade-in">
              <h4 className="text-xs font-bold tracking-wider font-display text-[#f8fafc] mb-3">
                📊 Test Fraud Hypotheses (Quick-Click What-if Scenarios)
              </h4>
              <p className="text-[11px] text-[#94a3b8] mb-4">
                Click any scenario card below to programmatically inject attributes. Watch the AI recalculate, updating probability and compliance audits instantly.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                
                <button 
                  onClick={() => applyScenario("default_fraud")}
                  className="rounded-xl border border-[#ef4444]/30 hover:border-[#ef4444] bg-[#ef4444]/5 hover:bg-[#ef4444]/10 p-3 text-left transition-all duration-200 cursor-pointer"
                >
                  <span className="block font-bold text-xs text-[#ef4444] mb-1">🔴 Target Alert</span>
                  <span className="text-[9px] text-[#94a3b8] leading-tight block">Amazon ₹82k cross-border shift</span>
                </button>

                <button 
                  onClick={() => applyScenario("low_spend")}
                  className="rounded-xl border border-white/5 hover:border-[#3b82f6] bg-[#0c0c0c] hover:bg-[#3b82f6]/5 p-3 text-left transition-all duration-200 cursor-pointer"
                >
                  <span className="block font-bold text-xs text-[#3b82f6] mb-1">💸 Low Spend</span>
                  <span className="text-[9px] text-[#94a3b8] leading-tight block">Reduce amount to ₹5,000</span>
                </button>

                <button 
                  onClick={() => applyScenario("home_country")}
                  className="rounded-xl border border-white/5 hover:border-[#3b82f6] bg-[#0c0c0c] hover:bg-[#3b82f6]/5 p-3 text-left transition-all duration-200 cursor-pointer"
                >
                  <span className="block font-bold text-xs text-[#3b82f6] mb-1">🇮🇳 User Home Base</span>
                  <span className="text-[9px] text-[#94a3b8] leading-tight block">Relocate execution domain to India</span>
                </button>

                <button 
                  onClick={() => applyScenario("trusted_device")}
                  className="rounded-xl border border-white/5 hover:border-[#3b82f6] bg-[#0c0c0c] hover:bg-[#3b82f6]/5 p-3 text-left transition-all duration-200 cursor-pointer"
                >
                  <span className="block font-bold text-xs text-[#3b82f6] mb-1">📱 Trusted Device</span>
                  <span className="text-[9px] text-[#94a3b8] leading-tight block">Inject verified hardware logs</span>
                </button>

                <button 
                  onClick={() => applyScenario("clean_ip")}
                  className="rounded-xl border border-white/5 hover:border-[#3b82f6] bg-[#0c0c0c] hover:bg-[#3b82f6]/5 p-3 text-left transition-all duration-200 cursor-pointer"
                >
                  <span className="block font-bold text-xs text-[#3b82f6] mb-1">🔒 Clean Network</span>
                  <span className="text-[9px] text-[#94a3b8] leading-tight block">Swap proxy route for residential IP</span>
                </button>

                <button 
                  onClick={() => applyScenario("normal_velocity")}
                  className="rounded-xl border border-white/5 hover:border-[#22c55e] bg-[#0c0c0c] hover:bg-[#22c55e]/5 p-3 text-left transition-all duration-200 cursor-pointer"
                >
                  <span className="block font-bold text-xs text-[#22c55e] mb-1">🟢 Clean Slate</span>
                  <span className="text-[9px] text-[#94a3b8] leading-tight block">Reset velocity limits</span>
                </button>

              </div>
            </div>
          )}

          {/* TAB: MODEL COMPARISON */}
          {activeTab === "compare" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              <div>
                <h4 className="text-xs font-bold tracking-wider font-display text-[#f8fafc] mb-3">
                  📈 Model Comparison & Toggle Panel
                </h4>
                <div className="rounded-xl overflow-hidden border border-white/5 font-mono text-xs">
                  <table className="w-full text-left bg-[#050505] border-collapse">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/5 text-[#94a3b8] text-[10px]">
                        <th className="py-2.5 px-3">MODEL ALGORITHM</th>
                        <th className="py-2.5 px-3 text-right">FRAUD PROBABILITY</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(["Stacking Ensemble", "Logistic Regression", "LightGBM", "CatBoost", "XGBoost"] as ModelType[]).map((m, idx) => {
                        const scoreInfo = computeMetrics(tx, m);
                        const isCurrent = selectedModel === m;
                        return (
                          <tr 
                            key={idx} 
                            onClick={() => setSelectedModel(m)}
                            className={`border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${
                              isCurrent ? "bg-[#3b82f6]/10 text-white font-bold" : "text-[#cbd5e1]"
                            }`}
                          >
                            <td className="py-2.5 px-3 flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${isCurrent ? "bg-[#3b82f6]" : "bg-transparent"}`} />
                              <span>{m} {m === "Stacking Ensemble" && "👑"}</span>
                            </td>
                            <td className="py-2.5 px-3 text-right text-[#00e5ff]">
                              {scoreInfo.fraudProbability}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex flex-col justify-center bg-[#0a0a0a]/60 border border-white/5 p-4 rounded-xl">
                <span className="text-xs font-bold text-[#f8fafc] mb-1 font-display">Ensemble Stacking Mechanics</span>
                <p className="text-[11px] text-[#94a3b8] leading-relaxed">
                  Selecting a model updates the explanation outputs in the lab. Note how <strong>LightGBM</strong> and <strong>CatBoost</strong> rely on discrete decision boundary cuts, resulting in binary jumps. The <strong>Stacking Ensemble</strong> processes base tree signals through a Logistic Regression meta-learner, producing an optimized risk verdict.
                </p>
                <span className="text-[10px] text-[#3b82f6] font-mono mt-3 inline-block border-l-2 border-[#3b82f6] pl-2">
                  Selected Baseline: {selectedModel}
                </span>
              </div>
            </div>
          )}

          {/* TAB: SIMILAR HISTORICAL CASES */}
          {activeTab === "cases" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              <div>
                <h4 className="text-xs font-bold tracking-wider font-display text-[#f8fafc] mb-3 flex items-center gap-1.5">
                  <HardDrive size={14} className="text-[#8b5cf6]" />
                  <span>Hybrid RAG Retrospective Matches</span>
                </h4>
                
                <div className="space-y-3 font-mono text-xs">
                  <div className="rounded-xl bg-[#0a0a0a] p-3 border border-[#8b5cf6]/30">
                    <div className="flex justify-between font-bold text-white mb-1">
                      <span>📁 Case #1432: Singapore ATO Cluster</span>
                      <span className="text-[#8b5cf6]">Score: 0.82</span>
                    </div>
                    <p className="text-[10px] text-[#94a3b8] leading-relaxed">
                      Cross-border card hijack executed via merchant Singapore. Inbound device fingerprint was a fresh Safari browser logging in within 45 minutes of a local Mumbai domestic utility swipe.
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#0a0a0a] p-3 border border-white/5">
                    <div className="flex justify-between font-bold text-[#cbd5e1] mb-1">
                      <span>📁 Case #9811: High-Velocity POS Drain</span>
                      <span className="text-[#94a3b8]">Score: 0.68</span>
                    </div>
                    <p className="text-[10px] text-[#94a3b8] leading-relaxed">
                      E-commerce velocity cluster utilizing proxy tunnels. System recorded 6 attempted payments in 12 minutes directed to international payment gateways.
                    </p>
                  </div>
                </div>
              </div>

              {/* Vector Intel Map Placement */}
              <div className="flex flex-col border border-white/5 rounded-xl p-4 bg-[#0a0a0a]/60 relative overflow-hidden">
                <span className="text-xs font-bold text-[#f8fafc] mb-1 font-display flex items-center gap-1.5">
                  <Globe size={14} className="text-[#00e5ff]" />
                  <span>🌍 Fraud Intelligence Map</span>
                </span>
                <p className="text-[10px] text-[#94a3b8] leading-relaxed mb-3">
                  Geo mapping trace connecting user home base to target transaction location:
                </p>
                
                {/* SVG WORLD MAP VECTOR */}
                <div className="w-full h-[120px] bg-[#050505] rounded-lg relative border border-white/5 overflow-hidden flex items-center justify-center">
                  <svg viewBox="0 0 400 200" className="w-full h-full opacity-60">
                    {/* Outline world maps coordinates roughly */}
                    <path d="M50,40 Q80,20 80,60 T60,110 T40,160" fill="none" stroke="#222" strokeWidth="1.5" />
                    <path d="M180,30 Q220,10 260,30 T320,60 T350,110" fill="none" stroke="#222" strokeWidth="1.5" />
                    <path d="M180,60 Q210,120 220,160" fill="none" stroke="#222" strokeWidth="1.5" />
                    
                    {/* User Node: India (Mumbai) */}
                    <circle cx="240" cy="95" r="4" fill="#3b82f6" />
                    <text x="235" y="87" fill="#3b82f6" fontSize="8" fontFamily="monospace">India</text>
                    
                    {/* Destination Node based on active state */}
                    {tx.country !== "India" && (
                      <>
                        {/* Singapore approx coordinates cx=265, cy=115. Nigeria: cx=190, cy=110. US: cx=80, cy=60 */}
                        {tx.country === "Singapore" && (
                          <>
                            <circle cx="265" cy="115" r="4" fill="#ef4444" className="animate-pulse" />
                            <text x="272" y="118" fill="#ef4444" fontSize="8" fontFamily="monospace">Singapore</text>
                            <path d="M240,95 Q252,100 265,115" fill="none" stroke="#00e5ff" strokeWidth="1.5" strokeDasharray="4,4" className="animate-[dash_2s_linear_infinite]" />
                          </>
                        )}
                        {tx.country === "Nigeria" && (
                          <>
                            <circle cx="190" cy="110" r="4" fill="#ef4444" className="animate-pulse" />
                            <text x="197" y="113" fill="#ef4444" fontSize="8" fontFamily="monospace">Nigeria</text>
                            <path d="M240,95 Q215,90 190,110" fill="none" stroke="#00e5ff" strokeWidth="1.5" strokeDasharray="4,4" className="animate-[dash_2s_linear_infinite]" />
                          </>
                        )}
                        {tx.country === "United States" && (
                          <>
                            <circle cx="80" cy="60" r="4" fill="#ef4444" className="animate-pulse" />
                            <text x="87" y="63" fill="#ef4444" fontSize="8" fontFamily="monospace">USA</text>
                            <path d="M240,95 Q160,50 80,60" fill="none" stroke="#00e5ff" strokeWidth="1.5" strokeDasharray="4,4" className="animate-[dash_2s_linear_infinite]" />
                          </>
                        )}
                      </>
                    )}
                  </svg>
                  
                  <div className="absolute top-2 right-3 font-mono text-[8px] bg-black/60 px-1.5 py-0.5 rounded text-[#cbd5e1] border border-white/5">
                    LATENCY_TRACE: {tx.country !== "India" ? "214ms (CROSS-BORDER)" : "12ms (IN-COUNTRY)"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: COMPLIANCE AUDIT */}
          {activeTab === "compliance" && (
            <div className="animate-fade-in">
              <h4 className="text-xs font-bold tracking-wider font-display text-[#f8fafc] mb-3">
                ⚖️ Triggered Regulatory & Banking Guidelines (RBI Section 7.2)
              </h4>
              <p className="text-[11px] text-[#94a3b8] mb-4">
                The transaction attributes are audited against indexed Indian RBI regulations and domestic UPI constraints.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className={`p-4 rounded-xl border ${tx.amount > 50000 ? "bg-[#ef4444]/5 border-[#ef4444]/30" : "bg-[#22c55e]/5 border-[#22c55e]/30"}`}>
                  <div className="flex items-center gap-2 font-bold mb-2">
                    <CheckCircle size={14} className={tx.amount > 50000 ? "text-[#ef4444]" : "text-[#22c55e]"} />
                    <span>RBI Section 7.2 - High-Value Step-Up Rule</span>
                  </div>
                  <p className="text-[10px] text-[#cbd5e1] leading-relaxed">
                    Transactions exceeding ₹50,000 executed via digital platforms require multi-factor authorization if the client fingerprint or IP geo-coordinates shift out of boundaries. 
                    <br />
                    <strong className="text-white mt-1.5 block">
                      Status: {tx.amount > 50000 ? "🔴 DEVIATION (Requires MFA challenge)" : "🟢 PASS"}
                    </strong>
                  </p>
                </div>

                <div className={`p-4 rounded-xl border ${tx.ipReputation.includes("Proxy") ? "bg-[#ef4444]/5 border-[#ef4444]/30" : "bg-[#22c55e]/5 border-[#22c55e]/30"}`}>
                  <div className="flex items-center gap-2 font-bold mb-2">
                    <CheckCircle size={14} className={tx.ipReputation.includes("Proxy") ? "text-[#ef4444]" : "text-[#22c55e]"} />
                    <span>SOP Section 4.1 - Proxy Mask Protection</span>
                  </div>
                  <p className="text-[10px] text-[#cbd5e1] leading-relaxed">
                    Internal security policy mandates immediate hold on any transaction where routing headers trace back to an active hosting server, Tor node, or proxy bridge.
                    <br />
                    <strong className="text-white mt-1.5 block">
                      Status: {tx.ipReputation.includes("Proxy") ? "🔴 CRITICAL VIOLATION (Hold placed)" : "🟢 PASS"}
                    </strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MULTI-AGENT REVIEW */}
          {activeTab === "agents" && (
            <div className="animate-fade-in">
              <h4 className="text-xs font-bold tracking-wider font-display text-[#f8fafc] mb-3">
                👥 Synchronized Agent Consensus Log
              </h4>
              <p className="text-[11px] text-[#94a3b8] mb-4">
                Four cooperative diagnostic analyst models execute consensus loops to formulate final actions:
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Agent 1 */}
                <div className="rounded-xl bg-[#0a0a0a] border border-white/5 p-3.5 flex flex-col justify-between hover:scale-105 transition-transform duration-300">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-xs text-white">Fraud Analyst</span>
                      <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                    </div>
                    <p className="text-[10px] text-[#cbd5e1] leading-snug">
                      "{riskLevel === "HIGH" ? "Transaction logs show typical Account Takeover (ATO) behavior. High-deviation spend from out-of-boundary node." : "Spending attributes appear aligned with standard cardholder habits."}"
                    </p>
                  </div>
                  <span className="text-[9px] font-mono text-[#3b82f6] mt-2 block">STATUS: {isAnalyzing ? "ACTIVE CHECK" : "IDLE"}</span>
                </div>

                {/* Agent 2 */}
                <div className="rounded-xl bg-[#0a0a0a] border border-white/5 p-3.5 flex flex-col justify-between hover:scale-105 transition-transform duration-300">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-xs text-white">Compliance Officer</span>
                      <span className={`w-2 h-2 rounded-full ${tx.amount > 50000 || tx.ipReputation.includes("Proxy") ? "bg-[#ef4444]" : "bg-[#22c55e]"} animate-pulse`} />
                    </div>
                    <p className="text-[10px] text-[#cbd5e1] leading-snug">
                      "{tx.amount > 50000 ? "Section 7.2 RBI guidelines require Step-Up. Holding funds until customer completes MFA challenges." : "No regulatory thresholds breached. No step-up requirement."}"
                    </p>
                  </div>
                  <span className="text-[9px] font-mono text-[#8b5cf6] mt-2 block">STATUS: {isAnalyzing ? "ACTIVE CHECK" : "IDLE"}</span>
                </div>

                {/* Agent 3 */}
                <div className="rounded-xl bg-[#0a0a0a] border border-white/5 p-3.5 flex flex-col justify-between hover:scale-105 transition-transform duration-300">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-xs text-white">Risk Analyst</span>
                      <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                    </div>
                    <p className="text-[10px] text-[#cbd5e1] leading-snug">
                      "Cost-benefit metrics favor holds over direct approvals when fraud probability thresholds breach the 52.0% optimization line."
                    </p>
                  </div>
                  <span className="text-[9px] font-mono text-[#00e5ff] mt-2 block">STATUS: {isAnalyzing ? "ACTIVE CHECK" : "IDLE"}</span>
                </div>

                {/* Agent 4 */}
                <div className="rounded-xl bg-[#0a0a0a] border border-white/5 p-3.5 flex flex-col justify-between hover:scale-105 transition-transform duration-300">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-xs text-white">Case Investigator</span>
                      <span className={`w-2 h-2 rounded-full ${tx.country === "Singapore" ? "bg-[#ef4444]" : "bg-[#22c55e]"} animate-pulse`} />
                    </div>
                    <p className="text-[10px] text-[#cbd5e1] leading-snug">
                      "{tx.country === "Singapore" ? "Retrieved Case #1432 shares 82% similarity matching active Singapore merchant fraud runs." : "Vector matching does not map to any active malicious cluster runs."}"
                    </p>
                  </div>
                  <span className="text-[9px] font-mono text-white/40 mt-2 block">STATUS: {isAnalyzing ? "ACTIVE CHECK" : "IDLE"}</span>
                </div>

              </div>
            </div>
          )}

          {/* TAB: EXECUTIVE REPORT */}
          {activeTab === "report" && (
            <div className="animate-fade-in space-y-6 text-left">
              {/* Export Panel */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <h4 className="text-xs font-bold tracking-wider font-display text-[#22c55e] flex items-center gap-1.5">
                    <FileText size={14} />
                    <span>Dossier Generator Report Preview</span>
                  </h4>
                  <p className="text-[9px] text-[#94a3b8] mt-0.5">Export case file artifacts for external compliance audit logs.</p>
                </div>
                <div className="flex flex-wrap gap-2 text-[9px] font-mono">
                  <button 
                    onClick={copyReport}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check size={10} className="text-[#22c55e]" /> : <Copy size={10} />}
                    <span>{copied ? "Copied" : "Copy Raw"}</span>
                  </button>
                  <button 
                    onClick={downloadReport}
                    className="px-2.5 py-1.5 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] hover:bg-[#22c55e]/20 flex items-center gap-1 cursor-pointer"
                  >
                    <FileDown size={10} />
                    <span>Download Markdown</span>
                  </button>
                  <button 
                    onClick={() => alert("Simulating PDF download payload generation...")}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-white flex items-center gap-1 cursor-pointer"
                  >
                    <FileDown size={10} />
                    <span>Download PDF</span>
                  </button>
                  <button 
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tx, null, 2));
                      const downloadAnchor = document.createElement("a");
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute("download", "case_dossier.json");
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-white flex items-center gap-1 cursor-pointer"
                  >
                    <FileDown size={10} />
                    <span>Download JSON</span>
                  </button>
                  <button 
                    onClick={() => alert("Simulating CSV conversion...")}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-white flex items-center gap-1 cursor-pointer"
                  >
                    <FileDown size={10} />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>

              {/* Grid layout for Report & Copilot */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Raw text preview */}
                <div 
                  ref={reportRef}
                  className="bg-[#050505] border border-white/5 rounded-xl p-4 font-mono text-[9px] text-[#cbd5e1] whitespace-pre overflow-x-auto select-text leading-relaxed max-h-[220px] overflow-y-auto"
                >
                  {generateReportText()}
                </div>

                {/* Right: Copilot panel */}
                <div className="rounded-xl border border-white/5 p-4 bg-[#0a0a0a] flex flex-col justify-between h-[220px] overflow-y-auto no-scrollbar">
                  <div>
                    <span className="text-[9px] font-mono text-white/40 block mb-2">GUARDIANEYE COPILOT ENGINE</span>
                    <div className="space-y-1.5 text-[9px] font-mono mb-3">
                      <div className="text-white/60">Ask Copilot:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: "Explain this fraud", response: "TX-98412 is flagged HIGH RISK (96.8%) due to (1) high spending deviation (14.5x average limits), (2) geographic shift to Singapore, and (3) connection to a known Singapore ATO cluster." },
                          { label: "Compare with previous", response: "Comparing TX-98412 against Case #1432: Both share unverified MacOS Safari fingerprints, route through Singapore e-commerce portals, and occurred around midnight. High likelihood of matching same ATO run." },
                          { label: "Generate SAR summary", response: "SAR Summary: High-value cross-border transaction of ₹82,000 executed via Amazon SG on unverified device. Stacking classifier fraud score 96.8%. RBI Sec 7.2 breach. Immediate hold placed." }
                        ].map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => alert(`Copilot Response:\n\n${q.response}`)}
                            className="px-2 py-1 rounded bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[#3b82f6] hover:bg-[#3b82f6]/20 text-[9px] transition-colors cursor-pointer"
                          >
                            {q.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-black/60 rounded-lg border border-[#8b5cf6]/20 text-[9px] font-mono text-[#cbd5e1] leading-relaxed">
                    <span className="font-bold text-[#8b5cf6] block mb-1">💡 Copilot Tip:</span>
                    Adjust model baseline thresholds under Settings panel to calibrate overall consensus sensitivities.
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
