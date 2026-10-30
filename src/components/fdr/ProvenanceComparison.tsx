"use client";

import React from "react";
import { FdrProvenance, VerificationStatus } from "@/types/fdr";
import { formatIndianCurrency, formatIndianDate } from "@/lib/formatters";
import { Check, X, Clock, HelpCircle, ShieldAlert } from "lucide-react";

interface ProvenanceComparisonProps {
  provenance: FdrProvenance;
  verificationStatus: VerificationStatus;
  onTriggerBankQuery?: () => void;
  isQuerying?: boolean;
}

export function ProvenanceComparison({
  provenance,
  onTriggerBankQuery,
  isQuerying,
}: ProvenanceComparisonProps) {
  const fields = [
    {
      key: "fdrNumber",
      label: "FDR Receipt Number",
      declared: provenance.fdrNumber.declared,
      confirmed: provenance.fdrNumber.confirmed,
      matchStatus: provenance.fdrNumber.matchStatus,
    },
    {
      key: "bankName",
      label: "Issuing Bank",
      declared: provenance.bankName.declared,
      confirmed: provenance.bankName.confirmed,
      matchStatus: provenance.bankName.matchStatus,
    },
    {
      key: "ifscCode",
      label: "Branch IFSC Code",
      declared: provenance.ifscCode.declared,
      confirmed: provenance.ifscCode.confirmed,
      matchStatus: provenance.ifscCode.matchStatus,
    },
    {
      key: "amount",
      label: "Principal Deposit Sum",
      declared: formatIndianCurrency(provenance.amount.declared),
      confirmed: provenance.amount.confirmed !== undefined ? formatIndianCurrency(provenance.amount.confirmed) : undefined,
      matchStatus: provenance.amount.matchStatus,
    },
    {
      key: "maturityDate",
      label: "Date of Maturity",
      declared: formatIndianDate(provenance.maturityDate.declared),
      confirmed: provenance.maturityDate.confirmed ? formatIndianDate(provenance.maturityDate.confirmed) : undefined,
      matchStatus: provenance.maturityDate.matchStatus,
    },
    {
      key: "lienMarked",
      label: "AICTE Lien Inscription",
      declared: provenance.lienMarked.declared ? "Lien Marked (Yes)" : "Unmarked (No)",
      confirmed: provenance.lienMarked.confirmed !== undefined ? (provenance.lienMarked.confirmed ? "Lien Registered" : "NO LIEN FOUND") : undefined,
      matchStatus: provenance.lienMarked.matchStatus,
    },
  ];

  return (
    <div className="liquid-glass-card rounded-[22px] overflow-hidden shadow-xs">
      {/* Table Header with Mock Banner */}
      <div className="p-3.5 sm:p-4.5 border-b border-ink-border glass-well flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h4 className="font-serif font-bold text-xs sm:text-sm text-ink-primary">
            Dual-Source Provenance Verification Matrix
          </h4>
          <p className="text-[11px] text-ink-muted">
            Auditable comparison: Applicant Declaration vs Core Banking Gateway (MOCK)
          </p>
        </div>
        {onTriggerBankQuery && (
          <button
            type="button"
            onClick={onTriggerBankQuery}
            disabled={isQuerying}
            className="px-3 py-2 sm:py-1.5 text-xs font-mono font-medium rounded-md border border-ink-border bg-paper-50 hover:bg-paper-200 text-ink-primary flex items-center justify-center gap-1.5 transition-colors min-h-[40px] sm:min-h-0 shrink-0"
          >
            <Clock className={`w-3.5 h-3.5 ${isQuerying ? "animate-spin" : ""}`} />
            <span>Query Core Banking (MOCK)</span>
          </button>
        )}
      </div>

      {/* Desktop Table View (>= 768px) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-paper-100 text-ink-muted font-mono text-[10px] uppercase border-b border-ink-border">
            <tr>
              <th className="py-2.5 px-4 font-semibold">Regulatory Parameter</th>
              <th className="py-2.5 px-4 font-semibold">Submitted by Institution</th>
              <th className="py-2.5 px-4 font-semibold">Confirmed by Bank (MOCK CBS)</th>
              <th className="py-2.5 px-4 font-semibold text-right">Audit Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-border font-mono">
            {fields.map((f) => (
              <tr key={f.key} className="hover:bg-paper-100/50 transition-colors">
                <td className="py-2.5 px-4 font-medium text-ink-primary font-sans">
                  {f.label}
                </td>
                <td className="py-2.5 px-4 text-ink-secondary">
                  {f.declared}
                </td>
                <td className="py-2.5 px-4">
                  {f.confirmed !== undefined ? (
                    <span className={f.matchStatus === "MATCH" ? "text-botanical font-bold" : "text-red-700 font-bold"}>
                      {f.confirmed}
                    </span>
                  ) : (
                    <span className="text-ink-muted italic">Awaiting API confirmation...</span>
                  )}
                </td>
                <td className="py-2.5 px-4 text-right">
                  {f.matchStatus === "MATCH" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-botanical-subtle text-botanical border border-botanical/20">
                      <Check className="w-3 h-3" />
                      <span>MATCH</span>
                    </span>
                  ) : f.matchStatus === "MISMATCH" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-300">
                      <X className="w-3 h-3" />
                      <span>MISMATCH</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-paper-200 text-ink-muted border border-ink-border">
                      <HelpCircle className="w-3 h-3" />
                      <span>UNVERIFIED</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View (< 768px) */}
      <div className="block md:hidden divide-y divide-ink-border p-2 sm:p-3 space-y-2.5 font-mono">
        {fields.map((f) => (
          <div key={f.key} className="bg-paper-100/60 border border-ink-border rounded-md p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-sans font-bold text-ink-primary">{f.label}</span>
              {f.matchStatus === "MATCH" ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-botanical-subtle text-botanical border border-botanical/20">
                  <Check className="w-2.5 h-2.5" />
                  <span>MATCH</span>
                </span>
              ) : f.matchStatus === "MISMATCH" ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-300">
                  <X className="w-2.5 h-2.5" />
                  <span>MISMATCH</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-paper-200 text-ink-muted border border-ink-border">
                  <HelpCircle className="w-2.5 h-2.5" />
                  <span>UNVERIFIED</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-ink-border/50 text-[11px]">
              <div>
                <span className="text-[9px] uppercase font-sans text-ink-muted block">Declared</span>
                <span className="text-ink-secondary">{f.declared}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-sans text-ink-muted block">Bank CBS</span>
                <span className={f.matchStatus === "MATCH" ? "text-botanical font-bold" : "text-red-700 font-bold"}>
                  {f.confirmed !== undefined ? f.confirmed : "Awaiting API..."}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
