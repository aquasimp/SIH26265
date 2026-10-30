"use client";

import React from "react";
import { AttentionScoreBreakdown } from "@/lib/rules/attentionScore";
import { X, Calculator, ShieldAlert, CheckCircle, Info } from "lucide-react";

interface AttentionScoreModalProps {
  breakdown: AttentionScoreBreakdown;
  fdrNumber: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AttentionScoreModal({
  breakdown,
  fdrNumber,
  isOpen,
  onClose,
}: AttentionScoreModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-paper-50 border border-ink-border rounded shadow-ledger-elevated overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-ink-border bg-paper-100">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-saffron" />
            <h3 className="font-serif font-bold text-sm text-ink-primary">
              Attention Score Calculation — {fdrNumber}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-ink-muted hover:text-ink-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Transparent Formula Callout */}
          <div className="p-3 bg-paper-100 border border-ink-border rounded font-mono text-[11px] space-y-1">
            <div className="text-ink-muted uppercase tracking-wider text-[10px]">
              Mathematical Prioritization Formula (Deterministic)
            </div>
            <div className="text-ink-primary font-semibold">
              Score = Urgency(40) + Discrepancies(30) + Verification(20) + Renewal(10)
            </div>
            <div className="text-[10px] text-ink-muted">
              Auditable scoring standard per AICTE Regulation Bureau Risk Framework. No black-box models.
            </div>
          </div>

          {/* Factor Breakdown */}
          <div className="space-y-2.5">
            {/* Factor 1: Maturity */}
            <div className="p-3 rounded border border-ink-border bg-paper-50 flex items-start justify-between">
              <div className="space-y-0.5 max-w-[80%]">
                <div className="font-semibold text-ink-primary">
                  1. Maturity Horizon Urgency (Weight: 40%)
                </div>
                <div className="text-ink-muted text-[11px]">
                  {breakdown.maturityScore.reason}
                </div>
              </div>
              <div className="text-right font-mono font-bold text-ink-primary">
                +{breakdown.maturityScore.points} / {breakdown.maturityScore.maxPoints}
              </div>
            </div>

            {/* Factor 2: Discrepancies */}
            <div className="p-3 rounded border border-ink-border bg-paper-50 flex items-start justify-between">
              <div className="space-y-0.5 max-w-[80%]">
                <div className="font-semibold text-ink-primary">
                  2. Open Discrepancy Severity (Weight: 30%)
                </div>
                <div className="text-ink-muted text-[11px]">
                  {breakdown.discrepancyScore.reason}
                </div>
              </div>
              <div className="text-right font-mono font-bold text-ink-primary">
                +{breakdown.discrepancyScore.points} / {breakdown.discrepancyScore.maxPoints}
              </div>
            </div>

            {/* Factor 3: Verification */}
            <div className="p-3 rounded border border-ink-border bg-paper-50 flex items-start justify-between">
              <div className="space-y-0.5 max-w-[80%]">
                <div className="font-semibold text-ink-primary">
                  3. Banking Verification State (Weight: 20%)
                </div>
                <div className="text-ink-muted text-[11px]">
                  {breakdown.verificationScore.reason}
                </div>
              </div>
              <div className="text-right font-mono font-bold text-ink-primary">
                +{breakdown.verificationScore.points} / {breakdown.verificationScore.maxPoints}
              </div>
            </div>

            {/* Factor 4: Renewal */}
            <div className="p-3 rounded border border-ink-border bg-paper-50 flex items-start justify-between">
              <div className="space-y-0.5 max-w-[80%]">
                <div className="font-semibold text-ink-primary">
                  4. Overdue Renewal Lapsed Coverage (Weight: 10%)
                </div>
                <div className="text-ink-muted text-[11px]">
                  {breakdown.renewalScore.reason}
                </div>
              </div>
              <div className="text-right font-mono font-bold text-ink-primary">
                +{breakdown.renewalScore.points} / {breakdown.renewalScore.maxPoints}
              </div>
            </div>
          </div>

          {/* Total & Risk Tier Summary */}
          <div className="p-3.5 bg-paper-200 rounded border border-ink-border flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono text-ink-muted">
                Net Priority Index
              </span>
              <div className="font-mono text-lg font-bold text-ink-primary">
                {breakdown.totalScore} / 100
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-ink-muted">
                Assigned Risk Tier
              </span>
              <div className="font-mono text-xs font-bold text-saffron">
                {breakdown.riskTier} PRIORITY
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
