"use client";

import React, { useState, useEffect } from "react";
import { GlassFolderGrid } from "@/components/dashboard/GlassFolderGrid";
import { KpiCounterCard } from "@/components/dashboard/KpiCounterCard";
import { MaturityLadderChart } from "@/components/dashboard/MaturityLadderChart";
import { AttentionQueueTable } from "@/components/dashboard/AttentionQueueTable";
import { FdrInstrument } from "@/types/fdr";
import {
  Landmark,
  Clock,
  AlertOctagon,
  FileSearch,
  CheckCircle2,
  KeyRound,
  Filter,
} from "lucide-react";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [maturityLadder, setMaturityLadder] = useState<any[]>([]);
  const [priorityFdrs, setPriorityFdrs] = useState<FdrInstrument[]>([]);
  const [allFdrs, setAllFdrs] = useState<FdrInstrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("ALL");

  useEffect(() => {
    // Fetch KPI metrics and maturity ladder
    fetch("/api/kpi")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMetrics(data.metrics);
          setMaturityLadder(data.maturityLadder);
        }
      })
      .catch(console.error);

    // Fetch top priority FDRs and complete dataset for dossier folders
    fetch("/api/fdrs")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAllFdrs(data.data);
          // Sort descending by attention score
          const sorted = [...data.data].sort(
            (a, b) => (b.attentionScore || 0) - (a.attentionScore || 0)
          );
          setPriorityFdrs(sorted.slice(0, 10));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner / Treasury Status Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-ink-border pb-4">
        <div>
          <h2 className="font-serif font-bold text-xl text-ink-primary tracking-tight">
            Treasury Command Console
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Real-time sovereign regulatory overview of technical education security deposits & bank liens
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-paper-200 border border-ink-border text-ink-secondary">
            Statutory Lock-in: 120 Months
          </span>
          <span className="px-2.5 py-1 rounded bg-botanical-subtle text-botanical font-medium border border-botanical/20">
            ● AICTE Central Gateway Active
          </span>
        </div>
      </div>

      {/* Glass Folder Cards (Sovereign Regulatory Dossiers) */}
      <GlassFolderGrid instruments={allFdrs} />

      {/* KPI Counters Strip */}
      {metrics ? (
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
            value={metrics.openDiscrepancies || 0}
            subtitle={`${metrics.deficientCount || 0} instruments held in deficiency`}
            icon={AlertOctagon}
            accentColor="danger"
          />
          <KpiCounterCard
            label="Verified & Compliant"
            value={metrics.activeCount || 0}
            subtitle="Core banking confirmed with active lien"
            icon={CheckCircle2}
            accentColor="botanical"
          />
        </div>
      ) : (
        <div className="h-28 bg-paper-50 border border-ink-border rounded animate-pulse" />
      )}

      {/* Maturity Ladder Visual Chart */}
      <MaturityLadderChart data={maturityLadder} />

      {/* Priority Attention Triage Queue */}
      <AttentionQueueTable
        instruments={priorityFdrs}
        title="Immediate Regulatory Attention Queue"
        subtitle="Ranked by deterministic Attention Score (Days to Maturity + Discrepancies + CBS Verification)"
      />
    </div>
  );
}

