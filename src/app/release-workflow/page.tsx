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
  X,
  FileText,
  Lock,
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="text-[11px] font-semibold text-blue-600 tracking-wider uppercase mb-1">
          REGULATION BUREAU · RELEASE WORKFLOW
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Release & Refund Governance Gate
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Multi-tier statutory authorization workflow: Regional Officer scrutiny followed by Bureau Head formal sanction.
            </p>
          </div>
        </div>
      </div>

      {/* Protocol Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm">
              Dual-Key Regulatory Gate Active
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Hard gate prevents release recommendation or sanction whenever active discrepancies exist on the instrument.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium">
            Active Role: <strong className="text-slate-900">{currentRole}</strong>
          </span>
          {canApprove ? (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              Sanction Authority
            </span>
          ) : canRecommend ? (
            <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              Recommendation Authority
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 font-medium">
              Read-Only Observer
            </span>
          )}
        </div>
      </div>

      {/* Main Release Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-900">
            Active Deposit Discharge Requests ({fdrs.length})
          </h3>
          <span className="text-xs text-slate-500">
            Automated Discrepancy Gate Enabled
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
            Loading discharge pipeline records...
          </div>
        ) : fdrs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No active release requests currently pending triage.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Instrument & Institution</th>
                  <th className="py-3 px-4">Principal Amount</th>
                  <th className="py-3 px-4">Status & Stage</th>
                  <th className="py-3 px-4">Discrepancy Hard Gate</th>
                  <th className="py-3 px-4">Scrutiny Order Note</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fdrs.map((fdr) => {
                  const openFlags = (fdr.discrepancies || []).filter((d) => !d.resolved);
                  const hasBlock = openFlags.length > 0;
                  const isReleased = fdr.status === "RELEASED";
                  const isRecommended = fdr.status === "RELEASE_RECOMMENDED";
                  const isRequested = fdr.status === "RELEASE_REQUESTED";

                  return (
                    <tr key={fdr.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900">
                          {fdr.fdrNumber}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {fdr.bankName} • {fdr.branchName}
                        </div>
                        {fdr.institutionName && (
                          <div className="text-[11px] text-slate-700 font-medium mt-0.5 truncate max-w-xs">
                            {fdr.institutionName}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                        {formatIndianCurrency(fdr.amount)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            isReleased
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isRecommended
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {fdr.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {hasBlock ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>BLOCKED ({openFlags.length} Flags)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Clear for Discharge</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 text-[11px] max-w-xs truncate">
                        {fdr.releaseRequest?.bureauApprovalOrderNo ? (
                          <span className="font-mono font-bold text-emerald-700">
                            Order: {fdr.releaseRequest.bureauApprovalOrderNo}
                          </span>
                        ) : fdr.releaseRequest?.roRecommendationNote ? (
                          <span>RO: {fdr.releaseRequest.roRecommendationNote}</span>
                        ) : (
                          <span>Req: {fdr.releaseRequest?.applicantJustification || "Initial request"}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
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
                              disabled={!canRecommend || hasBlock}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                                hasBlock || !canRecommend
                                  ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
                              }`}
                              title={hasBlock ? "Discrepancy must be resolved first" : !canRecommend ? "Requires Regional Officer role" : ""}
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
                              disabled={!canApprove || hasBlock}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                                hasBlock || !canApprove
                                  ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                              }`}
                              title={hasBlock ? "Discrepancy must be resolved first" : !canApprove ? "Requires Bureau Head role" : ""}
                            >
                              Sanction Release
                            </button>
                          )}

                          {isReleased && (
                            <span className="text-[11px] font-semibold text-emerald-700">
                              Discharge Completed
                            </span>
                          )}

                          <Link
                            href={`/repository/${fdr.id}`}
                            className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 font-medium"
                          >
                            Dossier
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RO Recommendation Modal */}
      {recommendingFdr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">
                Regional Officer Scrutiny Recommendation
              </h4>
              <button
                type="button"
                onClick={() => setRecommendingFdr(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Submitting statutory recommendation to Bureau Head for FDR <strong className="font-mono">{recommendingFdr.fdrNumber}</strong> ({formatIndianCurrency(recommendingFdr.amount)}).
            </p>

            <div className="space-y-2 text-xs">
              <label className="text-[11px] font-semibold text-slate-700">Scrutiny Verification Note</label>
              <textarea
                rows={3}
                value={roNote}
                onChange={(e) => setRoNote(e.target.value)}
                placeholder="Record verification of permanent campus status and student record integrity..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRecommendingFdr(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRecommendByRo}
                disabled={isSubmittingRo}
                className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold cursor-pointer shadow-xs"
              >
                {isSubmittingRo ? "Submitting..." : "Submit Recommendation to Bureau"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bureau Head Final Approval Modal */}
      {approvingFdr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">
                Bureau Head Formal Discharge Sanction Order
              </h4>
              <button
                type="button"
                onClick={() => setApprovingFdr(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Issuing sovereign sanction order for security deposit refund: <strong className="font-mono">{approvingFdr.fdrNumber}</strong>.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-700">Sanction / Despatch Order Number</label>
                <input
                  type="text"
                  value={orderNo}
                  onChange={(e) => setOrderNo(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold mt-1 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700">Competent Authority Endorsement</label>
                <textarea
                  rows={2}
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs mt-1 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setApprovingFdr(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApproveByBureauHead}
                disabled={isSubmittingBureau}
                className="px-4 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold cursor-pointer shadow-xs"
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
