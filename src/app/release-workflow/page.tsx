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
  const { currentRole, currentUser } = useApp();
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
          // Filter instruments with release request or status
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
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-ink-border pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-xl text-ink-primary tracking-tight">
            Security Deposit Release & Refund Governance Queue
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Multi-stage statutory discharge protocol: Regional Scrutiny → Competent Authority Sanction Order
          </p>
        </div>
        <div className="font-mono text-xs px-2.5 py-1 rounded bg-paper-200 border border-ink-border text-ink-primary">
          Acting Role: <strong className="text-saffron">{currentRole.replace("_", " ")}</strong>
        </div>
      </div>

      {/* Hard Rule Disclaimer */}
      <div className="p-4 bg-paper-100 border border-ink-border rounded text-xs space-y-1 font-mono">
        <div className="font-bold text-ink-primary flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-saffron" />
          <span>STATUTORY RELEASE GATING PROTOCOL (AICTE APH Clause 1.2.9)</span>
        </div>
        <p className="text-ink-secondary text-[11px] leading-relaxed">
          1. Security Deposit cannot be discharged while any audit discrepancy or compliance flag is open.
          2. Regional Officers can review and endorse recommendations; ONLY the Bureau Head (Competent Authority) holds the legal delegation to issue final financial sanction orders.
        </p>
      </div>

      {/* Release Requests Table */}
      <div className="border border-ink-border rounded bg-paper-50 shadow-ledger overflow-hidden">
        <div className="px-5 py-3.5 bg-paper-100 border-b border-ink-border flex items-center justify-between">
          <h3 className="font-serif font-bold text-sm text-ink-primary">
            Active Deposit Discharge Requests
          </h3>
          <span className="font-mono text-xs text-ink-muted">
            {fdrs.length} Request(s) in Pipeline
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-paper-100 font-mono text-[10px] uppercase text-ink-muted border-b border-ink-border">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Instrument Ref</th>
                <th className="py-2.5 px-4 font-semibold">Principal Sum</th>
                <th className="py-2.5 px-4 font-semibold">Stage & Status</th>
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
                        {fdr.bankName} • ID: {fdr.institutionId}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-ink-primary">
                      {formatIndianCurrency(fdr.amount)}
                    </td>

                    <td className="py-3 px-4">
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

                    <td className="py-3 px-4">
                      {hasBlock ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold border border-red-300">
                          <AlertTriangle className="w-3 h-3" />
                          <span>BLOCKED ({openFlags.length} Flags)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-botanical font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
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

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Step 1 Action: RO Recommend */}
                        {isRequested && (
                          <button
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
                          <span className="text-[11px] font-mono text-botanical font-bold">
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
      </div>

      {/* RO Recommendation Modal */}
      {recommendingFdr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-paper-50 border border-ink-border rounded shadow-ledger-elevated p-5 space-y-4">
            <h4 className="font-serif font-bold text-sm text-ink-primary">
              Regional Officer Release Scrutiny Endorsement
            </h4>
            <p className="text-xs text-ink-muted">
              Confirm regional site inspection and student grievance verification for{" "}
              <strong className="font-mono">{recommendingFdr.fdrNumber}</strong>.
            </p>
            <textarea
              value={roNote}
              onChange={(e) => setRoNote(e.target.value)}
              className="w-full h-24 p-2.5 text-xs bg-paper-100 border border-ink-border rounded focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRecommendingFdr(null)}
                className="px-3 py-1.5 text-xs text-ink-secondary hover:text-ink-primary font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleRecommendByRo}
                disabled={isSubmittingRo}
                className="px-4 py-1.5 text-xs bg-saffron hover:bg-saffron-hover text-white rounded font-medium shadow-sm"
              >
                {isSubmittingRo ? "Submitting..." : "Submit Recommendation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bureau Head Final Sanction Modal */}
      {approvingFdr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-paper-50 border border-ink-border rounded shadow-ledger-elevated p-5 space-y-4">
            <h4 className="font-serif font-bold text-sm text-ink-primary">
              Issue Official AICTE Sanction Order
            </h4>
            <p className="text-xs text-ink-muted">
              Competent Authority final discharge of deposit sum{" "}
              <strong className="font-mono">{formatIndianCurrency(approvingFdr.amount)}</strong>.
            </p>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-[10px] text-ink-muted uppercase">Sanction Order Reference</label>
                <input
                  type="text"
                  value={orderNo}
                  onChange={(e) => setOrderNo(e.target.value)}
                  className="w-full p-2 bg-paper-100 border border-ink-border rounded font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] text-ink-muted uppercase">Official Order Sanction Note</label>
                <textarea
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  className="w-full h-20 p-2 bg-paper-100 border border-ink-border rounded font-sans text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setApprovingFdr(null)}
                className="px-3 py-1.5 text-xs text-ink-secondary hover:text-ink-primary font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveByBureauHead}
                disabled={isSubmittingBureau}
                className="px-4 py-1.5 text-xs bg-botanical hover:bg-botanical-hover text-white rounded font-bold shadow-sm"
              >
                {isSubmittingBureau ? "Sanctioning..." : "Execute Official Sanction Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
