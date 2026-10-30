"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FdrInstrument, Institution } from "@/types/fdr";
import { formatIndianCurrency, formatIndianDate, formatRemainingTenure, maskSensitiveId } from "@/lib/formatters";
import { CircularValidityRing } from "@/components/fdr/CircularValidityRing";
import { useApp } from "@/context/AppContext";
import {
  Search,
  Filter,
  Download,
  Printer,
  AlertTriangle,
  CheckCircle2,
  ArrowUpDown,
  Building2,
  ArrowRight,
} from "lucide-react";

export default function RepositoryPage() {
  const { currentRole, currentUser } = useApp();
  const [fdrs, setFdrs] = useState<FdrInstrument[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("ALL");
  const [selectedBank, setSelectedBank] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [discrepancyFilter, setDiscrepancyFilter] = useState("ALL"); // ALL, WITH_DISCREPANCIES, CLEAN
  const [sortBy, setSortBy] = useState<"attention" | "maturity" | "amount" | "issue">("attention");

  useEffect(() => {
    fetch("/api/fdrs")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFdrs(data.data);
        }
      })
      .finally(() => setLoading(false));
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

  const regions = [
    "Northern",
    "Western",
    "Southern",
    "Eastern",
    "South-Western",
    "Central",
    "North-Western",
    "North-Eastern",
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
        f.institutionId.toLowerCase().includes(clean);
      if (!match) return false;
    }

    return true;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "attention") {
      return (b.attentionScore || 0) - (a.attentionScore || 0);
    }
    if (sortBy === "maturity") {
      return new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime();
    }
    if (sortBy === "amount") {
      return b.amount - a.amount;
    }
    if (sortBy === "issue") {
      return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
    }
    return 0;
  });

  // CSV Export
  const handleExportCsv = () => {
    const headers = [
      "FDR Number",
      "Institution ID",
      "Bank Name",
      "Branch",
      "IFSC Code",
      "Amount (INR)",
      "Issue Date",
      "Maturity Date",
      "Status",
      "Lien Marked",
      "Verification Status",
      "Attention Score",
    ];

    const rows = sorted.map((f) => [
      f.fdrNumber,
      f.institutionId,
      `"${f.bankName}"`,
      `"${f.branchName}"`,
      f.ifscCode,
      f.amount,
      f.issueDate,
      f.maturityDate,
      f.status,
      f.lienMarked ? "Yes" : "No",
      f.verificationStatus,
      f.attentionScore,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AICTE_FDR_Treasury_Export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isAuditor = currentRole === "AUDITOR";

  return (
    <div className="p-6 space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-ink-border pb-4">
        <div>
          <h2 className="font-serif font-bold text-xl text-ink-primary tracking-tight">
            Central Regulatory Repository
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            National sovereign ledger of all technical education security deposits & bank pledges
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded border border-ink-border bg-paper-50 hover:bg-paper-200 text-ink-primary transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-ink-muted" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded border border-ink-border bg-paper-50 hover:bg-paper-200 text-ink-primary transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-ink-muted" />
            <span>Print Ledger</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-paper-50 border border-ink-border rounded shadow-ledger space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by FDR Number, Bank, IFSC, Institution ID..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-paper-100 border border-ink-border rounded text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-ink-secondary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Bank Select */}
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="px-2.5 py-1.5 bg-paper-100 border border-ink-border rounded text-ink-primary text-xs focus:outline-none"
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
              className="px-2.5 py-1.5 bg-paper-100 border border-ink-border rounded text-ink-primary text-xs focus:outline-none"
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
              className="px-2.5 py-1.5 bg-paper-100 border border-ink-border rounded text-ink-primary text-xs focus:outline-none"
            >
              <option value="ALL">All Compliance States</option>
              <option value="WITH_DISCREPANCIES">Open Discrepancies Only</option>
              <option value="CLEAN">Clean / Fully Verified</option>
            </select>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 bg-paper-100 border border-ink-border rounded text-ink-primary text-xs focus:outline-none"
            >
              <option value="attention">Sort: Attention Score (Desc)</option>
              <option value="maturity">Sort: Maturity Date (Earliest)</option>
              <option value="amount">Sort: Deposit Sum (Desc)</option>
              <option value="issue">Sort: Issue Date (Recent)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-ink-muted pt-1">
          <span>Showing {sorted.length} matching deposit instruments</span>
          {isAuditor && (
            <span className="text-saffron">
              ● AUDITOR VIEW: Sensitive FDR numbers masked per regulatory privacy guidelines
            </span>
          )}
        </div>
      </div>

      {/* Main Ledger Grid Table */}
      <div className="border border-ink-border rounded bg-paper-50 shadow-ledger overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-paper-100 font-mono text-[10px] uppercase text-ink-muted border-b border-ink-border">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Validity</th>
                <th className="py-2.5 px-4 font-semibold">FDR Ref / Bank</th>
                <th className="py-2.5 px-4 font-semibold">Institution Ref</th>
                <th className="py-2.5 px-4 font-semibold">Statutory Sum</th>
                <th className="py-2.5 px-4 font-semibold">Lien State</th>
                <th className="py-2.5 px-4 font-semibold">Status & Flags</th>
                <th className="py-2.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-border">
              {sorted.map((fdr) => {
                const tenure = formatRemainingTenure(fdr.maturityDate);
                const openFlags = (fdr.discrepancies || []).filter((d) => !d.resolved);
                const displayFdrNumber = isAuditor ? maskSensitiveId(fdr.fdrNumber) : fdr.fdrNumber;

                return (
                  <tr key={fdr.id} className="hover:bg-paper-100/60 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <CircularValidityRing maturityDate={fdr.maturityDate} size={36} strokeWidth={3.5} />
                        <div>
                          <div className="font-mono text-[11px] font-semibold text-ink-primary">
                            {formatIndianDate(fdr.maturityDate)}
                          </div>
                          <div
                            className={`text-[9px] font-mono ${
                              tenure.urgency === "EXPIRED"
                                ? "text-red-600 font-bold"
                                : tenure.urgency === "CRITICAL"
                                ? "text-saffron font-semibold"
                                : "text-ink-muted"
                            }`}
                          >
                            {tenure.label}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-4">
                      <div className="font-mono font-bold text-ink-primary">
                        {displayFdrNumber}
                      </div>
                      <div className="text-[11px] text-ink-muted mt-0.5">
                        {fdr.bankName} • {fdr.ifscCode}
                      </div>
                    </td>

                    <td className="py-2.5 px-4 font-mono text-ink-secondary">
                      <div>{fdr.institutionId}</div>
                      <div className="text-[10px] text-ink-muted">AICTE WRO</div>
                    </td>

                    <td className="py-2.5 px-4 font-mono font-medium text-ink-primary">
                      {formatIndianCurrency(fdr.amount)}
                    </td>

                    <td className="py-2.5 px-4">
                      {fdr.lienMarked ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-botanical font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Lien Pledged</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-red-600 font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          <span>UNMARKED</span>
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-paper-200 border border-ink-border text-ink-primary font-medium">
                          {fdr.status}
                        </span>
                        {openFlags.length > 0 && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-300 font-medium"
                            title={`${openFlags.length} open discrepancy flags`}
                          >
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>{openFlags.length} Flags</span>
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      <Link
                        href={`/repository/${fdr.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border border-ink-border bg-paper-50 hover:bg-paper-200 text-ink-primary transition-colors"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3 text-ink-muted" />
                      </Link>
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
