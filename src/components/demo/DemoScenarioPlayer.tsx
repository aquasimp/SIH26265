"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  Sparkles,
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building,
} from "lucide-react";

interface ScenarioStep {
  id: string;
  title: string;
  description: string;
  targetRole: "INSTITUTION_USER" | "SCRUTINY_OFFICER" | "REGIONAL_OFFICER" | "BUREAU_HEAD" | "AUDITOR";
  routeTo: string;
  actionText: string;
}

export function DemoScenarioPlayer() {
  const { isDemoModalOpen, setIsDemoModalOpen, setRole } = useApp();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const router = useRouter();

  const scenarios: ScenarioStep[] = [
    {
      id: "step-1-intake",
      title: "1. OCR-Assisted FDR Intake",
      description: "Institution uploads fixed deposit scan. Laser sweep extracts fields, tests bank/IFSC prefix, and highlights confidence before ledger commit.",
      targetRole: "INSTITUTION_USER",
      routeTo: "/intake",
      actionText: "Open OCR Scanner & Pre-fill Sample",
    },
    {
      id: "step-2-dashboard-triage",
      title: "2. Treasury Console & Validity Ladder",
      description: "Officer views real-time liquidity horizon, monthly maturity ladder chart, and transparent attention score triage list.",
      targetRole: "SCRUTINY_OFFICER",
      routeTo: "/",
      actionText: "View Treasury Command Console",
    },
    {
      id: "step-3-discrepancy-provenance",
      title: "3. Bank Verification & Discrepancy Detection",
      description: "Inspect FDR with bank/IFSC mismatch (fdr-ec-04-ifsc-mismatch). Compare institution declared vs mock core banking confirmed fields.",
      targetRole: "SCRUTINY_OFFICER",
      routeTo: "/repository/fdr-ec-04-ifsc-mismatch",
      actionText: "Inspect IFSC Discrepancy & Provenance",
    },
    {
      id: "step-4-duplicate-collision",
      title: "4. Cross-Institutional Collision Check",
      description: "Inspect duplicate FDR collision (FDR-2024-COLLISION-991) pledged simultaneously by two distinct colleges.",
      targetRole: "REGIONAL_OFFICER",
      routeTo: "/repository/fdr-ec-03-dup-a",
      actionText: "Inspect Collision & Cross-Institution Link",
    },
    {
      id: "step-5-release-hard-block",
      title: "5. Hard Release Gate (Blocked on Discrepancy)",
      description: "Attempt release on deposit with missing lien (fdr-ec-05-release-blocked). Demonstrates strict 422 block until discrepancy is resolved.",
      targetRole: "REGIONAL_OFFICER",
      routeTo: "/repository/fdr-ec-05-release-blocked",
      actionText: "Test Hard Blocked Release Action",
    },
    {
      id: "step-6-bureau-head-sanction",
      title: "6. Competent Authority Final Release Sanction",
      description: "Switch to Bureau Head role to review clean deposit recommended by RO and issue official AICTE Sanction Order.",
      targetRole: "BUREAU_HEAD",
      routeTo: "/release-workflow",
      actionText: "Authorize Official Deposit Release",
    },
    {
      id: "step-7-audit-verification",
      title: "7. Tamper-Evident SHA-256 Audit Verification",
      description: "Validate the cryptographic hash chain of all lifecycle actions. Walk each block and test tamper detection.",
      targetRole: "AUDITOR",
      routeTo: "/audit-trail",
      actionText: "Verify Audit Chain Integrity",
    },
  ];

  if (!isDemoModalOpen) return null;

  const currentStep = scenarios[activeStepIndex];

  const handleExecuteStep = () => {
    setRole(currentStep.targetRole);
    router.push(currentStep.routeTo);
    setIsDemoModalOpen(false);
  };

  const handleResetLedger = async () => {
    setIsRunning(true);
    try {
      await fetch("/api/demo-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET" }),
      });
      router.refresh();
      window.location.reload();
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-paper-50 border border-ink-border rounded shadow-ledger-elevated overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-border bg-paper-100">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-saffron text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-ink-primary">
                SIH26265 Guided Demo Walkthrough
              </h2>
              <p className="text-xs text-ink-muted">
                Step-by-step verification of all regulatory problem statement requirements
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDemoModalOpen(false)}
            className="p-1 text-ink-muted hover:text-ink-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Step Progress Bar */}
          <div className="flex items-center justify-between text-xs font-mono text-ink-muted border-b border-ink-border pb-3">
            <span>
              STEP {activeStepIndex + 1} OF {scenarios.length}
            </span>
            <span className="text-saffron font-semibold">
              Role: {currentStep.targetRole.replace("_", " ")}
            </span>
          </div>

          {/* Active Step Details */}
          <div className="p-4 rounded border border-ink-border bg-paper-100 space-y-3">
            <h3 className="font-serif font-bold text-sm text-ink-primary">
              {currentStep.title}
            </h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              {currentStep.description}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleExecuteStep}
                className="px-4 py-2 bg-saffron hover:bg-saffron-hover text-white text-xs font-medium rounded flex items-center gap-2 transition-colors shadow-sm"
              >
                <span>{currentStep.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Step Navigator List */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {scenarios.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setActiveStepIndex(idx)}
                className={`w-full text-left px-3 py-2 text-xs rounded flex items-center justify-between transition-colors ${
                  idx === activeStepIndex
                    ? "bg-paper-300 font-semibold text-ink-primary border border-ink-border"
                    : "text-ink-muted hover:bg-paper-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] w-4">{idx + 1}.</span>
                  <span>{step.title.split(". ")[1]}</span>
                </div>
                <span className="font-mono text-[10px] text-ink-muted">
                  {step.targetRole.split("_")[0]}
                </span>
              </button>
            ))}
          </div>

          {/* Reset Action */}
          <div className="flex items-center justify-between pt-3 border-t border-ink-border text-xs">
            <span className="text-ink-muted text-[11px]">
              Want to start over with a fresh deterministic dataset?
            </span>
            <button
              onClick={handleResetLedger}
              disabled={isRunning}
              className="flex items-center gap-1.5 text-xs text-ink-secondary hover:text-ink-primary font-mono px-2.5 py-1 rounded border border-ink-border hover:bg-paper-200 transition-colors"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
              <span>Reset Ledger to Seed</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

