"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GlassFolderGrid } from "@/components/dashboard/GlassFolderGrid";
import { FdrTreasuryKpiCards } from "@/components/dashboard/FdrTreasuryKpiCards";
import { MaturityLadderChart } from "@/components/dashboard/MaturityLadderChart";
import { AttentionQueueTable } from "@/components/dashboard/AttentionQueueTable";
import { calculateAttentionScore } from "@/lib/rules/attentionScore";
import { FdrInstrument } from "@/types/fdr";
import { ChevronDown, Building2, MapPin, Check } from "lucide-react";

export default function TreasuryHomePage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [maturityLadder, setMaturityLadder] = useState<any[]>([]);
  const [allFdrs, setAllFdrs] = useState<FdrInstrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("ALL");
  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);

  useEffect(() => {
    // 1. Fetch KPI summary metrics and maturity ladder data
    fetch("/api/kpi")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMetrics(data.metrics);
          setMaturityLadder(data.maturityLadder || []);
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

  // Filter FDRs by selected region
  const filteredFdrs = useMemo(() => {
    if (selectedRegion === "ALL") return allFdrs;
    return allFdrs.filter((fdr) => fdr.institutionRegion === selectedRegion);
  }, [allFdrs, selectedRegion]);

  // Sort descending by deterministic Attention Score
  const priorityFdrs = useMemo(() => {
    const sorted = [...filteredFdrs].sort((a, b) => {
      const scoreA = calculateAttentionScore(a).totalScore;
      const scoreB = calculateAttentionScore(b).totalScore;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return (b.amount || 0) - (a.amount || 0);
    });
    return sorted.slice(0, 10);
  }, [filteredFdrs]);

  const regionOptions = [
    { code: "ALL", label: "All Regions • 140 Active FDR Instruments" },
    { code: "Western", label: "Western Regional Office (WRO - Mumbai)" },
    { code: "North-West", label: "North-West Regional Office (NWRO - Chandigarh)" },
    { code: "Northern", label: "Northern Regional Office (NRO - Kanpur)" },
    { code: "Southern", label: "Southern Regional Office (SRO - Chennai)" },
  ];

  const currentRegionLabel =
    regionOptions.find((r) => r.code === selectedRegion)?.label ||
    "All Regions • 140 Active Instruments";

  return (
    <div className="space-y-4 sm:space-y-5 max-w-full animate-glass-in select-none">
      {/* =========================================================================
          SUBHEADER & REGIONAL FILTER ROW (MATCHING 26261 DESIGN SYSTEM)
          ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-1 pb-1">
        <div className="space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
            AICTE STATUTORY DEPOSIT & FDR REGULATORY TREASURY • SIH26265
          </div>
          <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Treasury Command &{" "}
            <span className="text-sky-600 dark:text-sky-400">Pledged Security Studio</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
            Real-time sovereign regulatory overview of technical education security deposits, CBS bank liens, and tripartite custody under APH 2024–27.
          </p>
        </div>

        {/* Selected Dossier / Region Filter Dropdown */}
        <div className="relative shrink-0 flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Selected Filter:
          </span>

          <button
            type="button"
            onClick={() => setRegionDropdownOpen(!regionDropdownOpen)}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 shadow-xs hover:border-sky-400 dark:hover:border-sky-500 transition-colors cursor-pointer"
          >
            <span className="truncate max-w-[280px] sm:max-w-[340px]">
              {currentRegionLabel}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${regionDropdownOpen ? "rotate-180" : ""
                }`}
            />
          </button>

          {regionDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setRegionDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1.5 w-80 max-w-[calc(100vw-24px)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-40 py-2 animate-glass-in">
                <div className="px-3.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                  Regional Jurisdiction
                </div>
                {regionOptions.map((opt) => (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => {
                      setSelectedRegion(opt.code);
                      setRegionDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs transition-colors flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 ${selectedRegion === opt.code
                        ? "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold"
                        : "text-slate-700 dark:text-slate-300"
                      }`}
                  >
                    <span>{opt.label}</span>
                    {selectedRegion === opt.code && (
                      <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* =========================================================================
          4 STATUTORY KPI METRICS CARDS (MATCHING 26261'S COLORED TOP ACCENTS)
          ========================================================================= */}
      <FdrTreasuryKpiCards metrics={metrics} />

      {/* =========================================================================
          SOVEREIGN REGULATORY DOSSIER FOLDERS (PHYSICAL GLASS CARDS)
          ========================================================================= */}
      <GlassFolderGrid instruments={filteredFdrs} />

      {/* =========================================================================
          MAIN REGULATORY TRIAGE QUEUE & MATURITY SCHEDULE MATRIX
          ========================================================================= */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
              STATUTORY LIEN SURVEILLANCE & MATURITY MATRIX
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Immediate Regulatory Attention Queue & Maturity Schedule
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg">
              APH Chapter I Verified Custody
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Attention Queue Table (approx 65% width) */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
            <AttentionQueueTable
              instruments={priorityFdrs}
              loading={loading}
              title="Prioritized Statutory Action Queue"
              subtitle="Ranked by deterministic Attention Score (Days to Maturity + Critical Discrepancies + CBS Verification)"
            />
          </div>

          {/* Maturity Ladder Chart (approx 35% width) */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-wide uppercase">
                    Maturity Schedule & Escrow
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Monthly maturing lien volume (APH 120-month lock-in)
                  </p>
                </div>
              </div>

              <MaturityLadderChart data={maturityLadder} />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                <span>Tripartite Escrow Protocol:</span>
                <span className="text-emerald-600 dark:text-emerald-400">Active Lien</span>
              </div>
              <p className="text-[10px] leading-tight">
                All FDR instruments are jointly pledged to Member Secretary, AICTE and require dual-key cryptographic clearance before refund or release.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
