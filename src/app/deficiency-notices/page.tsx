"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FdrInstrument } from "@/types/fdr";
import { DiscrepancyFlag, DISCREPANCY_CATALOG } from "@/types/discrepancy";
import { formatIndianCurrency, formatIndianDate } from "@/lib/formatters";
import { useApp } from "@/context/AppContext";
import {
  AlertTriangle,
  FileText,
  Clock,
  Building2,
  CheckCircle2,
  ExternalLink,
  Printer,
  X,
  Filter,
  ShieldAlert,
  ArrowRight,
  Info,
} from "lucide-react";

interface FlattenedDiscrepancy {
  flag: DiscrepancyFlag;
  fdr: FdrInstrument;
}

export default function DeficiencyNoticesPage() {
  const { currentRole, currentUser } = useApp();
  const [items, setItems] = useState<FlattenedDiscrepancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "CRITICAL" | "HIGH" | "RESOLVED">("ALL");

  // Resolution modal state
  const [resolvingItem, setResolvingItem] = useState<FlattenedDiscrepancy | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  // Formal Notice Preview modal
  const [noticePreviewItem, setNoticePreviewItem] = useState<FlattenedDiscrepancy | null>(null);

  const fetchDiscrepancies = () => {
    fetch("/api/fdrs")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const list: FlattenedDiscrepancy[] = [];
          (data.data as FdrInstrument[]).forEach((fdr) => {
            if (fdr.discrepancies && fdr.discrepancies.length > 0) {
              fdr.discrepancies.forEach((flag) => {
                list.push({ flag, fdr });
              });
            }
          });
          setItems(list);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDiscrepancies();
  }, []);

  const handleResolve = async () => {
    if (!resolvingItem) return;
    setIsResolving(true);
    try {
      const res = await fetch(
        `/api/fdrs/${resolvingItem.fdr.id}/discrepancies/${resolvingItem.flag.id}/resolve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-role": currentRole,
          },
          body: JSON.stringify({
            resolutionNote: resolutionNote || "Verified physical endorsement schedule with bank manager.",
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setResolvingItem(null);
        setResolutionNote("");
        fetchDiscrepancies();
      } else {
        alert(data.error || "Resolution failed");
      }
    } finally {
      setIsResolving(false);
    }
  };

  const filtered = items.filter(({ flag }) => {
    if (activeTab === "RESOLVED") return flag.resolved;
    if (flag.resolved) return false;
    if (activeTab === "CRITICAL") return flag.severity === "CRITICAL";
    if (activeTab === "HIGH") return flag.severity === "HIGH";
    return true;
  });

  const criticalCount = items.filter((i) => !i.flag.resolved && i.flag.severity === "CRITICAL").length;
  const highCount = items.filter((i) => !i.flag.resolved && i.flag.severity === "HIGH").length;
  const resolvedCount = items.filter((i) => i.flag.resolved).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="text-[11px] font-semibold text-blue-600 tracking-wider uppercase mb-1">
          REGULATION BUREAU · COMPLIANCE SCRUTINY
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Discrepancies & Deficiency Notices
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Active regulatory discrepancies flagged by the 8-rule compliance engine during OCR ingestion or Core Banking reconciliation.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex items-center gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "ALL"
              ? "bg-blue-50 text-blue-600"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <span>All Open</span>
          <span className="bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-full text-[10px]">
            {items.filter((i) => !i.flag.resolved).length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("CRITICAL")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "CRITICAL"
              ? "bg-rose-50 text-rose-700 font-bold"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <span>Critical Risk</span>
          <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full text-[10px]">
            {criticalCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("HIGH")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "HIGH"
              ? "bg-amber-50 text-amber-700 font-bold"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <span>High Severity</span>
          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px]">
            {highCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("RESOLVED")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "RESOLVED"
              ? "bg-emerald-50 text-emerald-700"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <span>Resolved</span>
          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px]">
            {resolvedCount}
          </span>
        </button>
      </div>

      {/* Discrepancies List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500 animate-pulse">
            Scanning central registry for active discrepancies...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
            No discrepancies in the selected filter view.
          </div>
        ) : (
          filtered.map(({ flag, fdr }) => {
            const ruleMeta = DISCREPANCY_CATALOG[flag.ruleCode];
            const isCritical = flag.severity === "CRITICAL";

            return (
              <div
                key={flag.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
                  flag.resolved
                    ? "border-slate-200 opacity-80"
                    : isCritical
                    ? "border-rose-300 border-l-4 border-l-rose-500"
                    : "border-amber-300 border-l-4 border-l-amber-500"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-md">
                        {fdr.fdrNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          flag.resolved
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isCritical
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {flag.resolved ? "RESOLVED" : flag.severity}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {fdr.institutionName}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500">
                        {fdr.bankName}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {flag.title || ruleMeta?.name || flag.ruleCode}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {flag.reason}
                      </p>
                    </div>

                    {/* Evidence Box */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-mono grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 font-sans uppercase font-semibold">Declared / On Document:</span>
                        <div className="text-slate-800 font-bold mt-0.5">
                          {String(flag.evidence?.declaredValue ?? "N/A")}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-sans uppercase font-semibold">Expected / Banking Standard:</span>
                        <div className="text-rose-700 font-bold mt-0.5">
                          {String(flag.evidence?.expectedOrConfirmedValue ?? "N/A")}
                        </div>
                      </div>
                    </div>

                    {ruleMeta?.remediationHint && (
                      <div className="text-[11px] text-slate-500 flex items-start gap-1.5 pt-1">
                        <Info className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                        <span><strong>Remediation:</strong> {ruleMeta.remediationHint}</span>
                      </div>
                    )}

                    {flag.resolved && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 mt-2">
                        <span className="font-bold">Resolution Note:</span> {flag.resolutionNote}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Deposit Sum</div>
                      <div className="font-mono font-bold text-sm text-slate-900">
                        {formatIndianCurrency(fdr.amount)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!flag.resolved && (
                        <button
                          type="button"
                          onClick={() => {
                            setResolvingItem({ flag, fdr });
                            setResolutionNote("");
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
                        >
                          Resolve Flag
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setNoticePreviewItem({ flag, fdr })}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="h-3.5 w-3.5 text-slate-500" />
                        <span>Formal Notice</span>
                      </button>

                      <Link
                        href={`/repository/${fdr.id}`}
                        className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1"
                      >
                        <span>Dossier</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Resolve Discrepancy Modal */}
      {resolvingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">
                Audited Discrepancy Resolution
              </h4>
              <button
                type="button"
                onClick={() => setResolvingItem(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Recording officer override for <strong className="font-mono">{resolvingItem.flag.title}</strong> on FDR <strong className="font-mono">{resolvingItem.fdr.fdrNumber}</strong>. This action is permanently written to the SHA-256 cryptographic audit ledger.
            </p>

            <div className="space-y-2 text-xs">
              <label className="text-[11px] font-semibold text-slate-700">Official Justification / Bank Evidence</label>
              <textarea
                rows={3}
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="State verified bank letter reference, corrected IFSC, or certified deposit schedule details..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResolvingItem(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResolve}
                disabled={isResolving}
                className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold cursor-pointer shadow-xs"
              >
                {isResolving ? "Signing Ledger..." : "Commit Resolution to Ledger"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formal Deficiency Notice Modal */}
      {noticePreviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-8 max-w-2xl w-full space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  ALL INDIA COUNCIL FOR TECHNICAL EDUCATION
                </div>
                <div className="text-xs font-semibold text-slate-700">
                  REGULATION BUREAU · SECURITY DEPOSIT COMPLIANCE CELL
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  FORMAL DEFICIENCY NOTICE
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setNoticePreviewItem(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs space-y-3 leading-relaxed text-slate-700">
              <div className="flex justify-between border-b border-slate-100 pb-2 font-mono text-[11px]">
                <span>Notice Ref: <strong>AICTE/REG/DN-2026-{noticePreviewItem.flag.id.slice(-6).toUpperCase()}</strong></span>
                <span>Date: <strong>{new Date().toLocaleDateString("en-IN")}</strong></span>
              </div>

              <div>
                <strong>To:</strong> The Authorized Signatory / Principal,<br />
                {noticePreviewItem.fdr.institutionName || "Technical Institution"}<br />
                AICTE PID: {noticePreviewItem.fdr.institutionId}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div><strong>Subject:</strong> Compliance observation regarding Fixed Deposit Receipt {noticePreviewItem.fdr.fdrNumber}</div>
                <div><strong>Issuing Bank:</strong> {noticePreviewItem.fdr.bankName} ({noticePreviewItem.fdr.branchName})</div>
                <div><strong>Principal Amount:</strong> {formatIndianCurrency(noticePreviewItem.fdr.amount)}</div>
              </div>

              <p>
                During automated scrutiny under AICTE Approval Process Handbook (APH 2024–27), the following compliance deficiency was observed:
              </p>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-1">
                <div className="font-bold">{noticePreviewItem.flag.title}</div>
                <div className="text-[11px]">{noticePreviewItem.flag.reason}</div>
              </div>

              <p>
                You are hereby advised to rectify the above observation within <strong>15 days</strong> by submitting a certified tripartite lien endorsement schedule issued by your bank branch. Failure to cure the deficiency may cause invocation of statutory security provisions.
              </p>

              <div className="pt-6 flex justify-between items-end text-[11px]">
                <div>
                  Generated via FDRVault Regulation Portal<br />
                  Cryptographic Verification Seal: SHA-256
                </div>
                <div className="text-right">
                  <strong>Regional Scrutiny Officer</strong><br />
                  AICTE Regulation Bureau
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="h-4 w-4" />
                <span>Print Notice PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
