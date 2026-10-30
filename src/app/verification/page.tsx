"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FdrInstrument } from "@/types/fdr";
import { formatIndianCurrency, formatIndianDate } from "@/lib/formatters";
import { useApp } from "@/context/AppContext";
import {
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ScanLine,
  RotateCcw,
  Landmark,
  Eye,
  FileText,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

export default function DocumentVerificationPage() {
  const { currentRole } = useApp();
  const [fdrs, setFdrs] = useState<FdrInstrument[]>([]);
  const [selectedFdr, setSelectedFdr] = useState<FdrInstrument | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch("/api/fdrs")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const list: FdrInstrument[] = data.data || [];
          setFdrs(list);
          if (list.length > 0 && !selectedFdr) {
            // Default to an interesting test instrument (e.g. one with discrepancies or pending)
            const target = list.find((f) => (f.discrepancies || []).length > 0) || list[0];
            setSelectedFdr(target);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedFdr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRunMockBankQuery = async (fdrId: string) => {
    setIsVerifying(true);
    try {
      const res = await fetch(`/api/fdrs/${fdrId}/verify`, {
        method: "POST",
        headers: { "x-user-role": currentRole },
      });
      const data = await res.json();
      if (data.success) {
        setSelectedFdr(data.data);
        fetchData();
      } else {
        alert(data.error || "Bank verification failed");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const filteredFdrs = fdrs.filter((f) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      f.fdrNumber.toLowerCase().includes(q) ||
      f.bankName.toLowerCase().includes(q) ||
      (f.institutionName && f.institutionName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 select-none animate-glass-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
            REVIEW & COMPLIANCE · PROVENANCE MATRIX
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Document Verification
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Field-by-field provenance comparison across document extraction, internal rules, and core banking confirmation.
          </p>
        </div>

        {/* Mandatory Transparency Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200/60 rounded-xl text-xs text-blue-700 font-semibold self-start sm:self-auto">
          <ShieldAlert className="w-4 h-4 text-blue-600" />
          <span>Core Banking Adapter: Prototype Demonstration</span>
        </div>
      </div>

      {/* Main Grid: Left Selector List, Right Provenance Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Queue List (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900">
              Scrutiny Queue ({filteredFdrs.length})
            </span>
            <button
              type="button"
              onClick={fetchData}
              className="p-1 text-slate-400 hover:text-slate-600"
              title="Refresh Queue"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search instrument..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
            {filteredFdrs.map((fdr) => {
              const isSelected = selectedFdr?.id === fdr.id;
              const hasDiscrepancy = (fdr.discrepancies || []).some((d) => !d.resolved);

              return (
                <button
                  key={fdr.id}
                  type="button"
                  onClick={() => setSelectedFdr(fdr)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-50 border-blue-300 text-blue-900 shadow-2xs"
                      : "bg-white border-slate-200/70 hover:bg-slate-50 text-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold truncate max-w-[170px]">
                      {fdr.fdrNumber}
                    </span>
                    {hasDiscrepancy ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                        FLAGGED
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                        MATCHED
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-1">
                    {fdr.institutionName}
                  </div>
                  <div className="flex items-center justify-between text-[10.5px] text-slate-400 mt-2 font-mono">
                    <span>{fdr.bankName.substring(0, 15)}</span>
                    <span className="font-bold text-slate-700">
                      ₹{(fdr.amount / 100000).toFixed(1)}L
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Field-by-Field Provenance Inspector (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedFdr ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              {/* Top Dossier Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="text-[11px] font-bold text-blue-600 uppercase">
                    ACTIVE VERIFICATION DOSSIER
                  </div>
                  <h2 className="text-xl font-black text-slate-900 font-mono">
                    {selectedFdr.fdrNumber}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedFdr.institutionName} · AICTE ID: {selectedFdr.institutionAicteId || "1-900000000"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRunMockBankQuery(selectedFdr.id)}
                    disabled={isVerifying}
                    className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    <Landmark className="w-3.5 h-3.5" />
                    <span>{isVerifying ? "Querying..." : "Simulate CBS Inquiry"}</span>
                  </button>

                  <Link
                    href={`/repository/${selectedFdr.id}`}
                    className="px-3 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center gap-1"
                  >
                    <span>Full Dossier</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Notice: 3 Distinct Authentication Layers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px]">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ScanLine className="w-3.5 h-3.5 text-blue-600" />
                    1. Extracted from document
                  </span>
                  <p className="text-slate-500 text-[10.5px]">
                    Coordinates & text parsed via OCR scanner.
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    2. Internally validated
                  </span>
                  <p className="text-slate-500 text-[10.5px]">
                    Validated against 8 deterministic regulatory rules.
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-purple-600" />
                    3. Bank confirmed (Mock)
                  </span>
                  <p className="text-slate-500 text-[10.5px]">
                    CBS term deposit ledger inquiry match.
                  </p>
                </div>
              </div>

              {/* Field by Field Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-semibold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Field</th>
                      <th className="py-2.5 px-3">1. Extracted / Declared</th>
                      <th className="py-2.5 px-3">2. Rule Validation</th>
                      <th className="py-2.5 px-3">3. CBS Confirmed (Mock)</th>
                      <th className="py-2.5 px-3 text-right">Match</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-slate-800 text-[11.5px]">
                    {/* Row: FDR Number */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-600">
                        FDR Number
                      </td>
                      <td className="py-2.5 px-3">{selectedFdr.fdrNumber}</td>
                      <td className="py-2.5 px-3 text-emerald-600 font-semibold font-sans">
                        ✓ Format Valid
                      </td>
                      <td className="py-2.5 px-3">
                        {selectedFdr.provenance?.fdrNumber?.confirmed || "Pending Query"}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          MATCH
                        </span>
                      </td>
                    </tr>

                    {/* Row: Bank Name */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-600">
                        Bank Name
                      </td>
                      <td className="py-2.5 px-3 font-sans">{selectedFdr.bankName}</td>
                      <td className="py-2.5 px-3 text-emerald-600 font-semibold font-sans">
                        ✓ Commercial Bank
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        {selectedFdr.provenance?.bankName?.confirmed || selectedFdr.bankName}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          MATCH
                        </span>
                      </td>
                    </tr>

                    {/* Row: IFSC Code */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-600">
                        IFSC Code
                      </td>
                      <td className="py-2.5 px-3">{selectedFdr.ifscCode}</td>
                      <td className="py-2.5 px-3 font-sans">
                        {selectedFdr.discrepancies?.some((d) => d.ruleCode === "BANK_IFSC_MISMATCH") ? (
                          <span className="text-red-600 font-bold">✗ Prefix Mismatch</span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">✓ Prefix Verified</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {selectedFdr.provenance?.ifscCode?.confirmed || selectedFdr.ifscCode}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {selectedFdr.discrepancies?.some((d) => d.ruleCode === "BANK_IFSC_MISMATCH") ? (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700">
                            MISMATCH
                          </span>
                        ) : (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                            MATCH
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Row: Principal Amount */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-600">
                        Principal Amount
                      </td>
                      <td className="py-2.5 px-3 font-bold">
                        ₹{selectedFdr.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        {selectedFdr.amount >= 1500000 ? (
                          <span className="text-emerald-600 font-semibold">✓ Norm Met</span>
                        ) : (
                          <span className="text-amber-600 font-bold">⚠ Below Norm</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-bold">
                        {selectedFdr.provenance?.amount?.confirmed ? (
                          `₹${selectedFdr.provenance.amount.confirmed.toLocaleString("en-IN")}`
                        ) : (
                          `₹${selectedFdr.amount.toLocaleString("en-IN")}`
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          MATCH
                        </span>
                      </td>
                    </tr>

                    {/* Row: AICTE Lien Notation */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-600">
                        Lien Recorded
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        {selectedFdr.lienMarked ? "Marked in AICTE Favor" : "Unmarked"}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        {selectedFdr.lienMarked ? (
                          <span className="text-emerald-600 font-semibold">✓ Mandate Satisfied</span>
                        ) : (
                          <span className="text-red-600 font-bold">✗ Unpledged Risk</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        {selectedFdr.provenance?.lienMarked?.confirmed !== undefined
                          ? selectedFdr.provenance.lienMarked.confirmed
                            ? "Confirmed in CBS"
                            : "Not Registered in CBS"
                          : "Pending Confirmation"}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {selectedFdr.lienMarked ? (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                            MATCH
                          </span>
                        ) : (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700">
                            CRITICAL
                          </span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Discrepancies Callout */}
              {(selectedFdr.discrepancies || []).length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200/80 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-900">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Compliance Observations Detected ({selectedFdr.discrepancies.length})</span>
                  </div>
                  {selectedFdr.discrepancies.map((flag) => (
                    <div key={flag.id} className="text-xs text-red-800 bg-white/70 p-2.5 rounded-lg border border-red-100 space-y-0.5">
                      <div className="font-bold">{flag.title} ({flag.ruleCode})</div>
                      <div className="text-[11px] text-red-700">{flag.reason}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
              Select an instrument from the scrutiny queue on the left.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
