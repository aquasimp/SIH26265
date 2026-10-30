"use client";

import React, { useState, useId } from "react";
import Link from "next/link";
import { FdrInstrument } from "@/types/fdr";
import { formatIndianCurrency, formatIndianDate, formatRemainingTenure } from "@/lib/formatters";
import { CircularValidityRing } from "../fdr/CircularValidityRing";
import { AttentionScoreModal } from "../fdr/AttentionScoreModal";
import { calculateAttentionScore, AttentionScoreBreakdown } from "@/lib/rules/attentionScore";
import {
  SEVERITY_CONFIG,
  mapScoreToSeverity,
  mapFlagSeverityToTier,
  mapUrgencyToTier,
} from "@/lib/severity";
import {
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Info,
  Clock,
  Layers,
} from "lucide-react";

interface AttentionQueueTableProps {
  instruments: FdrInstrument[];
  title?: string;
  subtitle?: string;
  loading?: boolean;
}

/**
 * Interactive Score Factor Breakdown Popover
 * Explains exactly which factors produced the attention score (Maturity, Discrepancies, CBS, Renewal)
 * Critical for explainability, especially for "Clean / Verified" rows with score > 0 (e.g., 36 MODERATE).
 */
function ScoreFactorBadge({
  fdrNumber,
  breakdown,
  onOpenModal,
}: {
  fdrNumber: string;
  breakdown: AttentionScoreBreakdown;
  onOpenModal: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverId = useId();
  const severityTier = mapScoreToSeverity(breakdown.totalScore);
  const styles = SEVERITY_CONFIG[severityTier];

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          onOpenModal();
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={popoverId}
        className={`group flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all select-none ${styles.badgeBg} ${styles.badgeBorder} hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-saffron/40`}
        title={`Attention Score: ${breakdown.totalScore}/100 (${breakdown.riskTier}). Click for formula audit.`}
      >
        <span className="font-mono font-bold text-ink-primary text-xs tabular-nums">
          {breakdown.totalScore}
        </span>
        <span className="text-[10px] font-mono text-ink-muted">/100</span>
        <span
          className={`text-[9px] font-mono px-1 py-0.2 rounded uppercase ${styles.badgeText}`}
        >
          {breakdown.riskTier}
        </span>
      </button>

      {/* Accessible Explainability Popover */}
      {isOpen && (
        <div
          id={popoverId}
          role="tooltip"
          className="absolute z-40 left-0 sm:left-auto sm:right-0 top-full mt-1.5 w-72 sm:w-80 p-3 bg-paper-50 dark:bg-stone-900 border border-ink-border rounded-lg shadow-ledger-elevated text-xs pointer-events-none animate-in fade-in-0 zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-2 border-b border-ink-border">
            <span className="font-serif font-bold text-ink-primary flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-saffron" />
              Score Factor Decomposition
            </span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${styles.badgeBg} ${styles.badgeText} border ${styles.badgeBorder}`}>
              {breakdown.totalScore}/100
            </span>
          </div>

          <div className="mt-2.5 space-y-2 font-sans text-[11px]">
            {/* Factor 1: Maturity */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <span className="font-medium text-ink-primary">1. Maturity Urgency</span>
                <p className="text-[10px] text-ink-muted leading-tight mt-0.5">
                  {breakdown.maturityScore.reason}
                </p>
              </div>
              <span className="font-mono font-semibold text-ink-primary text-[10px] tabular-nums shrink-0">
                +{breakdown.maturityScore.points} / {breakdown.maturityScore.maxPoints}
              </span>
            </div>

            {/* Factor 2: Discrepancies */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <span className="font-medium text-ink-primary">2. Discrepancy Severity</span>
                <p className="text-[10px] text-ink-muted leading-tight mt-0.5">
                  {breakdown.discrepancyScore.reason}
                </p>
              </div>
              <span className="font-mono font-semibold text-ink-primary text-[10px] tabular-nums shrink-0">
                +{breakdown.discrepancyScore.points} / {breakdown.discrepancyScore.maxPoints}
              </span>
            </div>

            {/* Factor 3: CBS Verification */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <span className="font-medium text-ink-primary">3. Core Banking Verification</span>
                <p className="text-[10px] text-ink-muted leading-tight mt-0.5">
                  {breakdown.verificationScore.reason}
                </p>
              </div>
              <span className="font-mono font-semibold text-ink-primary text-[10px] tabular-nums shrink-0">
                +{breakdown.verificationScore.points} / {breakdown.verificationScore.maxPoints}
              </span>
            </div>

            {/* Factor 4: Renewal Status */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <span className="font-medium text-ink-primary">4. Renewal State</span>
                <p className="text-[10px] text-ink-muted leading-tight mt-0.5">
                  {breakdown.renewalScore.reason}
                </p>
              </div>
              <span className="font-mono font-semibold text-ink-primary text-[10px] tabular-nums shrink-0">
                +{breakdown.renewalScore.points} / {breakdown.renewalScore.maxPoints}
              </span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-ink-border text-[10px] text-saffron font-medium flex items-center justify-between">
            <span>Click to inspect calculation formula</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      )}
    </div>
  );
}

export function AttentionQueueTable({
  instruments,
  title = "Immediate Regulatory Attention Queue",
  subtitle = "Ranked by deterministic Attention Score (Days to Maturity + Discrepancies + CBS Verification)",
  loading = false,
}: AttentionQueueTableProps) {
  const [selectedScore, setSelectedScore] = useState<{
    fdrNumber: string;
    breakdown: AttentionScoreBreakdown;
  } | null>(null);

  // Group by fdrNumber to detect cross-entity collisions
  const fdrCountMap = new Map<string, number>();
  instruments.forEach((item) => {
    fdrCountMap.set(item.fdrNumber, (fdrCountMap.get(item.fdrNumber) || 0) + 1);
  });

  return (
    <div className="border border-ink-border rounded-lg bg-paper-50 shadow-ledger overflow-hidden">
      {/* Header Bar */}
      <div className="px-4 sm:px-5 py-3.5 bg-paper-100 border-b border-ink-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
        <div>
          <h3 className="font-serif font-bold text-sm text-ink-primary tracking-tight">
            {title}
          </h3>
          <p className="text-[11px] text-ink-muted mt-0.5">{subtitle}</p>
        </div>
        <div className="font-mono text-xs text-ink-muted shrink-0">
          {loading ? (
            <span className="inline-flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-saffron" />
              Loading Queue...
            </span>
          ) : (
            <span>Showing Top {instruments.length}</span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-6 space-y-4 animate-pulse">
          <div className="h-10 bg-paper-100 rounded" />
          <div className="h-14 bg-paper-100 rounded" />
          <div className="h-14 bg-paper-100 rounded" />
          <div className="h-14 bg-paper-100 rounded" />
        </div>
      ) : instruments.length === 0 ? (
        <div className="p-8 text-center text-xs text-ink-muted">
          No instruments currently require regulatory triage.
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* DESKTOP TABLE VIEW (md:block >= 768px)                                   */}
          {/* ========================================================================= */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-paper-100 font-mono text-[10px] uppercase text-ink-muted border-b border-ink-border">
                <tr>
                  <th className="py-2.5 px-4 font-semibold w-44">Validity Horizon</th>
                  <th className="py-2.5 px-4 font-semibold">Instrument, Bank & Institution</th>
                  <th className="py-2.5 px-4 font-semibold whitespace-nowrap">Amount (INR)</th>
                  <th className="py-2.5 px-4 font-semibold whitespace-nowrap">Attention Score</th>
                  <th className="py-2.5 px-4 font-semibold">Regulatory Discrepancies</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-border">
                {instruments.map((fdr) => {
                  const tenure = formatRemainingTenure(fdr.maturityDate);
                  const scoreBreakdown = calculateAttentionScore(fdr);
                  const openFlags = (fdr.discrepancies || []).filter((d) => !d.resolved);
                  const isCollision = (fdrCountMap.get(fdr.fdrNumber) || 0) > 1;

                  const tenureSeverity = mapUrgencyToTier(tenure.urgency);
                  const tenureStyles = SEVERITY_CONFIG[tenureSeverity];

                  return (
                    <tr
                      key={fdr.id}
                      className="hover:bg-paper-100/60 transition-colors group"
                    >
                      {/* Validity Horizon */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <CircularValidityRing
                            maturityDate={fdr.maturityDate}
                            size={44}
                            strokeWidth={3.5}
                          />
                          <div>
                            <div className="font-mono text-[11px] font-semibold text-ink-primary whitespace-nowrap">
                              {formatIndianDate(fdr.maturityDate)}
                            </div>
                            <div
                              className={`text-[10px] font-mono whitespace-nowrap ${tenureStyles.chipText}`}
                            >
                              {tenure.label}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Instrument & Bank & Institution */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-ink-primary text-xs">
                            {fdr.fdrNumber}
                          </span>
                          {isCollision && (
                            <span
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 shrink-0"
                              title="Duplicate instrument number pledged across 2 distinct institutions"
                            >
                              <Layers className="w-2.5 h-2.5" />
                              COLLISION (2 Inst.)
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-ink-muted mt-0.5">
                          {fdr.bankName} • {fdr.ifscCode}
                        </div>
                        {fdr.institutionName && (
                          <div className="text-[10px] text-ink-secondary mt-1 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-ink-muted shrink-0" />
                            <span
                              className="truncate max-w-[280px] font-medium"
                              title={fdr.institutionName}
                            >
                              {fdr.institutionName}
                            </span>
                            {fdr.institutionAicteId && (
                              <span className="text-[9px] font-mono text-ink-muted shrink-0">
                                ({fdr.institutionAicteId})
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 font-mono font-semibold text-ink-primary whitespace-nowrap text-xs tabular-nums">
                        {formatIndianCurrency(fdr.amount)}
                      </td>

                      {/* Attention Score with Decomposition Popover */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <ScoreFactorBadge
                          fdrNumber={fdr.fdrNumber}
                          breakdown={scoreBreakdown}
                          onOpenModal={() =>
                            setSelectedScore({
                              fdrNumber: fdr.fdrNumber,
                              breakdown: scoreBreakdown,
                            })
                          }
                        />
                      </td>

                      {/* Discrepancies with Unified Severity Map */}
                      <td className="py-3 px-4">
                        {openFlags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {openFlags.map((flag) => {
                              const flagTier = mapFlagSeverityToTier(flag.severity);
                              const flagStyle = SEVERITY_CONFIG[flagTier];
                              return (
                                <span
                                  key={flag.id}
                                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border ${flagStyle.chipBg} ${flagStyle.chipText} ${flagStyle.chipBorder}`}
                                  title={flag.reason}
                                >
                                  <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                                  <span>{flag.ruleCode}</span>
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-mono font-medium">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Clean / Verified</span>
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/repository/${fdr.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border border-ink-border bg-paper-50 hover:bg-paper-200 text-ink-primary transition-colors focus:ring-2 focus:ring-saffron/40"
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

          {/* ========================================================================= */}
          {/* MOBILE RESPONSIVE STACKED CARDS VIEW (md:hidden < 768px)                  */}
          {/* ========================================================================= */}
          <div className="block md:hidden divide-y divide-ink-border p-2 sm:p-3 space-y-3">
            {instruments.map((fdr) => {
              const tenure = formatRemainingTenure(fdr.maturityDate);
              const scoreBreakdown = calculateAttentionScore(fdr);
              const openFlags = (fdr.discrepancies || []).filter((d) => !d.resolved);
              const isCollision = (fdrCountMap.get(fdr.fdrNumber) || 0) > 1;

              const tenureSeverity = mapUrgencyToTier(tenure.urgency);
              const tenureStyles = SEVERITY_CONFIG[tenureSeverity];

              return (
                <article
                  key={fdr.id}
                  className="bg-paper-100/70 border border-ink-border rounded-lg p-3.5 space-y-3 shadow-xs"
                >
                  {/* Card Top Row: Validity Ring & Dates + Amount & Score */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <CircularValidityRing
                        maturityDate={fdr.maturityDate}
                        size={44}
                        strokeWidth={3.5}
                      />
                      <div>
                        <div className="font-mono text-xs font-bold text-ink-primary">
                          {formatIndianDate(fdr.maturityDate)}
                        </div>
                        <div
                          className={`text-[10px] font-mono ${tenureStyles.chipText}`}
                        >
                          {tenure.label}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono text-xs font-bold text-ink-primary tabular-nums">
                        {formatIndianCurrency(fdr.amount)}
                      </div>
                      <div className="mt-1 flex justify-end">
                        <ScoreFactorBadge
                          fdrNumber={fdr.fdrNumber}
                          breakdown={scoreBreakdown}
                          onOpenModal={() =>
                            setSelectedScore({
                              fdrNumber: fdr.fdrNumber,
                              breakdown: scoreBreakdown,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Middle: Instrument No, Bank, and Institution */}
                  <div className="pt-2 border-t border-ink-border/60">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono font-bold text-xs text-ink-primary">
                        {fdr.fdrNumber}
                      </span>
                      {isCollision && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300">
                          <Layers className="w-2.5 h-2.5" />
                          COLLISION
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-ink-muted mt-0.5">
                      {fdr.bankName} • {fdr.ifscCode}
                    </div>

                    {fdr.institutionName && (
                      <div className="text-[10px] text-ink-secondary mt-1 flex items-start gap-1">
                        <Building2 className="w-3.5 h-3.5 text-ink-muted shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium text-ink-primary">
                            {fdr.institutionName}
                          </span>
                          {fdr.institutionAicteId && (
                            <span className="font-mono text-ink-muted text-[9px] ml-1">
                              ({fdr.institutionAicteId})
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Discrepancy Chips & Touch Action Button */}
                  <div className="pt-2 border-t border-ink-border/60 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex-1 min-w-0">
                      {openFlags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {openFlags.map((flag) => {
                            const flagTier = mapFlagSeverityToTier(flag.severity);
                            const flagStyle = SEVERITY_CONFIG[flagTier];
                            return (
                              <span
                                key={flag.id}
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border ${flagStyle.chipBg} ${flagStyle.chipText} ${flagStyle.chipBorder}`}
                              >
                                <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                                <span>{flag.ruleCode}</span>
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-mono font-medium">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Clean / Verified</span>
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/repository/${fdr.id}`}
                      className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 text-xs font-semibold rounded-md border border-ink-border bg-paper-50 hover:bg-paper-200 text-ink-primary shrink-0 transition-colors focus:ring-2 focus:ring-saffron/40"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3.5 h-3.5 text-ink-muted" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

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
