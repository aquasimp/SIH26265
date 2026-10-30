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
  verificationStatus,
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
    <div className="border border-ink-border rounded bg-paper-50 overflow-hidden shadow-ledger">
      {/* Table Header with Mock Banner */}
      <div className="px-4 py-3 bg-paper-100 border-b border-ink-border flex items-center justify-between">
        <div>
          <h4 className="font-serif font-bold text-xs text-ink-primary">
            Dual-Source Provenance Verification Matrix
          </h4>
          <p className="text-[11px] text-ink-muted">
            Auditable comparison: Applicant Declaration vs Core Banking Gateway (MOCK)
          </p>
        </div>
        {onTriggerBankQuery && (
          <button
            onClick={onTriggerBankQuery}
            disabled={isQuerying}
            className="px-3 py-1.5 text-xs font-mono font-medium rounded border border-ink-border bg-paper-50 hover:bg-paper-200 text-ink-primary flex items-center gap-1.5 transition-colors"
          >
            <Clock className={`w-3.5 h-3.5 ${isQuerying ? "animate-spin" : ""}`} />
            <span>Query Core Banking (MOCK)</span>
          </button>
        )}
      </div>

      {/* Provenance Table */}
      <table className="w-full text-xs text-left">
        <thead className="bg-paper-100 text-ink-muted font-mono text-[10px] uppercase border-b border-ink-border">
          <tr>
            <th className="py-2 px-4 font-semibold">Regulatory Parameter</th>
            <th className="py-2 px-4 font-semibold">Submitted by Institution</th>
            <th className="py-2 px-4 font-semibold">Confirmed by Bank (MOCK CBS)</th>
            <th className="py-2 px-4 font-semibold text-right">Audit Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-border font-mono">
          {fields.map((f) => {
            const isMatch = f.matchStatus === "MATCH";
            const isMismatch = f.matchStatus === "MISMATCH";
            const isUnverified = f.matchStatus === "UNVERIFIED";

            return (
              <tr key={f.key} className="hover:bg-paper-100/50 transition-colors">
                <td className="py-2.5 px-4 font-sans font-medium text-ink-primary">
                  {f.label}
                </td>
                <td className="py-2.5 px-4 text-ink-secondary">
                  {String(f.declared || "—")}
                </td>
                <td className="py-2.5 px-4">
                  {f.confirmed !== undefined ? (
                    <span className={isMismatch ? "text-red-600 font-bold" : "text-ink-primary"}>
                      {String(f.confirmed)}
                    </span>
                  ) : (
                    <span className="text-ink-muted italic">Awaiting verification</span>
                  )}
                </td>
                <td className="py-2.5 px-4 text-right">
                  {isMatch && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-botanical-subtle text-botanical border border-botanical/20">
                      <Check className="w-3 h-3" />
                      <span>MATCH</span>
                    </span>
                  )}
                  {isMismatch && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-300">
                      <X className="w-3 h-3" />
                      <span>MISMATCH</span>
                    </span>
                  )}
                  {isUnverified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-paper-200 text-ink-muted border border-ink-border">
                      <HelpCircle className="w-3 h-3" />
                      <span>UNVERIFIED</span>
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
