"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FdrInstrument } from "@/types/fdr";
import { formatIndianCurrency, formatIndianDate, formatRemainingTenure, maskSensitiveId } from "@/lib/formatters";
import { CircularValidityRing } from "@/components/fdr/CircularValidityRing";
import { useApp } from "@/context/AppContext";
import {
  Search,
  Download,
  Printer,
  AlertTriangle,
  CheckCircle2,
  Building2,
  ArrowRight,
  Filter,
  FileSpreadsheet,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Plus,
} from "lucide-react";

export default function RepositoryPage() {
  const { currentRole } = useApp();
  const [fdrs, setFdrs] = useState<FdrInstrument[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBank, setSelectedBank] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [discrepancyFilter, setDiscrepancyFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"attention" | "maturity" | "amount" | "issue">("attention");

  const fetchData = () => {
    setLoading(true);
    fetch("/api/fdrs")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFdrs(data.data || []);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const banks = [
    "State Bank of India",
    "Punjab National Bank",
    "Bank of Baroda",
    "Canara Bank",
    "Union Bank of India",
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
  ];

  const statuses = [
    "ACTIVE",
    "EXPIRING",
    "MATURED",
    "DEFICIENT",
    "PENDING_VERIFICATION",
    "RENEWED",
    "RELEASE_REQUESTED",
    "RELEASE_RECOMMENDED",
    "RELEASED",
  ];

  // Filtering
  const filtered = fdrs.filter((f) => {
    if (selectedBank !== "ALL" && f.bankName !== selectedBank) return false;
    if (selectedStatus !== "ALL" && f.status !== selectedStatus) return false;

    if (discrepancyFilter === "WITH_DISCREPANCIES") {
      const hasOpen = (f.discrepancies || []).some((d) => !d.resolved);
      if (!hasOpen) return false;
    } else if (discrepancyFilter === "CLEAN") {
      const hasOpen = (f.discrepancies || []).some((d) => !d.resolved);
      if (hasOpen) return false;
    }

    if (searchTerm) {
      const clean = searchTerm.toLowerCase();
      const match =
        f.fdrNumber.toLowerCase().includes(clean) ||
        f.bankName.toLowerCase().includes(clean) ||
        f.ifscCode.toLowerCase().includes(clean) ||
        f.institutionId.toLowerCase().includes(clean) ||
        (f.institutionName && f.institutionName.toLowerCase().includes(clean)) ||
        (f.institutionAicteId && f.institutionAicteId.toLowerCase().includes(clean));
      if (!match) return false;
    }

    return true;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "attention") {
      return (b.attentionScore || 0) - (a.attentionScore || 0);
    }
    if (sortBy === "amount") {
      return (b.amount || 0) - (a.amount || 0);
    }
    if (sortBy === "maturity") {
      return new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime();
    }
    return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
  });

  const handleExportCsv = () => {
    const headers = [
      "FDR Number",
      "Institution Name",
      "AICTE ID",
      "Bank",
      "IFSC",
      "Principal Amount (INR)",
      "Issue Date",
      "Maturity Date",
      "Status",
      "Verification Status",
      "Attention Score",
    ];

    const rows = sorted.map((f) => [
      f.fdrNumber,
      `"${f.institutionName || f.institutionId}"`,
      f.institutionAicteId || "N/A",
      `"${f.bankName}"`,
      f.ifscCode,
      f.amount,
      f.issueDate,
      f.maturityDate,
      f.status,
      f.verificationStatus,
      f.attentionScore,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `AICTE_FDR_Register_Export_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isAuditor = currentRole === "AUDITOR";

  return (
    <div className="space-y-6 select-none animate-glass-in pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
            FDR MANAGEMENT · REPOSITORY
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            FDR Register
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Central repository of all technical institution security deposits and tripartite lien instruments.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/intake"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2773E1] hover:bg-[#0D5BB8] text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Submit New FDR</span>
          </Link>
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print Ledger</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by FDR No, Bank, IFSC, Institution..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Bank Select */}
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-hidden"
            >
              <option value="ALL">All Issuing Banks</option>
              {banks.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            {/* Status Select */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>

            {/* Discrepancy Filter */}
            <select
              value={discrepancyFilter}
              onChange={(e) => setDiscrepancyFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-hidden"
            >
              <option value="ALL">All Compliance States</option>
              <option value="WITH_DISCREPANCIES">Open Discrepancies Only</option>
              <option value="CLEAN">Clean / Fully Verified</option>
            </select>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-hidden"
            >
              <option value="attention">Sort: Attention Score</option>
              <option value="maturity">Sort: Maturity Date</option>
              <option value="amount">Sort: Amount (High to Low)</option>
              <option value="issue">Sort: Issue Date</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Displaying <strong>{sorted.length}</strong> of {fdrs.length} records in repository
          </span>
          {discrepancyFilter !== "ALL" || selectedBank !== "ALL" || selectedStatus !== "ALL" ? (
            <button
              type="button"
              onClick={() => {
                setSelectedBank("ALL");
                setSelectedStatus("ALL");
                setDiscrepancyFilter("ALL");
                setSearchTerm("");
              }}
              className="text-blue-600 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          ) : null}
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">FDR Number</th>
                <th className="py-3 px-3">Institution</th>
                <th className="py-3 px-3">Bank & Branch</th>
                <th className="py-3 px-3">Deposit Amount</th>
                <th className="py-3 px-3">Maturity Date</th>
                <th className="py-3 px-3">Lien Status</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sorted.length > 0 ? (
                sorted.map((fdr) => {
                  const hasDiscrepancy = (fdr.discrepancies || []).some((d) => !d.resolved);
                  const displayNum = isAuditor ? maskSensitiveId(fdr.fdrNumber) : fdr.fdrNumber;

                  return (
                    <tr key={fdr.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <Link
                          href={`/repository/${fdr.id}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {displayNum}
                        </Link>
                      </td>
                      <td className="py-3.5 px-3 min-w-[200px]">
                        <div className="font-semibold text-slate-800 truncate max-w-[240px]">
                          {fdr.institutionName || fdr.institutionId}
                        </div>
                        <div className="text-[10.5px] text-slate-400 font-mono">
                          {fdr.institutionAicteId}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{fdr.bankName}</div>
                        <div className="font-mono text-[10.5px] text-slate-400">{fdr.ifscCode}</div>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                        ₹{(fdr.amount / 100000).toFixed(2)} Lakhs
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                        {formatIndianDate(fdr.maturityDate)}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {fdr.lienMarked ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Marked</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                            <span>Unmarked</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${
                            fdr.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : fdr.status === "DEFICIENT"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : fdr.status === "EXPIRING"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : fdr.status === "MATURED"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {fdr.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/repository/${fdr.id}`}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors inline-flex items-center gap-1"
                        >
                          <span>Dossier</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No instruments match the selected filter parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
