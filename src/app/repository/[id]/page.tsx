"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FdrInstrument, Institution } from "@/types/fdr";
import { formatIndianCurrency, formatIndianDate, formatRemainingTenure, maskSensitiveId } from "@/lib/formatters";
import { CircularValidityRing } from "@/components/fdr/CircularValidityRing";
import { LifecycleStepper } from "@/components/fdr/LifecycleStepper";
import { ProvenanceComparison } from "@/components/fdr/ProvenanceComparison";
import { AttentionScoreModal } from "@/components/fdr/AttentionScoreModal";
import { calculateAttentionScore, AttentionScoreBreakdown } from "@/lib/rules/attentionScore";
import { useApp } from "@/context/AppContext";
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Clock,
  KeyRound,
  RefreshCw,
  CheckCircle,
  Building2,
  Calendar,
  Lock,
  ExternalLink,
  History,
  FileCheck,
  Landmark,
  CheckCircle2,
  X,
  ChevronRight,
  Info,
} from "lucide-react";

export default function FdrDetailPage() {
  const params = useParams();
  const router = useRouter();
  const fdrId = params.id as string;
  const { currentRole } = useApp();

  const [fdr, setFdr] = useState<FdrInstrument | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [isQueryingBank, setIsQueryingBank] = useState(false);
  const [selectedScore, setSelectedScore] = useState<AttentionScoreBreakdown | null>(null);

  // Tab State: 7 Tabs according to Section 5
  const [activeTab, setActiveTab] = useState<
    "overview" | "document" | "verification" | "discrepancies" | "renewal" | "release" | "audit"
  >("overview");

  // Resolution modal state
  const [resolvingFlagId, setResolvingFlagId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  // Release action state
  const [releaseJustification, setReleaseJustification] = useState("");
  const [isReleasing, setIsReleasing] = useState(false);
  const [releaseError, setReleaseError] = useState<string | null>(null);

  const fetchFdr = useCallback(() => {
    fetch(`/api/fdrs/${fdrId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFdr(data.data);
          setInstitution(data.data.institution);
        }
      })
      .finally(() => setLoading(false));
  }, [fdrId]);

  useEffect(() => {
    fetchFdr();
  }, [fetchFdr]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-slate-400">
        Loading FDR regulatory dossier...
      </div>
    );
  }

  if (!fdr) {
    return (
      <div className="p-12 text-center text-xs font-mono text-red-600">
        Instrument not found in central repository.
      </div>
    );
  }

  const tenure = formatRemainingTenure(fdr.maturityDate);
  const scoreBreakdown = calculateAttentionScore(fdr);
  const openFlags = (fdr.discrepancies || []).filter((d) => !d.resolved);
  const isAuditor = currentRole === "AUDITOR";
  const displayFdrNumber = isAuditor ? maskSensitiveId(fdr.fdrNumber) : fdr.fdrNumber;

  // Action: Trigger Mock Bank Query
  const handleQueryBank = async () => {
    setIsQueryingBank(true);
    try {
      const res = await fetch(`/api/fdrs/${fdr.id}/verify`, {
        method: "POST",
        headers: { "x-user-role": currentRole },
      });
      const data = await res.json();
      if (data.success) {
        fetchFdr();
      } else {
        alert(data.error || "Bank verification failed");
      }
    } finally {
      setIsQueryingBank(false);
    }
  };

  // Action: Resolve Discrepancy
  const handleResolveFlag = async () => {
    if (!resolvingFlagId || !resolutionNote.trim()) return;
    setIsResolving(true);
    try {
      const res = await fetch(`/api/fdrs/${fdr.id}/discrepancies/${resolvingFlagId}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": currentRole,
        },
        body: JSON.stringify({ resolutionNote }),
      });
      const data = await res.json();
      if (data.success) {
        setResolvingFlagId(null);
        setResolutionNote("");
        fetchFdr();
      } else {
        alert(data.error || "Failed to resolve discrepancy");
      }
    } finally {
      setIsResolving(false);
    }
  };

  // Action: Request Release
  const handleRequestRelease = async () => {
    setIsReleasing(true);
    setReleaseError(null);
    try {
      const res = await fetch(`/api/fdrs/${fdr.id}/release`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": currentRole,
        },
        body: JSON.stringify({
          action: "REQUEST",
          justification: releaseJustification || "120-month lock-in period completed.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchFdr();
      } else {
        setReleaseError(data.error || "Release request was blocked.");
      }
    } finally {
      setIsReleasing(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "document", label: "Document" },
    { id: "verification", label: "Verification" },
    { id: "discrepancies", label: `Discrepancies (${openFlags.length})` },
    { id: "renewal", label: "Renewal History" },
    { id: "release", label: "Release History" },
    { id: "audit", label: "Audit History" },
  ];

  return (
    <div className="space-y-6 select-none animate-glass-in pb-12">
      {/* Back Navigation & Breadcrumb */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <Link
          href="/repository"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to FDR Register</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <span>AICTE CENTRAL REGISTER</span>
          <span>•</span>
          <span className="font-bold text-blue-600">{fdr.fdrNumber}</span>
        </div>
      </div>

      {/* TOP SECTION: DOSSIER BANNER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <CircularValidityRing maturityDate={fdr.maturityDate} size={70} strokeWidth={6} />
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-mono text-xl sm:text-2xl font-black text-slate-900">
                {displayFdrNumber}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {fdr.status}
              </span>
              {openFlags.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                  {openFlags.length} Open Observations
                </span>
              )}
            </div>

            <div className="text-xs text-slate-600 font-medium">
              <span className="font-bold text-slate-800">{fdr.bankName}</span> • {fdr.branchName} • IFSC:{" "}
              <span className="font-mono font-semibold text-slate-700">{fdr.ifscCode}</span>
            </div>

            {institution && (
              <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-700">{institution.name}</span>
                <span className="font-mono text-slate-400">({institution.aicteId})</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Financial Specs & Attention Score */}
        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 shrink-0">
          <div>
            <div className="text-[10.5px] uppercase font-bold text-slate-400">
              Pledged Deposit
            </div>
            <div className="font-mono text-2xl font-black text-slate-900 mt-0.5">
              {formatIndianCurrency(fdr.amount)}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              Tenure: {fdr.tenureMonths} Months ({fdr.tenureMonths / 12} Yrs)
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedScore(scoreBreakdown)}
            className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50/70 hover:bg-blue-50/30 text-left transition-all cursor-pointer shadow-2xs"
            title="Inspect transparent scoring model"
          >
            <div className="text-[10px] uppercase font-bold text-slate-400">
              Attention Score
            </div>
            <div className="font-mono text-lg font-black text-blue-600 mt-0.5">
              {scoreBreakdown.totalScore}
              <span className="text-[10.5px] text-slate-400 font-normal">/100</span>
            </div>
            <div className="text-[9.5px] font-bold text-slate-600 uppercase">
              {scoreBreakdown.riskTier} RISK
            </div>
          </button>
        </div>
      </div>

      {/* FINANCIAL INSTRUMENT SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs text-xs">
        <div>
          <span className="text-slate-400 font-medium text-[11px] block">Issue Date</span>
          <span className="font-semibold text-slate-800 font-mono mt-0.5 block">
            {formatIndianDate(fdr.issueDate)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-medium text-[11px] block">Maturity Date</span>
          <span className="font-semibold text-slate-800 font-mono mt-0.5 block">
            {formatIndianDate(fdr.maturityDate)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-medium text-[11px] block">Lien Status</span>
          <span className="font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>AICTE Lien Marked</span>
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-medium text-[11px] block">Joint Account Holder</span>
          <span className="font-medium text-slate-800 truncate block mt-0.5" title={fdr.jointAccountHolder}>
            {fdr.jointAccountHolder}
          </span>
        </div>
      </div>

      {/* TAB NAVIGATION (7 TABS) */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px cursor-pointer ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">
              Statutory Lifecycle Stepper
            </h3>
            <LifecycleStepper status={fdr.status} releaseRequested={!!fdr.releaseRequest} />
          </div>

          <ProvenanceComparison
            provenance={fdr.provenance}
            verificationStatus={fdr.verificationStatus}
            onTriggerBankQuery={handleQueryBank}
            isQuerying={isQueryingBank}
          />
        </div>
      )}

      {/* TAB 2: DOCUMENT */}
      {activeTab === "document" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Digital Document Vault & Scanned Receipts</span>
            </h3>
            <span className="text-xs text-slate-500">
              {fdr.documents?.length || 0} File(s) Stored
            </span>
          </div>

          {fdr.documents && fdr.documents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fdr.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-900">{doc.name}</div>
                      <div className="text-[10.5px] text-slate-400">
                        v{doc.version} · {doc.fileSizeKb} KB · Uploaded by {doc.uploadedBy}
                      </div>
                    </div>
                  </div>
                  <a
                    href={doc.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-blue-600 hover:text-blue-800"
                    title="View Certificate"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No scanned certificate uploaded for this instrument.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VERIFICATION */}
      {activeTab === "verification" && (
        <div className="space-y-4">
          <ProvenanceComparison
            provenance={fdr.provenance}
            verificationStatus={fdr.verificationStatus}
            onTriggerBankQuery={handleQueryBank}
            isQuerying={isQueryingBank}
          />
        </div>
      )}

      {/* TAB 4: DISCREPANCIES */}
      {activeTab === "discrepancies" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Compliance Observations & Discrepancies</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Evaluated against AICTE 8 Deterministic Rules
            </span>
          </div>

          {(fdr.discrepancies || []).length > 0 ? (
            <div className="space-y-3">
              {fdr.discrepancies.map((flag) => (
                <div
                  key={flag.id}
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    flag.resolved
                      ? "bg-slate-50 border-slate-200 text-slate-600"
                      : "bg-red-50/60 border-red-200 text-red-900"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <span>{flag.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 uppercase">
                          {flag.ruleCode}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            flag.severity === "CRITICAL"
                              ? "bg-red-600 text-white"
                              : "bg-amber-600 text-white"
                          }`}
                        >
                          {flag.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {flag.reason}
                      </p>
                    </div>

                    {!flag.resolved && currentRole !== "AUDITOR" && (
                      <button
                        type="button"
                        onClick={() => {
                          setResolvingFlagId(flag.id);
                          setResolutionNote("");
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
                      >
                        Resolve with Note
                      </button>
                    )}
                  </div>

                  {flag.resolved && (
                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                      <strong>Resolved by:</strong> {flag.resolvedBy} on {formatIndianDate(flag.resolvedAt || "")}
                      <div><strong>Note:</strong> {flag.resolutionNote}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-emerald-700 bg-emerald-50 rounded-xl font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zero compliance discrepancies detected. Instrument is 100% compliant.</span>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: RENEWAL HISTORY */}
      {activeTab === "renewal" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-blue-600" />
            <span>Replacement & Renewal History</span>
          </h3>

          <div className="text-xs text-slate-600 space-y-2">
            <div>
              <strong>Current Status:</strong> {fdr.status}
            </div>
            {fdr.replacesFdrId && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <span>This instrument replaces matured deposit: </span>
                <Link href={`/repository/${fdr.replacesFdrId}`} className="font-bold text-blue-700 underline">
                  {fdr.replacesFdrId}
                </Link>
              </div>
            )}
            {fdr.replacedByFdrId && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span>This instrument was superseded by renewal deposit: </span>
                <Link href={`/repository/${fdr.replacedByFdrId}`} className="font-bold text-emerald-700 underline">
                  {fdr.replacedByFdrId}
                </Link>
              </div>
            )}
            {!fdr.replacesFdrId && !fdr.replacedByFdrId && (
              <p className="text-slate-400">
                Original 10-year lock-in deposit under Chapter I norms. No replacement filed yet.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: RELEASE HISTORY */}
      {activeTab === "release" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-600" />
              <span>Statutory Release & Refund Governance</span>
            </h3>
            <span className="text-xs font-bold text-blue-600 font-mono">
              Stage: {fdr.releaseRequest?.status || "NOT_INITIATED"}
            </span>
          </div>

          {fdr.releaseRequest ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">
                  Release Request ID: {fdr.releaseRequest.id}
                </span>
                <span className="text-slate-500">{formatIndianDate(fdr.releaseRequest.requestedAt)}</span>
              </div>
              <p>
                <strong>Institution Justification:</strong> {fdr.releaseRequest.applicantJustification}
              </p>
              {fdr.releaseRequest.roRecommendationNote && (
                <p className="text-blue-800 bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                  <strong>RO Endorsement:</strong> {fdr.releaseRequest.roRecommendationNote} (By {fdr.releaseRequest.roRecommendedBy})
                </p>
              )}
              {fdr.releaseRequest.bureauApprovalOrderNo && (
                <p className="text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                  <strong>Sanction Order:</strong> {fdr.releaseRequest.bureauApprovalOrderNo} (Approved by {fdr.releaseRequest.bureauApprovedBy})
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Security deposits may only be released upon completion of the mandatory 120-month lock-in period, permanent site inspection clearance, and zero pending compliance flags.
              </p>
              {openFlags.length > 0 ? (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Release request is blocked because {openFlags.length} discrepancy flag(s) remain open.</span>
                </div>
              ) : (
                <div className="pt-2">
                  <Link
                    href="/release-workflow"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <span>Proceed to Release Workflow</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 7: AUDIT HISTORY */}
      {activeTab === "audit" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              <span>Immutable SHA-256 Event Trail</span>
            </h3>
            <Link href="/audit-trail" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View Global Ledger →
            </Link>
          </div>

          <p className="text-xs text-slate-500">
            All lifecycle actions (submission, verification, discrepancy resolution, release) are cryptographically chained to guarantee non-repudiation.
          </p>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
            <div className="flex items-center justify-between font-mono text-[11px] text-slate-500">
              <span>GENESIS ANCHOR: FDR INTAKE</span>
              <span>SHA-256 VALIDATED</span>
            </div>
            <div className="font-mono text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200 truncate">
              Entity: {fdr.id} · Action: FDR_SUBMITTED · Role: INSTITUTION_USER
            </div>
          </div>
        </div>
      )}

      {/* Resolution Modal */}
      {resolvingFlagId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <h4 className="font-bold text-base text-slate-900">
              Resolve Compliance Discrepancy
            </h4>
            <p className="text-xs text-slate-500">
              Record officer justification. This action is permanently committed to the cryptographic audit trail.
            </p>
            <textarea
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="e.g. Certified bank confirmation letter received from branch manager verifying deposit lien."
              className="w-full h-24 p-3 border border-slate-300 rounded-xl text-xs focus:border-blue-500 focus:outline-hidden text-slate-800"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setResolvingFlagId(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResolveFlag}
                disabled={isResolving || !resolutionNote.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                {isResolving ? "Committing..." : "Commit Resolution"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attention Score Modal */}
      {selectedScore && (
        <AttentionScoreModal
          fdrNumber={fdr.fdrNumber}
          breakdown={selectedScore}
          isOpen={true}
          onClose={() => setSelectedScore(null)}
        />
      )}
    </div>
  );
}
