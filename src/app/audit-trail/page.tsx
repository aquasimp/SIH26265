"use client";

import React, { useState, useEffect } from "react";
import { AuditLogEntry, AuditVerificationResult } from "@/types/audit";
import { formatIndianDate } from "@/lib/formatters";
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  Lock,
  Clock,
  ArrowRight,
  RotateCcw,
  UserCheck,
  Hash,
  Layers,
  Copy,
  Check,
} from "lucide-react";

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [integrity, setIntegrity] = useState<AuditVerificationResult | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const fetchLogs = () => {
    setLoading(true);
    fetch("/api/audit-trail?limit=150")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLogs(data.data || data.logs || []);
          setIntegrity(data.integrity);
        }
      })
      .catch((err) => console.error("Failed to load audit logs", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const clean = searchTerm.toLowerCase();
    return (
      (log.entityId && log.entityId.toLowerCase().includes(clean)) ||
      (log.action && log.action.toLowerCase().includes(clean)) ||
      (log.actorName && log.actorName.toLowerCase().includes(clean)) ||
      (log.actorRole && log.actorRole.toLowerCase().includes(clean)) ||
      (log.details && log.details.toLowerCase().includes(clean)) ||
      (log.currentHash && log.currentHash.toLowerCase().includes(clean))
    );
  });

  return (
    <div className="space-y-4 sm:space-y-5 max-w-full animate-glass-in select-none">
      {/* 1. Page Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4.5 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
            TAMPER-EVIDENT COMPLIANCE TRAIL • SHA-256
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sequential Cryptographic Audit Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Immutable blockchain-style event chain tracking every submission, bank verification, RO override, and release sanction under AICTE Regulations.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-3.5 py-2 min-h-[40px] text-xs font-mono font-bold rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors shadow-2xs shrink-0 cursor-pointer disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Re-verifying..." : "Re-verify Chain"}</span>
        </button>
      </div>

      {/* 2. Cryptographic Integrity Status Banner (Crisp Enterprise Glass) */}
      {integrity && (
        <div
          className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
            integrity.isValid
              ? "bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-300/80 dark:border-emerald-800/80 shadow-xs"
              : "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 shadow-xs"
          }`}
        >
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                integrity.isValid
                  ? "bg-emerald-600 text-white"
                  : "bg-rose-600 text-white"
              }`}
            >
              {integrity.isValid ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <ShieldAlert className="w-5 h-5" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                  {integrity.isValid
                    ? "Audit Chain Sealed & Verified (100% Cryptographically Sound)"
                    : "Cryptographic Tamper / Break Detected!"}
                </span>
                {integrity.isValid && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    SEALED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-mono mt-0.5">
                {integrity.message}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-200/60 dark:border-emerald-800/60 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Total Blocks:</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-extrabold border border-emerald-300/80 dark:border-emerald-700 shadow-2xs">
                {integrity.totalBlocks}
              </span>
            </div>
            <div className="text-[10.5px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span>Algorithm:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">SHA-256 (64-byte Hex)</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Search Filter Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter audit entries by entity ref, action, officer name, or SHA-256 hash..."
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500 font-mono shadow-xs transition-colors"
        />
      </div>

      {/* 4. Audit Blocks Timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/90 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Sequential Block Ledger History</span>
          </h3>
          <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            Displaying {filteredLogs.length} Block(s)
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-slate-400 animate-pulse">
            Verifying tamper-evident hash chain & loading blocks...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No audit blocks match the filter keyword.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 sm:p-4.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors text-xs space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 font-mono">
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-extrabold text-[10px] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                      BLOCK #{log.sequenceNumber}
                    </span>
                    <span className="font-bold text-xs px-2.5 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                      {log.action}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                      ({log.entityType} Ref:{" "}
                      <strong className="text-slate-700 dark:text-slate-300">
                        {log.entityId}
                      </strong>
                      )
                    </span>
                  </div>

                  <div className="text-slate-500 dark:text-slate-400 font-mono text-[10.5px] flex items-center gap-1.5 shrink-0">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {formatIndianDate(log.timestamp)} •{" "}
                      {log.timestamp.split("T")[1]?.slice(0, 8)} UTC
                    </span>
                  </div>
                </div>

                <p className="text-slate-800 dark:text-slate-200 font-sans text-xs leading-relaxed">
                  {log.details}
                </p>

                {/* Signatory Officer & Cryptographic Hashes */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 pt-2 font-mono text-[10.5px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>
                      Signatory:{" "}
                      <strong className="text-slate-900 dark:text-white font-semibold">
                        {log.actorName}
                      </strong>{" "}
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {log.actorRole}
                      </span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] min-w-0">
                    <span
                      title={`Previous Block Hash: ${log.previousHash}`}
                      className="truncate max-w-[180px] sm:max-w-[210px] bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-mono"
                    >
                      Prev: {log.previousHash.slice(0, 16)}...
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCopyHash(log.currentHash)}
                      title={`Click to copy full SHA-256 hash: ${log.currentHash}`}
                      className="inline-flex items-center gap-1 truncate max-w-[210px] text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800 hover:border-amber-400 transition-colors cursor-pointer"
                    >
                      <span>Hash: {log.currentHash.slice(0, 16)}...</span>
                      {copiedHash === log.currentHash ? (
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      ) : (
                        <Copy className="w-3 h-3 text-amber-600/70 shrink-0" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
