"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppLayout from "../../components/AppLayout";
import AIAnalysisLab from "../../components/AIAnalysisLab";

function InvestigationsContent() {
  const searchParams = useSearchParams();
  const [preselectedTx, setPreselectedTx] = useState<any>(null);

  useEffect(() => {
    const caseId = searchParams.get("caseId");
    if (caseId) {
      // Mock lookup case details
      const casesData: Record<string, any> = {
        "1432": {
          amount: 82000, country: "Singapore", merchant: "Amazon SG",
          device: "New Device (MacOS)", timeOfDay: "Midnight (23:45)", spendingPattern: "Sudden High Deviation",
          velocity: "High Velocity (5 txn/hr)", ipReputation: "Suspicious Proxy", merchantRisk: "High Risk (e-commerce)"
        },
        "9811": {
          amount: 150000, country: "Nigeria", merchant: "Binance Crypto",
          device: "Unknown Android", timeOfDay: "Morning (09:12)", spendingPattern: "Sudden High Deviation",
          velocity: "High Velocity (5 txn/hr)", ipReputation: "Suspicious Proxy", merchantRisk: "High Risk (e-commerce)"
        },
        "2341": {
          amount: 35000, country: "United States", merchant: "Walmart US",
          device: "New Device (MacOS)", timeOfDay: "Evening (18:22)", spendingPattern: "Sudden High Deviation",
          velocity: "Normal Velocity (1 txn/day)", ipReputation: "Clean Residential IP", merchantRisk: "High Risk (e-commerce)"
        }
      };
      if (casesData[caseId]) {
        setPreselectedTx(casesData[caseId]);
      }
    }
  }, [searchParams]);

  return (
    <AIAnalysisLab 
      key={preselectedTx ? `${preselectedTx.merchant}-${preselectedTx.amount}` : "default"} 
      preselectedTx={preselectedTx} 
    />
  );
}

export default function InvestigationsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="text-white text-xs font-mono">Loading investigation lab...</div>}>
        <InvestigationsContent />
      </Suspense>
    </AppLayout>
  );
}
