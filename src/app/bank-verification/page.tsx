"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FdrInstrument } from "@/types/fdr";
import { formatIndianCurrency, formatIndianDate } from "@/lib/formatters";
import { useApp } from "@/context/AppContext";
import {
  Landmark,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  RotateCcw,
  Clock,
  ArrowRight,
  Database,
} from "lucide-react";

export default function BankVerificationPage() {
  const { currentRole } = useApp();
  const [fdrs, setFdrs] = useState<FdrInstrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isQuerying, setIsQuerying] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = () => {
    setLoading(true);
    fetch("/api/fdrs")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setFdrs(data.data || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleQueryBank = async (fdrId: string) => {
    setIsQuerying(fdrId);
    try {
      const res = await fetch(`/api/fdrs/${fdrId}/verify`, {
        method: "POST",
        headers: { "x-user-role": currentRole },
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error || "Simulation query failed");
      }
    } finally {
      setIsQuerying(null);
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
            REVIEW & COMPLIANCE · CORE BANKING ADAPTER
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Bank Verification (Simulated Gateway)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated reconciliation against mock Core Banking Solution (CBS) API & SFMS MT760/767 lien messaging.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Mandatory Prototype Transparency Notice */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <div className="font-bold text-amber-900 flex items-center gap-2">
            <span>DEMONSTRATION & SIMULATION NOTICE · NOT A LIVE SFMS GATEWAY</span>
            <span className="px-2 py-0.5 bg-amber-200/80 text-amber-900 font-bold rounded-md text-[10px]">
              PROTOTYPE
            </span>
          </div>
          <p className="text-amber-800 text-[11.5px] leading-relaxed">
            In this hackathon evaluation prototype, queries to commercial bank Core Banking Systems (CBS) are handled by the deterministic <strong>Mock Bank Verification Adapter</strong> (<code>src/lib/mockBankService.ts</code>). It simulates real-world banking responses, including valid lien endorsements, account mismatches, and forged receipt rejections.
          </p>
        </div>
      </div>

      {/* Search and Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 flex items-center gap-2 max-w-md w-full shadow-2xs">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by FDR number, institution or bank..."
            className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <Database className="w-4 h-4 text-blue-600" />
          <span>Showing {filteredFdrs.length} Bank Verification Records</span>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">Instrument & College</th>
                <th className="py-3 px-3">Bank Particulars</th>
                <th className="py-3 px-3">Declared vs Confirmed</th>
                <th className="py-3 px-3">Lien Notation</th>
                <th className="py-3 px-3">Verification State</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredFdrs.slice(0, 25).map((fdr) => {
                const isConfirmed = fdr.verificationStatus === "BANK_CONFIRMED";
                const isMismatch = fdr.verificationStatus === "MISMATCH";
                const isPending = fdr.verificationStatus === "VERIFICATION_PENDING" || fdr.verificationStatus === "UNVERIFIED";

                return (
                  <tr key={fdr.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 min-w-[200px]">
                      <Link
                        href={`/repository/${fdr.id}`}
                        className="font-bold text-slate-900 hover:text-blue-600 transition-colors block truncate max-w-[240px]"
                      >
                        {fdr.institutionName}
                      </Link>
                      <span className="font-mono text-[10.5px] text-slate-400">
                        {fdr.fdrNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{fdr.bankName}</div>
                      <div className="font-mono text-[10.5px] text-slate-400">{fdr.ifscCode}</div>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900">
                        ₹{(fdr.amount / 100000).toFixed(2)}L
                      </div>
                      <div className="text-[10.5px] text-slate-500">
                        {fdr.provenance?.amount?.confirmed ? (
                          `CBS: ₹${(fdr.provenance.amount.confirmed / 100000).toFixed(2)}L`
                        ) : (
                          "CBS: Pending"
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {fdr.lienMarked ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>AICTE Joint Lien</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                          <span>Unpledged Sole Trust</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${
                          isConfirmed
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : isMismatch
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {fdr.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleQueryBank(fdr.id)}
                        disabled={isQuerying === fdr.id}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isQuerying === fdr.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Landmark className="w-3.5 h-3.5" />
                        )}
                        <span>{isConfirmed ? "Re-Query CBS" : "Trigger Inquiry"}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

