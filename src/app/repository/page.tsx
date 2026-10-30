"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FdrInstrument } from "@/types/fdr";
import { formatIndianCurrency, formatIndianDate, formatRemainingTenure, maskSensitiveId } from "@/lib/formatters";
import { CircularValidityRing } from "@/components/fdr/CircularValidityRing";
import { useApp } from "@/context/AppContext";
import {
  SEVERITY_CONFIG,
  mapFlagSeverityToTier,
  mapUrgencyToTier,
} from "@/lib/severity";
import {
  Search,
  Download,
  Printer,
  AlertTriangle,
  CheckCircle2,
  Building2,
  ArrowRight,
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

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      "FDR Number",
      "Bank Name",
      "Branch",
      "IFSC Code",
      "Institution ID",
      "Institution Name",
      "Amount (INR)",
      "Issue Date",
      "Maturity Date",
      "Status",
      "Lien Marked",
      "Attention Score",
    ];

    const rows = sorted.map((f) => [
      f.fdrNumber,
      `"${f.bankName}"`,
      `"${f.branchName}"`,
      f.ifscCode,
      f.institutionId,
      `"${f.institutionName || ""}"`,
      f.amount,
      f.issueDate,
      f.maturityDate,
      f.status,
      f.lienMarked ? "YES" : "NO",
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
      `AICTE_FDR_Treasury_Export_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isAuditor = currentRole === "AUDITOR";

  return (
    <div className="space-y-5 sm:space-y-6 max-w-full">
      {/* Top Header Bar */}
      <div className="liquid-glass-card rounded-[22px] p-4.5 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-serif font-bold text-lg sm:text-xl text-ink-primary tracking-tight">
            Central Statutory Deposit Repository
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Master register of technical education security deposits & encumbrance certificates
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 sm:py-1.5 text-xs font-mono font-medium rounded-md border border-ink-border bg-paper-50 hover:bg-paper-200 text-ink-primary transition-colors min-h-[40px] sm:min-h-0"
          >
            <Download className="w-3.5 h-3.5 text-ink-muted" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 sm:py-1.5 text-xs font-mono font-medium rounded-md border border-ink-border bg-paper-50 hover:bg-paper-200 text-ink-primary transition-colors min-h-[40px] sm:min-h-0"
          >
            <Printer className="w-3.5 h-3.5 text-ink-muted" />
            <span>Print Ledger</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3.5 sm:p-4 liquid-glass-card rounded-[20px] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by FDR No, Bank, IFSC, Institution..."
              className="w-full pl-9 pr-3 py-2 sm:py-1.5 text-sm sm:text-xs bg-paper-100 border border-ink-border rounded-md text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-ink-secondary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Bank Select */}
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="px-2.5 py-2 sm:py-1.5 bg-paper-100 border border-ink-border rounded-md text-ink-primary text-xs focus:outline-none min-h-[40px] sm:min-h-0"
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
              className="px-2.5 py-2 sm:py-1.5 bg-paper-100 border border-ink-border rounded-md text-ink-primary text-xs focus:outline-none min-h-[40px] sm:min-h-0"
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
              className="px-2.5 py-2 sm:py-1.5 bg-paper-100 border border-ink-border rounded-md text-ink-primary text-xs focus:outline-none min-h-[40px] sm:min-h-0"
            >
              <option value="ALL">All Compliance States</option>
              <option value="WITH_DISCREPANCIES">Open Discrepancies Only</option>
              <option value="CLEAN">Clean / Fully Verified</option>
            </select>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-2 sm:py-1.5 bg-paper-100 border border-ink-border rounded-md text-ink-primary text-xs focus:outline-none min-h-[40px] sm:min-h-0"
            >
              <option value="attention">Sort: Risk / Attention Score</option>
              <option value="maturity">Sort: Maturity Date</option>
              <option value="amount">Sort: Amount (High to Low)</option>
              <option value="issue">Sort: Issue Date (Newest)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-ink-muted pt-2 border-t border-ink-border/60 font-mono">
          <span>
            Displaying {sorted.length} of {fdrs.length} sovereign instruments
          </span>
          {discrepancyFilter !== "ALL" && (
            <span className="text-saffron font-medium">Filter active</span>
          )}
        </div>
      </div>

      {/* Main Ledger View: Stacked Cards on Mobile (< 768px), Table on Desktop (>= 768px) */}
      <div className="liquid-glass-card rounded-[22px] overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-ink-muted animate-pulse">
            Loading sovereign repository records...
          </div>
        ) : sorted.length === 0 ? (
          <div className="p-8 text-center text-xs text-ink-muted">
            No instruments match the selected search and filter criteria.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-paper-100 font-mono text-[10px] uppercase text-ink-muted border-b border-ink-border">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold w-40">Validity</th>
                    <th className="py-2.5 px-4 font-semibold">FDR Ref / Bank</th>
                    <th className="py-2.5 px-4 font-semibold">Institution Details</th>
                    <th className="py-2.5 px-4 font-semibold whitespace-nowrap">Statutory Sum</th>
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
                    const tenureSeverity = mapUrgencyToTier(tenure.urgency);
                    const tenureStyle = SEVERITY_CONFIG[tenureSeverity];

                    return (
                      <tr key={fdr.id} className="hover:bg-paper-100/60 transition-colors">
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <CircularValidityRing maturityDate={fdr.maturityDate} size={38} strokeWidth={3} />
                            <div>
                              <div className="font-mono text-[11px] font-semibold text-ink-primary whitespace-nowrap">
                                {formatIndianDate(fdr.maturityDate)}
                              </div>
                              <div className={`text-[9px] font-mono whitespace-nowrap ${tenureStyle.chipText}`}>
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

                        <td className="py-2.5 px-4 font-sans text-ink-secondary">
                          <div className="font-medium text-ink-primary truncate max-w-[240px]" title={fdr.institutionName}>
                            {fdr.institutionName || fdr.institutionId}
                          </div>
                          <div className="text-[10px] font-mono text-ink-muted">
                            AICTE ID: {fdr.institutionAicteId || fdr.institutionId}
                          </div>
                        </td>

                        <td className="py-2.5 px-4 font-mono font-medium text-ink-primary whitespace-nowrap tabular-nums">
                          {formatIndianCurrency(fdr.amount)}
                        </td>

                        <td className="py-2.5 px-4 whitespace-nowrap">
                          {fdr.lienMarked ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-paper-200 border border-ink-border text-ink-primary font-medium">
                              {fdr.status}
                            </span>
                            {openFlags.length > 0 && (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-300 font-medium"
                                title={`${openFlags.length} open discrepancy flags`}
                              >
                                <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                                <span>{openFlags.length} Flags</span>
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-2.5 px-4 text-right whitespace-nowrap">
                          <Link
                            href={`/repository/${fdr.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-ink-border bg-paper-50 hover:bg-paper-200 text-ink-primary transition-colors focus:ring-2 focus:ring-saffron"
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

            {/* Mobile Stacked Card View */}
            <div className="block md:hidden divide-y divide-ink-border p-2 sm:p-3 space-y-3">
              {sorted.map((fdr) => {
                const tenure = formatRemainingTenure(fdr.maturityDate);
                const openFlags = (fdr.discrepancies || []).filter((d) => !d.resolved);
                const displayFdrNumber = isAuditor ? maskSensitiveId(fdr.fdrNumber) : fdr.fdrNumber;
                const tenureSeverity = mapUrgencyToTier(tenure.urgency);
                const tenureStyle = SEVERITY_CONFIG[tenureSeverity];

                return (
                  <article
                    key={fdr.id}
                    className="bg-paper-100/70 border border-ink-border rounded-lg p-3.5 space-y-3 shadow-xs"
                  >
                    {/* Top Row: Validity & Amount */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <CircularValidityRing maturityDate={fdr.maturityDate} size={42} strokeWidth={3.5} />
                        <div>
                          <div className="font-mono text-xs font-bold text-ink-primary">
                            {formatIndianDate(fdr.maturityDate)}
                          </div>
                          <div className={`text-[10px] font-mono ${tenureStyle.chipText}`}>
                            {tenure.label}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono text-xs font-bold text-ink-primary tabular-nums">
                          {formatIndianCurrency(fdr.amount)}
                        </div>
                        <div className="text-[10px] font-mono text-ink-muted mt-0.5">
                          Score: {fdr.attentionScore}/100
                        </div>
                      </div>
                    </div>

                    {/* Middle: Instrument & Bank & Institution */}
                    <div className="pt-2 border-t border-ink-border/60">
                      <div className="font-mono font-bold text-xs text-ink-primary">
                        {displayFdrNumber}
                      </div>
                      <div className="text-[11px] text-ink-muted mt-0.5">
                        {fdr.bankName} • {fdr.ifscCode}
                      </div>

                      <div className="text-[10px] text-ink-secondary mt-1 flex items-start gap-1">
                        <Building2 className="w-3.5 h-3.5 text-ink-muted shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium text-ink-primary">
                            {fdr.institutionName || fdr.institutionId}
                          </span>
                          {fdr.institutionAicteId && (
                            <span className="font-mono text-ink-muted text-[9px] ml-1">
                              ({fdr.institutionAicteId})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Flags, Lien, & Action */}
                    <div className="pt-2 border-t border-ink-border/60 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-paper-200 border border-ink-border text-ink-primary font-medium">
                          {fdr.status}
                        </span>
                        {fdr.lienMarked ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Lien Pledged</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-red-600 font-bold">
                            <AlertTriangle className="w-3 h-3" />
                            <span>UNMARKED</span>
                          </span>
                        )}
                        {openFlags.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-300 font-medium">
                            <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                            <span>{openFlags.length} Flags</span>
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/repository/${fdr.id}`}
                        className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 text-xs font-semibold rounded-md border border-ink-border bg-paper-50 hover:bg-paper-200 text-ink-primary shrink-0 transition-colors focus:ring-2 focus:ring-saffron"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5 text-ink-muted" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
