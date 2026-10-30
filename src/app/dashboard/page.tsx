"use client";

import React, { useState, useEffect } from "react";
import { GlassFolderGrid } from "@/components/dashboard/GlassFolderGrid";
import { KpiCounterCard } from "@/components/dashboard/KpiCounterCard";
import { MaturityLadderChart } from "@/components/dashboard/MaturityLadderChart";
import { AttentionQueueTable } from "@/components/dashboard/AttentionQueueTable";
import { calculateAttentionScore } from "@/lib/rules/attentionScore";
import { FdrInstrument } from "@/types/fdr";
import {
  Landmark,
  Clock,
  AlertOctagon,
  CheckCircle2,
} from "lucide-react";

export default function TreasuryDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [maturityLadder, setMaturityLadder] = useState<any[]>([]);
  const [priorityFdrs, setPriorityFdrs] = useState<FdrInstrument[]>([]);
  const [allFdrs, setAllFdrs] = useState<FdrInstrument[]>([]);

  useEffect(() => {
    fetch("/api/kpi")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMetrics(data.metrics);
          setMaturityLadder(data.maturityLadder);
        }
      })
      .catch(console.error);

    fetch("/api/fdrs")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAllFdrs(data.data);
          const sorted = [...data.data].sort((a, b) => {
            const scoreA = calculateAttentionScore(a).totalScore;
            const scoreB = calculateAttentionScore(b).totalScore;
            if (scoreB !== scoreA) return scoreB - scoreA;
            return (b.amount || 0) - (a.amount || 0);
          });
          setPriorityFdrs(sorted.slice(0, 10));
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-5 animate-glass-in select-none">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4.5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-bold text-lg text-slate-900 dark:text-white">
            Treasury Command Console
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time sovereign regulatory overview of technical education security deposits & bank liens
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Statutory Lock-in: 120 Months
          </span>
          <span className="px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
            ● AICTE Central Gateway Active
          </span>
        </div>
      </div>

      <GlassFolderGrid instruments={allFdrs} />

      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCounterCard
            label="Total Statutory Reserve"
            value={metrics.totalDepositSum || 0}
            subtitle={`${metrics.totalInstruments} pledged instruments registered`}
            icon={Landmark}
            formatAsCurrency={true}
            accentColor="saffron"
          />
          <KpiCounterCard
            label="Expiring / Overdue"
            value={(metrics.expiringCount || 0) + (metrics.maturedCount || 0)}
            subtitle={`${metrics.expiringCount || 0} within 90d, ${metrics.maturedCount || 0} lapsed`}
            icon={Clock}
            accentColor="danger"
          />
          <KpiCounterCard
            label="Open Discrepancies"
            value={metrics.discrepantCount || 0}
            subtitle={`${metrics.criticalFlagsCount || 0} critical fraud flags pending`}
            icon={AlertOctagon}
            accentColor="danger"
          />
          <KpiCounterCard
            label="Verified & Compliant"
            value={metrics.verifiedCount || 0}
            subtitle="Dual-authenticated bank liens"
            icon={CheckCircle2}
            accentColor="botanical"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8">
          <AttentionQueueTable instruments={priorityFdrs} />
        </div>
        <div className="lg:col-span-4">
          <MaturityLadderChart data={maturityLadder} />
        </div>
      </div>
    </div>
  );
}

