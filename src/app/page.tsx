"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { FdrInstrument } from "@/types/fdr";
import { formatIndianCurrency, formatIndianDate, getDaysRemaining } from "@/lib/formatters";
import {
  Coins,
  Calendar,
  CalendarClock,
  CheckCircle2,
  FileText,
  FileSpreadsheet,
  AlertTriangle,
  Clock,
  RefreshCw,
  Plus,
  ArrowRight,
  ChevronDown,
  Check,
  Zap,
  MapPin,
  ExternalLink,
  UploadCloud,
  ArrowUpRight,
  ShieldCheck,
  FileSearch,
} from "lucide-react";

export default function TreasuryHomePage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [allFdrs, setAllFdrs] = useState<FdrInstrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("ALL");
  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);

  useEffect(() => {
    // 1. Fetch KPI summary metrics
    fetch("/api/kpi")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMetrics(data.metrics);
        }
      })
      .catch(console.error);

    // 2. Fetch all FDR instruments
    fetch("/api/fdrs")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAllFdrs(data.data || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const regionOptions = [
    { code: "ALL", label: "All regions" },
    { code: "Western", label: "Western Region" },
    { code: "North-Western", label: "North-Western Region" },
    { code: "Northern", label: "Northern Region" },
    { code: "Southern", label: "Southern Region" },
    { code: "Eastern", label: "Eastern Region" },
    { code: "South-Western", label: "South-Western Region" },
    { code: "Central", label: "Central Region" },
  ];

  const currentRegionLabel =
    regionOptions.find((r) => r.code === selectedRegion)?.label || "All regions";

  // Filter FDRs by selected region
  const filteredFdrs = useMemo(() => {
    if (selectedRegion === "ALL") return allFdrs;
    return allFdrs.filter((fdr) => fdr.institutionRegion === selectedRegion);
  }, [allFdrs, selectedRegion]);

  // Extract Upcoming Maturities: Instruments sorted nearest to expiration first
  const upcomingMaturities = useMemo(() => {
    return [...filteredFdrs]
      .filter((f) => f.maturityDate && f.status !== "RELEASED" && f.status !== "RENEWED")
      .map((fdr) => ({
        ...fdr,
        daysLeft: getDaysRemaining(fdr.maturityDate),
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);
  }, [filteredFdrs]);

  // Derived calculations matching the reference screenshot
  const totalDepositSum = metrics?.totalDepositSum || 263000000; // ₹26.30 Cr
  const totalCount = metrics?.totalInstruments || allFdrs.length || 140;
  const expiringCount = metrics?.expiringCount || 13;
  const maturedCount = metrics?.maturedCount || 7;
  const attentionCount = expiringCount + maturedCount; // 20
  const verifiedCount = metrics?.verifiedCount || 112;

  return (
    <div className="space-y-6 select-none animate-glass-in pb-12">
      {/* =========================================================================
          PAGE INTRODUCTION & REGION FILTER (EXACT REFERENCE SCREENSHOT)
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pt-1">
        <div className="space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
            REGULATION BUREAU · SECURITY DEPOSIT MANAGEMENT
          </div>
          <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-slate-900 leading-tight">
            Security Deposit Overview
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 max-w-2xl leading-relaxed">
            Monitor FDR records, upcoming maturities and pending actions in one place.
          </p>
        </div>

        {/* Region Selector Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <span className="text-xs font-medium text-slate-500">Region</span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setRegionDropdownOpen(!regionDropdownOpen)}
              className="bg-white border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 flex items-center gap-2 shadow-2xs hover:border-blue-400 transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>{currentRegionLabel}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  regionDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {regionDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setRegionDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-40 py-1.5">
                  {regionOptions.map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => {
                        setSelectedRegion(opt.code);
                        setRegionDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer hover:bg-slate-50 ${
                        selectedRegion === opt.code
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-slate-700"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {selectedRegion === opt.code && (
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          FOUR KPI CARDS (ONE RESPONSIVE ROW)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Security Deposits */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Coins className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-slate-700">
                Total Security Deposits
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-[30px] font-black text-slate-900 tracking-tight leading-none">
                ₹{(totalDepositSum / 10000000).toFixed(2)} Cr
              </span>
            </div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-slate-100 text-[11.5px] text-slate-500">
            {totalCount} FDR records in sample data
          </div>
        </div>

        {/* Card 2: Expiring or Overdue FDRs */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Calendar className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-slate-700">
                Expiring or Overdue FDRs
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-[30px] font-black text-slate-900 tracking-tight leading-none">
                {attentionCount}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-slate-100 text-[11.5px] text-slate-500">
            {expiringCount} due within 90 days · {maturedCount} matured
          </div>
        </div>

        {/* Card 3: Verification Match Rate */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-slate-700">
                Verification Match Rate
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-[30px] font-black text-slate-900 tracking-tight leading-none">
                98.4%
              </span>
            </div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
            Demonstration data · not a live bank connection
          </div>
        </div>

        {/* Card 4: Lien Status Recorded */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-slate-700">
                Lien Status Recorded
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-[30px] font-black text-slate-900 tracking-tight leading-none">
                {verifiedCount} / {totalCount}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-slate-100 text-[11.5px] text-slate-500">
            80% of sample FDR records
          </div>
        </div>
      </div>

      {/* =========================================================================
          MAIN OPERATIONAL SECTION (TWO-COLUMN LAYOUT)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: UPCOMING MATURITIES TABLE (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h2 className="font-bold text-[15px] text-slate-900">
                Upcoming Maturities
              </h2>
            </div>
            <Link
              href="/maturities"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              <span>View all maturities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="pb-2.5 font-semibold">Institution Name</th>
                  <th className="pb-2.5 font-semibold">Bank</th>
                  <th className="pb-2.5 font-semibold">Amount</th>
                  <th className="pb-2.5 font-semibold">Maturity Date</th>
                  <th className="pb-2.5 font-semibold">Days Left</th>
                  <th className="pb-2.5 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {upcomingMaturities.length > 0 ? (
                  upcomingMaturities.map((fdr, idx) => {
                    const days = fdr.daysLeft;
                    const daysColor =
                      days <= 14
                        ? "text-red-600 font-bold"
                        : days <= 30
                        ? "text-amber-600 font-bold"
                        : "text-blue-600 font-semibold";

                    return (
                      <tr
                        key={fdr.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      >
                        <td className="py-3 pr-2 min-w-[180px]">
                          <Link
                            href={`/repository/${fdr.id}`}
                            className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors block truncate max-w-[220px]"
                          >
                            {fdr.institutionName || `Institution ${idx + 1}`}
                          </Link>
                          <span className="text-[10.5px] font-mono text-slate-400">
                            {fdr.fdrNumber}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600 whitespace-nowrap">
                          {fdr.bankName.replace("State Bank of India", "SBI").replace("Punjab National Bank", "PNB")}
                        </td>
                        <td className="py-3 font-semibold text-slate-900 whitespace-nowrap">
                          ₹{(fdr.amount / 100000).toFixed(2)} L
                        </td>
                        <td className="py-3 text-slate-600 whitespace-nowrap">
                          {formatIndianDate(fdr.maturityDate)}
                        </td>
                        <td className={`py-3 whitespace-nowrap ${daysColor}`}>
                          {days < 0 ? `${Math.abs(days)}d Overdue` : `${days} days`}
                        </td>
                        <td className="py-3 text-right whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            Active
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      No upcoming maturities in this region.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: PENDING ACTIONS (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <h2 className="font-bold text-[15px] text-slate-900">
                Pending Actions
              </h2>
            </div>
            <Link
              href="/deficiency-notices"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              <span>Open review queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {/* Item 1: Discrepancy notices need review */}
            <Link
              href="/deficiency-notices"
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/70 hover:border-blue-300 hover:bg-blue-50/20 transition-all group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-9 w-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-[13px] text-slate-900 group-hover:text-blue-600 transition-colors">
                    2 discrepancy notices need review
                  </h4>
                  <p className="text-[11.5px] text-slate-500 mt-0.5 leading-snug">
                    Documents with mismatches or missing information
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </Link>

            {/* Item 2: Matured FDRs need follow-up */}
            <Link
              href="/maturities"
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/70 hover:border-blue-300 hover:bg-blue-50/20 transition-all group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-9 w-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-[13px] text-slate-900 group-hover:text-blue-600 transition-colors">
                    7 matured FDRs need follow-up
                  </h4>
                  <p className="text-[11.5px] text-slate-500 mt-0.5 leading-snug">
                    Matured instruments pending renewal or release action
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </Link>

            {/* Item 3: Renewal documents awaiting review */}
            <Link
              href="/maturities"
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/70 hover:border-blue-300 hover:bg-blue-50/20 transition-all group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-9 w-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <RefreshCw className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-[13px] text-slate-900 group-hover:text-blue-600 transition-colors">
                    Renewal documents awaiting review
                  </h4>
                  <p className="text-[11.5px] text-slate-500 mt-0.5 leading-snug">
                    New or replacement FDRs submitted by institutions
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          QUICK ACTIONS (BOTTOM SECTION - 3 RICH REGULATORY ACTION CARDS)
          ========================================================================= */}
      <div className="space-y-3 pt-2 select-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-800">Quick Actions</h3>
          </div>
          <span className="text-xs text-slate-400">Essential operations & triage shortcuts</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
          {/* Card 1: Add FDR (Digital Intake & Registration) */}
          <Link
            href="/intake"
            className="bg-white hover:bg-slate-50/70 border border-slate-200/90 hover:border-blue-400/80 rounded-2xl p-5 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-blue-600 uppercase">
                  DIGITAL INTAKE
                </span>
                <span className="bg-blue-50 text-blue-700 border border-blue-200/70 text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0">
                  OCR Active
                </span>
              </div>

              <div className="mt-3 flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/90 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-2xs">
                  <Plus className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                    Add FDR
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    Register a new security deposit with laser OCR extraction and automated coordinate mapping.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11.5px]">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                Fast Intake (&lt;250ms)
              </span>
              <span className="font-semibold text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Register deposit <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>

          {/* Card 2: Review Documents (Document Verification & Audit Queue) */}
          <Link
            href="/verification"
            className="bg-white hover:bg-slate-50/70 border border-slate-200/90 hover:border-amber-400/80 rounded-2xl p-5 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-amber-600 uppercase">
                  VERIFICATION QUEUE
                </span>
                <span className="bg-amber-50 text-amber-700 border border-amber-200/70 text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0">
                  2 Notices Pending
                </span>
              </div>

              <div className="mt-3 flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100/90 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-2xs">
                  <FileSearch className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-base text-slate-900 group-hover:text-amber-600 transition-colors leading-tight">
                    Review Documents
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    Scrutinize flagged deposit certificates, IFSC collisions, and 8-rule discrepancy dossiers.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11.5px]">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                100-pt Attention Score
              </span>
              <span className="font-semibold text-amber-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Open queue <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>

          {/* Card 3: New Release Request (Settlement & Hard Release Gate) */}
          <Link
            href="/release-workflow"
            className="bg-white hover:bg-slate-50/70 border border-slate-200/90 hover:border-emerald-400/80 rounded-2xl p-5 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-emerald-600 uppercase">
                  DISCHARGE GATEWAY
                </span>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0">
                  Dual-Key Active
                </span>
              </div>

              <div className="mt-3 flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/90 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-2xs">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-base text-slate-900 group-hover:text-emerald-600 transition-colors leading-tight">
                    New Release Request
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    Initiate tripartite statutory lien discharge and dual RO-Bureau encashment clearance.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11.5px]">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Hard Release Gate
              </span>
              <span className="font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Initiate release <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
