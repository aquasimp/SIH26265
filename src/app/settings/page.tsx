"use client";

import React, { useState, useEffect } from "react";
import { SystemConfig } from "@/lib/config";
import { formatIndianCurrency } from "@/lib/formatters";
import { useApp } from "@/context/AppContext";
import {
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building,
  Save,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

export default function SettingsPage() {
  const { currentRole } = useApp();
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setConfig(data.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": currentRole,
        },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(data.error || "Failed to save configuration");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
        Loading regulatory parameters...
      </div>
    );
  }

  const isBureauHead = currentRole === "BUREAU_HEAD";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="text-[11px] font-semibold text-blue-600 tracking-wider uppercase mb-1">
          REGULATION BUREAU · SYSTEM GOVERNANCE
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Rules & Regulatory Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configurable statutory parameters: maturity reminder schedule, idle case auto-escalation thresholds, and discipline deposit norms.
            </p>
          </div>

          {isBureauHead ? (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save Policy Parameters"}</span>
            </button>
          ) : (
            <span className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-medium self-start sm:self-auto">
              Read-Only (Modifiable by Bureau Head only)
            </span>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>System configuration updated successfully and logged to the SHA-256 audit trail.</span>
        </div>
      )}

      {/* Section 1: Validity Reminder Intervals */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-900">
            1. Maturity Reminder Schedule (Days Prior to Lapsing)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated alerts dispatched to institution dean and regional scrutiny officer.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          {config.reminderDaysTiers.map((days, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <label className="text-[10px] uppercase text-slate-400 font-bold">
                Tier {idx + 1} Alert
              </label>
              <div className="text-xl font-bold text-slate-900 font-mono">{days} Days</div>
              <div className="text-[11px] text-slate-500">Advance notice</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Escalation Idle Thresholds */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-900">
            2. Inaction & Idle Alert Auto-Escalation Thresholds
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Permissible idle review windows before unaddressed cases are escalated up the hierarchy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <label className="text-xs font-semibold text-slate-800">
              Scrutiny Cell → Regional Officer Escalation
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                disabled={!isBureauHead}
                value={config.escalationIdleDays.scrutinyToRo}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    escalationIdleDays: {
                      ...config.escalationIdleDays,
                      scrutinyToRo: Number(e.target.value),
                    },
                  })
                }
                className="w-24 p-2 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-900 text-sm focus:outline-none"
              />
              <span className="text-slate-500 text-xs">Days idle in Scrutiny Cell</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <label className="text-xs font-semibold text-slate-800">
              Regional Officer → Bureau Head Escalation
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                disabled={!isBureauHead}
                value={config.escalationIdleDays.roToBureauHead}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    escalationIdleDays: {
                      ...config.escalationIdleDays,
                      roToBureauHead: Number(e.target.value),
                    },
                  })
                }
                className="w-24 p-2 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-900 text-sm focus:outline-none"
              />
              <span className="text-slate-500 text-xs">Days unresolved in Region</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Statutory Deposit Slabs by Discipline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-900">
            3. Statutory Security Deposit Norms by Technical Discipline
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Prescribed minimum corpus required per AICTE Approval Process Handbook (APH 2024–27).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {Object.entries(config.depositNormsByDiscipline).map(([disc, amt]) => (
            <div key={disc} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <div className="font-semibold text-slate-800 text-xs truncate">
                {disc}
              </div>
              <div className="font-bold text-blue-600 text-sm font-mono">
                {formatIndianCurrency(amt)}
              </div>
              <div className="text-[11px] text-slate-400">10-Year Joint Term Deposit</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
