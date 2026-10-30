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
  RotateCw,
  CheckCircle,
  Building2,
  Calendar,
  Lock,
  ExternalLink,
} from "lucide-react";

export default function FdrDetailPage() {
  const params = useParams();
  const router = useRouter();
  const fdrId = params.id as string;
  const { currentRole, currentUser } = useApp();

  const [fdr, setFdr] = useState<FdrInstrument | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [isQueryingBank, setIsQueryingBank] = useState(false);
  const [selectedScore, setSelectedScore] = useState<AttentionScoreBreakdown | null>(null);

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
      <div className="p-8 text-center text-xs font-mono text-ink-muted">
        Loading regulatory deposit ledger details...
      </div>
    );
  }

  if (!fdr) {
    return (
      <div className="p-8 text-center text-xs font-mono text-red-600">
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

  // Action: Request Release (Institution User)
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
          justification: releaseJustification || "Lock-in period fulfilled without adverse findings.",
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

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-6xl mx-auto">
      {/* Back Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-ink-border pb-3 gap-2">
        <Link
          href="/repository"
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink-primary font-mono transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Central Repository</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-ink-muted">AICTE WRO REGISTRY</span>
          <span className="text-ink-border">•</span>
          <span className="text-saffron font-semibold">{fdr.status}</span>
        </div>
      </div>

      {/* Main Header Card with Validity Ring & Key Badges */}
      <div className="p-5 sm:p-6 liquid-glass-card rounded-[22px] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <CircularValidityRing maturityDate={fdr.maturityDate} size={72} strokeWidth={6} />
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h2 className="font-mono text-xl font-bold text-ink-primary">
                {displayFdrNumber}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-paper-200 border border-ink-border text-ink-primary">
                {fdr.status}
              </span>
            </div>
            <div className="text-xs text-ink-secondary">
              <span className="font-semibold">{fdr.bankName}</span> • {fdr.branchName} • IFSC:{" "}
              <span className="font-mono font-semibold">{fdr.ifscCode}</span>
            </div>
            {institution && (
              <div className="text-xs text-ink-muted flex items-center gap-1.5 pt-0.5">
                <Building2 className="w-3.5 h-3.5 text-ink-muted" />
                <span>
                  {institution.name} ({institution.aicteId})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Financial Specs & Attention Score */}
        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-ink-border pt-4 md:pt-0 md:pl-6">
          <div>
            <div className="text-[10px] uppercase font-mono text-ink-muted">
              Pledged Deposit
            </div>
            <div className="font-mono text-xl font-bold text-ink-primary">
              {formatIndianCurrency(fdr.amount)}
            </div>
            <div className="text-[10px] text-ink-muted font-mono">
              Tenure: {fdr.tenureMonths} Months
            </div>
          </div>

          <button
            onClick={() => setSelectedScore(scoreBreakdown)}
            className="p-3 rounded-2xl glass-well border border-ink-border hover:border-amber-500/50 text-left transition-all cursor-pointer"
            title="Inspect transparent scoring model"
          >
            <div className="text-[9px] uppercase font-mono text-ink-muted">
              Attention Index
            </div>
            <div className="font-mono text-lg font-bold text-saffron">
              {scoreBreakdown.totalScore}
              <span className="text-[10px] text-ink-muted font-normal">/100</span>
            </div>
            <div className="text-[9px] font-mono font-bold text-ink-muted uppercase">
              {scoreBreakdown.riskTier} RISK
            </div>
          </button>
        </div>
      </div>

      {/* Drawn Lifecycle Stepper */}
      <LifecycleStepper status={fdr.status} releaseRequested={!!fdr.releaseRequest} />

      {/* Discrepancy Alert Banner if Open */}
      {openFlags.length > 0 && (
        <div className="p-4 rounded border border-red-300 bg-red-50 dark:bg-red-950/40 text-xs space-y-3">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-semibold font-serif">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>
              {openFlags.length} Regulatory Discrepanc{openFlags.length > 1 ? "ies" : "y"} Flagged For Officer Scrutiny
            </span>
          </div>

          <div className="space-y-2">
            {openFlags.map((flag) => (
              <div
                key={flag.id}
                className="p-3 rounded bg-paper-50 border border-red-200 dark:border-red-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="font-mono font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                    <span>[{flag.ruleCode}]</span>
                    <span>{flag.title}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 uppercase font-sans">
                      {flag.severity}
                    </span>
                  </div>
                  <div className="text-ink-secondary text-[11px] mt-1">
                    {flag.reason}
                  </div>
                </div>

                {currentRole !== "AUDITOR" && currentRole !== "INSTITUTION_USER" && (
                  <button
                    onClick={() => {
                      setResolvingFlagId(flag.id);
                      setResolutionNote("");
                    }}
                    className="shrink-0 px-3 py-1.5 text-xs font-mono font-medium rounded bg-paper-200 border border-ink-border hover:bg-paper-300 text-ink-primary transition-colors"
                  >
                    Resolve with Note
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Provenance Matrix: Declared vs Bank Confirmed */}
      <ProvenanceComparison
        provenance={fdr.provenance}
        verificationStatus={fdr.verificationStatus}
        onTriggerBankQuery={handleQueryBank}
        isQuerying={isQueryingBank}
      />

      {/* Release & Refund Governance Section */}
      <div className="p-5 sm:p-6 liquid-glass-card rounded-[22px] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-ink-border pb-3">
          <div>
            <h3 className="font-serif font-bold text-sm text-ink-primary">
              Statutory Release & Refund Governance
            </h3>
            <p className="text-xs text-ink-muted">
              Preconditions: 120-month lock-in fulfilled, permanent site compliant, zero open discrepancies
            </p>
          </div>
          <div className="font-mono text-xs">
            {fdr.status === "RELEASED" ? (
              <span className="px-2 py-0.5 rounded bg-botanical-subtle text-botanical font-semibold border border-botanical/20">
                ● FULLY DISCHARGED
              </span>
            ) : openFlags.length > 0 ? (
              <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-semibold border border-red-300">
                RELEASE BLOCKED (DISCREPANCIES OPEN)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-paper-200 text-ink-secondary font-semibold border border-ink-border">
                ELIGIBLE FOR INITIATION
              </span>
            )}
          </div>
        </div>

        {releaseError && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-300 rounded text-xs text-red-700 dark:text-red-300 font-mono">
            {releaseError}
          </div>
        )}

        {/* Existing Release Request State */}
        {fdr.releaseRequest ? (
          <div className="p-4 bg-paper-100 border border-ink-border rounded text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase text-ink-muted">
                Release Request #{fdr.releaseRequest.id}
              </span>
              <span className="font-semibold text-saffron">
                Stage: {fdr.releaseRequest.status}
              </span>
            </div>
            <p className="text-ink-secondary">
              <strong className="text-ink-primary">Applicant Justification:</strong>{" "}
              {fdr.releaseRequest.applicantJustification}
            </p>
            {fdr.releaseRequest.roRecommendationNote && (
              <p className="text-ink-secondary">
                <strong className="text-botanical">RO Scrutiny Note:</strong>{" "}
                {fdr.releaseRequest.roRecommendationNote} (By {fdr.releaseRequest.roRecommendedBy})
              </p>
            )}
            {fdr.releaseRequest.bureauApprovalOrderNo && (
              <div className="p-2.5 bg-paper-50 border border-botanical/30 rounded text-botanical font-mono font-medium">
                Sanction Order: {fdr.releaseRequest.bureauApprovalOrderNo} — Approved by{" "}
                {fdr.releaseRequest.bureauApprovedBy}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            <p className="text-xs text-ink-muted">
              {openFlags.length > 0
                ? "Hard rule enforced: Institution or Officer cannot initiate refund while compliance observations remain active."
                : "All statutory checks verified. Institution may submit formal release request."}
            </p>
            {currentRole === "INSTITUTION_USER" && (
              <button
                onClick={handleRequestRelease}
                disabled={openFlags.length > 0 || isReleasing}
                className={`px-4 py-2 text-xs font-medium rounded transition-colors shadow-sm shrink-0 ${
                  openFlags.length > 0
                    ? "bg-paper-300 text-ink-muted cursor-not-allowed"
                    : "bg-saffron hover:bg-saffron-hover text-white"
                }`}
              >
                {isReleasing ? "Submitting..." : "Initiate Release Request"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Document Vault */}
      <div className="p-5 sm:p-6 liquid-glass-card rounded-[22px] shadow-xs space-y-3">
        <h3 className="font-serif font-bold text-sm text-ink-primary">
          Digital Document Vault & Audit Certificates
        </h3>
        {fdr.documents && fdr.documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fdr.documents.map((doc) => (
              <div
                key={doc.id}
                className="p-3 bg-paper-100 border border-ink-border rounded flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-saffron shrink-0" />
                  <div>
                    <div className="font-medium text-ink-primary">{doc.name}</div>
                    <div className="text-[10px] text-ink-muted font-mono">
                      v{doc.version} • {doc.fileSizeKb} KB • Uploaded by {doc.uploadedBy}
                    </div>
                  </div>
                </div>
                <a
                  href={doc.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-ink-muted hover:text-ink-primary"
                  title="Preview document"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-paper-100 rounded text-xs text-ink-muted text-center font-mono">
            No digital attachments uploaded yet.
          </div>
        )}
      </div>

      {/* Discrepancy Resolution Modal */}
      {resolvingFlagId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md liquid-glass-card rounded-[24px] shadow-2xl p-5 space-y-4">
            <h4 className="font-serif font-bold text-sm text-ink-primary">
              Resolve Regulatory Discrepancy Flag
            </h4>
            <p className="text-xs text-ink-muted">
              Record officer justification. This action is permanently committed to the SHA-256 audit trail.
            </p>
            <textarea
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="e.g., Issuing bank verified via certified stamp letter Ref #SBI/RO/2026/891. Lien confirmed."
              className="w-full h-24 p-2.5 text-xs bg-paper-100 border border-ink-border rounded focus:outline-none text-ink-primary placeholder:text-ink-muted"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setResolvingFlagId(null)}
                className="px-3 py-1.5 text-xs text-ink-secondary hover:text-ink-primary font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveFlag}
                disabled={isResolving || !resolutionNote.trim()}
                className="px-4 py-1.5 text-xs bg-botanical hover:bg-botanical-hover text-white rounded font-medium shadow-sm"
              >
                {isResolving ? "Committing..." : "Commit Resolution"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attention Score Calculation Modal */}
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

