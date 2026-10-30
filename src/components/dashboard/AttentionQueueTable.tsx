"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FdrInstrument } from "@/types/fdr";
import { formatIndianCurrency, formatIndianDate, formatRemainingTenure } from "@/lib/formatters";
import { CircularValidityRing } from "../fdr/CircularValidityRing";
import { AttentionScoreModal } from "../fdr/AttentionScoreModal";
import { calculateAttentionScore, AttentionScoreBreakdown } from "@/lib/rules/attentionScore";
import { AlertTriangle, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";

interface AttentionQueueTableProps {
  instruments: FdrInstrument[];
  title?: string;
  subtitle?: string;
}

export function AttentionQueueTable({
  instruments,
  title = "Priority Attention Triage Queue",
  subtitle = "Instruments ranked by deterministic Attention Score (Days to Maturity + Discrepancies + CBS Verification)",
}: AttentionQueueTableProps) {
  const [selectedScore, setSelectedScore] = useState<{
    fdrNumber: string;
    breakdown: AttentionScoreBreakdown;
  } | null>(null);

  return (
    <div className="border border-ink-border rounded bg-paper-50 shadow-ledger overflow-hidden">
      <div className="px-5 py-3.5 bg-paper-100 border-b border-ink-border flex items-center justify-between">
        <div>
          <h3 className="font-serif font-bold text-sm text-ink-primary">{title}</h3>
          <p className="text-[11px] text-ink-muted">{subtitle}</p>
        </div>
        <div className="font-mono text-xs text-ink-muted">
          Showing Top {instruments.length}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-paper-100 font-mono text-[10px] uppercase text-ink-muted border-b border-ink-border">
            <tr>
              <th className="py-2.5 px-4 font-semibold">Validity Horizon</th>
              <th className="py-2.5 px-4 font-semibold">Instrument & Bank</th>
              <th className="py-2.5 px-4 font-semibold">Amount (INR)</th>
              <th className="py-2.5 px-4 font-semibold">Attention Score</th>
              <th className="py-2.5 px-4 font-semibold">Regulatory Discrepancies</th>
              <th className="py-2.5 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-border">
            {instruments.map((fdr) => {
              const tenure = formatRemainingTenure(fdr.maturityDate);
              const scoreBreakdown = calculateAttentionScore(fdr);
              const openFlags = (fdr.discrepancies || []).filter((d) => !d.resolved);

              return (
                <tr key={fdr.id} className="hover:bg-paper-100/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <CircularValidityRing maturityDate={fdr.maturityDate} size={42} strokeWidth={4} />
                      <div>
                        <div className="font-mono text-[11px] font-semibold text-ink-primary">
                          {formatIndianDate(fdr.maturityDate)}
                        </div>
                        <div
                          className={`text-[10px] font-mono ${
                            tenure.urgency === "EXPIRED"
                              ? "text-red-600 font-bold"
                              : tenure.urgency === "CRITICAL"
                              ? "text-saffron font-semibold"
                              : "text-ink-muted"
                          }`}
                        >
                          {tenure.label}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-ink-primary">
                      {fdr.fdrNumber}
                    </div>
                    <div className="text-[11px] text-ink-muted mt-0.5">
                      {fdr.bankName} • {fdr.ifscCode}
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono font-medium text-ink-primary">
                    {formatIndianCurrency(fdr.amount)}
                  </td>

                  <td className="py-3 px-4">
                    <button
                      onClick={() =>
                        setSelectedScore({
                          fdrNumber: fdr.fdrNumber,
                          breakdown: scoreBreakdown,
                        })
                      }
                      className="group flex items-center gap-1.5 px-2 py-1 rounded bg-paper-200 border border-ink-border hover:border-saffron transition-colors"
                      title="Click to view mathematical calculation formula"
                    >
                      <span className="font-mono font-bold text-ink-primary text-xs">
                        {scoreBreakdown.totalScore}
                      </span>
                      <span className="text-[10px] font-mono text-ink-muted">/100</span>
                      <span
                        className={`text-[9px] font-mono px-1 rounded uppercase ${
                          scoreBreakdown.riskTier === "CRITICAL"
                            ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                            : scoreBreakdown.riskTier === "ELEVATED"
                            ? "bg-saffron-subtle text-saffron"
                            : "bg-paper-300 text-ink-muted"
                        }`}
                      >
                        {scoreBreakdown.riskTier}
                      </span>
                    </button>
                  </td>

                  <td className="py-3 px-4">
                    {openFlags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {openFlags.map((flag) => (
                          <span
                            key={flag.id}
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${
                              flag.severity === "CRITICAL"
                                ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300"
                            }`}
                            title={flag.reason}
                          >
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>{flag.ruleCode}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-botanical font-mono font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Clean / Verified</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/repository/${fdr.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border border-ink-border bg-paper-50 hover:bg-paper-200 text-ink-primary transition-colors"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3 text-ink-muted" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Breakdown Modal */}
      {selectedScore && (
        <AttentionScoreModal
          fdrNumber={selectedScore.fdrNumber}
          breakdown={selectedScore.breakdown}
          isOpen={true}
          onClose={() => setSelectedScore(null)}
        />
      )}
    </div>
  );
}

