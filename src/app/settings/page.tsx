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
      <div className="p-8 text-center text-xs font-mono text-ink-muted">
        Loading regulatory parameters...
      </div>
    );
  }

  const isBureauHead = currentRole === "BUREAU_HEAD";

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-ink-border pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-xl text-ink-primary tracking-tight">
            Regulatory Policy Configuration & Thresholds
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Configurable governance parameters: reminder schedule, idle escalation rules, and discipline deposit norms
          </p>
        </div>

        {isBureauHead ? (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 bg-saffron hover:bg-saffron-hover text-white text-xs font-semibold rounded shadow-sm transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : "Save Policy Parameters"}</span>
          </button>
        ) : (
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-paper-200 border border-ink-border text-ink-muted">
            Read-Only (Modifiable by Bureau Head only)
          </span>
        )}
      </div>

      {saveSuccess && (
        <div className="p-3 bg-botanical-subtle border border-botanical/30 rounded text-xs text-botanical font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>System configuration updated and logged to audit trail.</span>
        </div>
      )}

      {/* Section 1: Validity Reminder Intervals */}
      <div className="p-5 bg-paper-50 border border-ink-border rounded shadow-ledger space-y-4">
        <div className="border-b border-ink-border pb-2.5">
          <h3 className="font-serif font-bold text-sm text-ink-primary">
            1. Maturity Reminder Schedule (Days Prior to Lapsing)
          </h3>
          <p className="text-xs text-ink-muted">
            Automated notifications issued to applicant institution and regional scrutiny cell
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
          {config.reminderDaysTiers.map((days, idx) => (
            <div key={idx} className="p-3 bg-paper-100 border border-ink-border rounded space-y-1">
              <label className="text-[10px] uppercase text-ink-muted font-bold">
                Tier {idx + 1} Alert
              </label>
              <div className="text-base font-bold text-ink-primary">{days} Days</div>
              <div className="text-[9px] text-ink-muted">Advance notice</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Escalation Idle Thresholds */}
      <div className="p-5 bg-paper-50 border border-ink-border rounded shadow-ledger space-y-4">
        <div className="border-b border-ink-border pb-2.5">
          <h3 className="font-serif font-bold text-sm text-ink-primary">
            2. Inaction & Idle Alert Auto-Escalation Thresholds
          </h3>
          <p className="text-xs text-ink-muted">
            Defines permissible idle review windows before case is automatically promoted to higher administrative authority
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-4 bg-paper-100 border border-ink-border rounded space-y-2">
            <label className="text-[11px] font-semibold text-ink-primary uppercase">
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
                className="w-24 p-2 bg-paper-50 border border-ink-border rounded font-bold text-ink-primary text-sm"
              />
              <span className="text-ink-secondary text-xs">Days idle in Scrutiny Cell</span>
            </div>
          </div>

          <div className="p-4 bg-paper-100 border border-ink-border rounded space-y-2">
            <label className="text-[11px] font-semibold text-ink-primary uppercase">
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
                className="w-24 p-2 bg-paper-50 border border-ink-border rounded font-bold text-ink-primary text-sm"
              />
              <span className="text-ink-secondary text-xs">Days unresolved in Region</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Statutory Deposit Slabs by Discipline */}
      <div className="p-5 bg-paper-50 border border-ink-border rounded shadow-ledger space-y-4">
        <div className="border-b border-ink-border pb-2.5">
          <h3 className="font-serif font-bold text-sm text-ink-primary">
            3. Statutory Security Deposit Norms by Technical Discipline
          </h3>
          <p className="text-xs text-ink-muted">
            Prescribed minimum corpus required per AICTE Approval Process Handbook (APH)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
          {Object.entries(config.depositNormsByDiscipline).map(([disc, amt]) => (
            <div key={disc} className="p-3 bg-paper-100 border border-ink-border rounded space-y-1">
              <div className="font-semibold text-ink-primary text-[11px] truncate font-sans">
                {disc}
              </div>
              <div className="font-bold text-saffron text-sm">
                {formatIndianCurrency(amt)}
              </div>
              <div className="text-[10px] text-ink-muted">10-Year Joint FDR</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
