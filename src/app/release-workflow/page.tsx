"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FdrInstrument } from "@/types/fdr";
import { formatIndianCurrency, formatIndianDate } from "@/lib/formatters";
import { useApp } from "@/context/AppContext";
import {
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  Clock,
  UserCheck,
  Building2,
} from "lucide-react";

export default function ReleaseWorkflowPage() {
  const { currentRole } = useApp();
  const [fdrs, setFdrs] = useState<FdrInstrument[]>([]);
  const [loading, setLoading] = useState(true);

  // Recommendation modal
  const [recommendingFdr, setRecommendingFdr] = useState<FdrInstrument | null>(null);
  const [roNote, setRoNote] = useState("");
  const [isSubmittingRo, setIsSubmittingRo] = useState(false);

  // Bureau Head Approval modal
  const [approvingFdr, setApprovingFdr] = useState<FdrInstrument | null>(null);
  const [orderNo, setOrderNo] = useState("");
  const [approvalNote, setApprovalNote] = useState("");
  const [isSubmittingBureau, setIsSubmittingBureau] = useState(false);

  const fetchReleaseQueue = () => {
    fetch("/api/fdrs")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const queue = data.data.filter(
            (f: FdrInstrument) =>
              f.releaseRequest ||
              f.status === "RELEASE_REQUESTED" ||
              f.status === "RELEASE_RECOMMENDED" ||
              f.status === "RELEASED"
          );
          setFdrs(queue);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReleaseQueue();
  }, []);

  const handleRecommendByRo = async () => {
    if (!recommendingFdr) return;
    setIsSubmittingRo(true);
    try {
      const res = await fetch(`/api/fdrs/${recommendingFdr.id}/release`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": currentRole,
        },
        body: JSON.stringify({
          action: "RECOMMEND",
          recommendationNote: roNote || "Permanent campus verified. All LoA conditions satisfied.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRecommendingFdr(null);
        setRoNote("");
        fetchReleaseQueue();
      } else {
        alert(data.error || "Recommendation failed");
      }
    } finally {
      setIsSubmittingRo(false);
    }
  };

  const handleApproveByBureauHead = async () => {
    if (!approvingFdr) return;
    setIsSubmittingBureau(true);
    try {
      const res = await fetch(`/api/fdrs/${approvingFdr.id}/release`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": currentRole,
        },
        body: JSON.stringify({
          action: "APPROVE",
          approvalOrderNo: orderNo || `AICTE/REG/REL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          approvalNote: approvalNote || "Sanctioned by Competent Authority under Delegation of Powers.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setApprovingFdr(null);
        setOrderNo("");
        setApprovalNote("");
        fetchReleaseQueue();
      } else {
        alert(data.error || "Approval failed");
      }
    } finally {
      setIsSubmittingBureau(false);
    }
  };

  const canRecommend = currentRole === "REGIONAL_OFFICER" || currentRole === "BUREAU_HEAD";
  const canApprove = currentRole === "BUREAU_HEAD";

  return (
    <div className="space-y-5 sm:space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="liquid-glass-card rounded-[22px] p-4.5 sm:p-5 shadow-xs">
        <h2 className="font-serif font-bold text-lg sm:text-xl text-ink-primary tracking-tight">
          Statutory Deposit Discharge & Release Gateway
        </h2>
        <p className="text-xs text-ink-muted mt-0.5">
          Dual-authorization governance flow: Regional Officer recommendation and Bureau Head final sanction
        </p>
      </div>

      {/* Release Protocol Info Card */}
      <div className="p-3.5 sm:p-4.5 liquid-glass-card rounded-[20px] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-3">
          <KeyRound className="w-5 h-5 text-saffron shrink-0" />
          <div>
            <div className="font-bold text-ink-primary font-serif">
              Regulatory Dual-Key Release Gate Active
            </div>
            <div className="text-[11px] text-ink-muted">
              Step 1: Regional Officer Scrutiny Note • Step 2: Bureau Head Formal Order
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="px-2.5 py-1 rounded bg-paper-200 border border-ink-border text-ink-secondary">
            Role: <strong>{currentRole}</strong>
          </span>
          {canApprove ? (
            <span className="px-2.5 py-1 rounded bg-botanical-subtle text-botanical font-bold border border-botanical/20">
              ● Sanctioning Power
            </span>
          ) : canRecommend ? (
            <span className="px-2.5 py-1 rounded bg-saffron-subtle text-saffron font-bold border border-saffron/20">
              ● Recommendation Power
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded bg-paper-200 text-ink-muted">
              Observer Only
            </span>
          )}
        </div>
      </div>

      {/* Main Release Queue */}
      <div className="liquid-glass-card rounded-[22px] shadow-xs overflow-hidden">
        <div className="px-4 sm:px-5 py-3.5 bg-paper-100 border-b border-ink-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <h3 className="font-serif font-bold text-sm text-ink-primary">
            Active Deposit Discharge Requests
          </h3>
          <span className="font-mono text-xs text-ink-muted">
            {fdrs.length} Request(s) in Pipeline
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-ink-muted animate-pulse">
            Loading discharge pipeline records...
          </div>
        ) : fdrs.length === 0 ? (
          <div className="p-8 text-center text-xs text-ink-muted">
            No active release requests currently pending triage.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-paper-100 font-mono text-[10px] uppercase text-ink-muted border-b border-ink-border">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Instrument & Institution</th>
                    <th className="py-2.5 px-4 font-semibold whitespace-nowrap">Principal Sum</th>
                    <th className="py-2.5 px-4 font-semibold whitespace-nowrap">Stage & Status</th>
                    <th className="py-2.5 px-4 font-semibold">Discrepancy Gate</th>
                    <th className="py-2.5 px-4 font-semibold">Last Action / Note</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Sanction Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-border">
                  {fdrs.map((fdr) => {
                    const openFlags = (fdr.discrepancies || []).filter((d) => !d.resolved);
                    const hasBlock = openFlags.length > 0;
                    const isReleased = fdr.status === "RELEASED";
                    const isRecommended = fdr.status === "RELEASE_RECOMMENDED";
                    const isRequested = fdr.status === "RELEASE_REQUESTED";

                    return (
                      <tr key={fdr.id} className="hover:bg-paper-100/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-ink-primary">
                            {fdr.fdrNumber}
                          </div>
                          <div className="text-[11px] text-ink-muted mt-0.5">
                            {fdr.bankName}
                          </div>
                          {fdr.institutionName && (
                            <div className="text-[10px] text-ink-secondary mt-0.5 truncate max-w-[240px]">
                              🏛️ {fdr.institutionName}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 font-mono font-semibold text-ink-primary whitespace-nowrap tabular-nums">
                          {formatIndianCurrency(fdr.amount)}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                              isReleased
                                ? "bg-botanical-subtle text-botanical border border-botanical/20"
                                : isRecommended
                                ? "bg-saffron-subtle text-saffron border border-saffron/20"
                                : "bg-paper-200 text-ink-primary border border-ink-border"
                            }`}
                          >
                            {fdr.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          {hasBlock ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold border border-red-300">
                              <AlertTriangle className="w-3 h-3" />
                              <span>BLOCKED ({openFlags.length} Flags)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>CLEAR FOR DISCHARGE</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-ink-secondary text-[11px] max-w-xs truncate">
                          {fdr.releaseRequest?.bureauApprovalOrderNo ? (
                            <span className="font-mono font-bold text-botanical">
                              Order: {fdr.releaseRequest.bureauApprovalOrderNo}
                            </span>
                          ) : fdr.releaseRequest?.roRecommendationNote ? (
                            <span>RO: {fdr.releaseRequest.roRecommendationNote}</span>
                          ) : (
                            <span>Req: {fdr.releaseRequest?.applicantJustification || "Initial request"}</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {/* Step 1 Action: RO Recommend */}
                            {isRequested && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (hasBlock) {
                                    alert("Release cannot be recommended while open discrepancies exist.");
                                    return;
                                  }
                                  setRecommendingFdr(fdr);
                                  setRoNote("Verified campus premises and student record integrity. Recommended.");
                                }}
                                disabled={!canRecommend}
                                className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-colors ${
                                  hasBlock || !canRecommend
                                    ? "bg-paper-200 text-ink-muted cursor-not-allowed border border-ink-border"
                                    : "bg-saffron hover:bg-saffron-hover text-white shadow-sm"
                                }`}
                                title={!canRecommend ? "Requires Regional Officer role" : ""}
                              >
                                RO Recommend
                              </button>
                            )}

                            {/* Step 2 Action: Bureau Head Final Sanction */}
                            {isRecommended && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (hasBlock) {
                                    alert("Release cannot be sanctioned while open discrepancies exist.");
                                    return;
                                  }
                                  setApprovingFdr(fdr);
                                  setOrderNo(`AICTE/REG/SANCTION-2026-${Math.floor(1000 + Math.random() * 9000)}`);
                                  setApprovalNote("Final deposit refund sanctioned by Competent Authority.");
                                }}
                                disabled={!canApprove}
                                className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-colors ${
                                  hasBlock || !canApprove
                                    ? "bg-paper-200 text-ink-muted cursor-not-allowed border border-ink-border"
                                    : "bg-botanical hover:bg-botanical-hover text-white shadow-sm font-bold"
                                }`}
                                title={!canApprove ? "Requires Bureau Head role" : ""}
                              >
                                Sanction Release
                              </button>
                            )}

                            {isReleased && (
                              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                                COMPLETED
                              </span>
                            )}

                            <Link
                              href={`/repository/${fdr.id}`}
                              className="px-2 py-1 text-xs font-mono text-ink-muted hover:text-ink-primary border border-ink-border rounded bg-paper-100"
                            >
                              View
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="block md:hidden divide-y divide-ink-border p-2 sm:p-3 space-y-3">
              {fdrs.map((fdr) => {
                const openFlags = (fdr.discrepancies || []).filter((d) => !d.resolved);
                const hasBlock = openFlags.length > 0;
                const isReleased = fdr.status === "RELEASED";
                const isRecommended = fdr.status === "RELEASE_RECOMMENDED";
                const isRequested = fdr.status === "RELEASE_REQUESTED";

                return (
                  <article
                    key={fdr.id}
                    className="bg-paper-100/70 border border-ink-border rounded-lg p-3.5 space-y-3 shadow-xs text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-mono font-bold text-xs text-ink-primary">
                          {fdr.fdrNumber}
                        </div>
                        <div className="text-[11px] text-ink-muted mt-0.5">
                          {fdr.bankName}
                        </div>
                        {fdr.institutionName && (
                          <div className="text-[10px] text-ink-secondary mt-1">
                            🏛️ {fdr.institutionName}
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-xs text-ink-primary tabular-nums">
                          {formatIndianCurrency(fdr.amount)}
                        </div>
                        <span
                          className={`mt-1 inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold ${
                            isReleased
                              ? "bg-botanical-subtle text-botanical border border-botanical/20"
                              : isRecommended
                              ? "bg-saffron-subtle text-saffron border border-saffron/20"
                              : "bg-paper-200 text-ink-primary border border-ink-border"
                          }`}
                        >
                          {fdr.status}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-ink-border/60">
                      <div className="mb-2">
                        {hasBlock ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold border border-red-300">
                            <AlertTriangle className="w-3 h-3" />
                            <span>BLOCKED ({openFlags.length} Flags)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>CLEAR FOR DISCHARGE</span>
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-ink-secondary">
                        {fdr.releaseRequest?.bureauApprovalOrderNo ? (
                          <span className="font-mono font-bold text-botanical">
                            Order: {fdr.releaseRequest.bureauApprovalOrderNo}
                          </span>
                        ) : fdr.releaseRequest?.roRecommendationNote ? (
                          <span>RO: {fdr.releaseRequest.roRecommendationNote}</span>
                        ) : (
                          <span>Req: {fdr.releaseRequest?.applicantJustification || "Initial request"}</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-ink-border/60 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isRequested && (
                          <button
                            type="button"
                            onClick={() => {
                              if (hasBlock) {
                                alert("Release cannot be recommended while open discrepancies exist.");
                                return;
                              }
                              setRecommendingFdr(fdr);
                              setRoNote("Verified campus premises and student record integrity. Recommended.");
                            }}
                            disabled={!canRecommend}
                            className={`min-h-[44px] px-3 text-xs font-mono font-semibold rounded-md transition-colors ${
                              hasBlock || !canRecommend
                                ? "bg-paper-200 text-ink-muted cursor-not-allowed border border-ink-border"
                                : "bg-saffron hover:bg-saffron-hover text-white shadow-sm"
                            }`}
                          >
                            RO Recommend
                          </button>
                        )}

                        {isRecommended && (
                          <button
                            type="button"
                            onClick={() => {
                              if (hasBlock) {
                                alert("Release cannot be sanctioned while open discrepancies exist.");
                                return;
                              }
                              setApprovingFdr(fdr);
                              setOrderNo(`AICTE/REG/SANCTION-2026-${Math.floor(1000 + Math.random() * 9000)}`);
                              setApprovalNote("Final deposit refund sanctioned by Competent Authority.");
                            }}
                            disabled={!canApprove}
                            className={`min-h-[44px] px-3 text-xs font-mono font-semibold rounded-md transition-colors ${
                              hasBlock || !canApprove
                                ? "bg-paper-200 text-ink-muted cursor-not-allowed border border-ink-border"
                                : "bg-botanical hover:bg-botanical-hover text-white shadow-sm font-bold"
                            }`}
                          >
                            Sanction Release
                          </button>
                        )}
                      </div>

                      <Link
                        href={`/repository/${fdr.id}`}
                        className="inline-flex items-center justify-center min-h-[44px] px-3.5 text-xs font-mono text-ink-secondary hover:text-ink-primary border border-ink-border rounded-md bg-paper-100 ml-auto"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* RO Recommendation Modal */}
      {recommendingFdr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-4">
          <div className="w-full max-w-md liquid-glass-card rounded-[24px] shadow-2xl p-4 sm:p-5 space-y-4 max-h-[90dvh] overflow-y-auto">
            <h4 className="font-serif font-bold text-sm text-ink-primary">
              Regional Officer — Discharge Recommendation Note
            </h4>
            <p className="text-xs text-ink-muted">
              Submitting statutory recommendation to Bureau Head for FDR <strong className="font-mono">{recommendingFdr.fdrNumber}</strong> ({formatIndianCurrency(recommendingFdr.amount)}).
            </p>

            <div className="space-y-3 text-xs font-sans">
              <div>
                <label className="text-[10px] font-mono text-ink-muted uppercase">Scrutiny Verification Note</label>
                <textarea
                  rows={3}
                  value={roNote}
                  onChange={(e) => setRoNote(e.target.value)}
                  placeholder="Record verification of permanent campus status and no pending student grievances..."
                  className="w-full p-2 bg-paper-100 border border-ink-border rounded-md text-ink-primary text-sm sm:text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRecommendingFdr(null)}
                className="px-3 py-2 text-xs text-ink-secondary hover:text-ink-primary font-mono min-h-[44px] flex items-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRecommendByRo}
                disabled={isSubmittingRo}
                className="px-4 py-2 text-xs bg-saffron hover:bg-saffron-hover text-white rounded-md font-medium shadow-sm min-h-[44px] flex items-center"
              >
                {isSubmittingRo ? "Submitting..." : "Submit Recommendation to Bureau"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bureau Head Final Approval Modal */}
      {approvingFdr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-4">
          <div className="w-full max-w-md liquid-glass-card rounded-[24px] shadow-2xl p-4 sm:p-5 space-y-4 max-h-[90dvh] overflow-y-auto">
            <h4 className="font-serif font-bold text-sm text-ink-primary">
              Bureau Head — Competent Authority Formal Discharge Sanction
            </h4>
            <p className="text-xs text-ink-muted">
              Issuing sovereign sanction order for security deposit refund: <strong className="font-mono">{approvingFdr.fdrNumber}</strong>.
            </p>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-[10px] text-ink-muted uppercase">Sanction / Despatch Order No.</label>
                <input
                  type="text"
                  value={orderNo}
                  onChange={(e) => setOrderNo(e.target.value)}
                  className="w-full p-2 bg-paper-100 border border-ink-border rounded-md font-bold text-sm sm:text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-ink-muted uppercase">Sanction Authority Endorsement</label>
                <textarea
                  rows={2}
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  className="w-full p-2 bg-paper-100 border border-ink-border rounded-md text-sm sm:text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setApprovingFdr(null)}
                className="px-3 py-2 text-xs text-ink-secondary hover:text-ink-primary font-mono min-h-[44px] flex items-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApproveByBureauHead}
                disabled={isSubmittingBureau}
                className="px-4 py-2 text-xs bg-botanical hover:bg-botanical-hover text-white rounded-md font-bold shadow-sm min-h-[44px] flex items-center"
              >
                {isSubmittingBureau ? "Sanctioning..." : "Affix Digital Seal & Sanction Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
