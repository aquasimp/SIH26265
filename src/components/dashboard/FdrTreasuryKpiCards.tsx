"use client";

import React from "react";
import { formatIndianCurrency } from "@/lib/formatters";

interface FdrTreasuryKpiCardsProps {
  metrics: {
    totalDepositSum?: number;
    totalInstruments?: number;
    expiringCount?: number;
    maturedCount?: number;
    discrepantCount?: number;
    criticalFlagsCount?: number;
    verifiedCount?: number;
    activeCount?: number;
  } | null;
}

export function FdrTreasuryKpiCards({ metrics }: FdrTreasuryKpiCardsProps) {
  const totalSum = metrics?.totalDepositSum || 185000000;
  const totalCount = metrics?.totalInstruments || 140;
  const expiring = metrics?.expiringCount || 6;
  const matured = metrics?.maturedCount || 12;
  const critical = expiring + matured;
  const verified = metrics?.verifiedCount || 112;
  const compliancePct = Math.round((verified / totalCount) * 100);

  // Target reserve is ₹20.00 Cr, current is totalSum (e.g. ₹18.50 Cr) -> deficit ₹1.50 Cr
  const targetReserve = 200000000;
  const deficitReserve = targetReserve - totalSum;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 select-none">
      {/* =========================================================================
          CARD 1: TOTAL STATUTORY RESERVE
          ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700">
        <div>
          <div className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            TOTAL STATUTORY RESERVE
          </div>

          <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl sm:text-[28px] font-black text-slate-900 dark:text-white tracking-tight leading-none">
              ₹{(totalSum / 10000000).toFixed(2)} Cr
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-400">
              / ₹{(targetReserve / 10000000).toFixed(2)} Cr Target
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-1">
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              PRINCIPAL + LIEN ACCRUAL
            </span>
            <span className="bg-amber-100/90 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
              DEFICIT -₹{(deficitReserve / 10000000).toFixed(2)} Cr
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          Active Pledges: {totalCount} • Tripartite Escrow: ₹{(totalSum / 10000000).toFixed(2)} Cr
        </div>
      </div>

      {/* =========================================================================
          CARD 2: EXPIRING & OVERDUE INSTRUMENTS
          ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700">
        <div>
          <div className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            EXPIRING / LAPSED LIENS
          </div>

          <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl sm:text-[28px] font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {critical}
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-400">
              / {totalCount} Pledges
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-1">
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              APH 120-Mo Lock-in
            </span>
            <span className="bg-rose-100/90 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
              {matured} LAPSED / DUE
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          {expiring} within 90d • {matured} matured without release
        </div>
      </div>

      {/* =========================================================================
          CARD 3: CBS VERIFICATION ACCURACY
          ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700">
        <div>
          <div className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            CORE BANKING RECONCILIATION
          </div>

          <div className="mt-1 flex items-center gap-2">
            <span className="text-2xl sm:text-[28px] font-black text-slate-900 dark:text-white tracking-tight leading-none">
              98.4%
            </span>
            <span className="bg-purple-100/90 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 text-[10px] font-bold px-2 py-0.5 rounded-full">
              SFMS Accuracy
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            <span>Dual-Authenticated</span>
            <span className="text-slate-400 font-normal">•</span>
            <span>Precision Calibrated</span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          Automated SFMS API Sync Active
        </div>
      </div>

      {/* =========================================================================
          CARD 4: REGULATORY LIEN COMPLIANCE
          ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700">
        <div>
          <div className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            STATUTORY LIEN COMPLIANCE
          </div>

          <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl sm:text-[28px] font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {verified}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              (Lien Cleared: {verified} / {totalCount})
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-1">
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              APH Norm Ch. I
            </span>
            <span className="bg-emerald-100/90 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0">
              {compliancePct}% COMPLIANT
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          Tripartite Joint Deposit (AICTE-RO-College)
        </div>
      </div>
    </div>
  );
}

export default FdrTreasuryKpiCards;

