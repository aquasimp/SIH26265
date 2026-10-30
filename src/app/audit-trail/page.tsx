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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="text-[11px] font-semibold text-blue-600 tracking-wider uppercase mb-1">
          REGULATION BUREAU · IMMUTABLE AUDIT TRAIL
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Cryptographic Audit Ledger
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Tamper-evident linear block chain using SHA-256 cryptographic hashes protecting every deposit registration, verification, and release.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Re-verifying..." : "Re-verify Hash Chain"}</span>
          </button>
        </div>
      </div>

      {/* Cryptographic Integrity Status Banner */}
      {integrity && (
        <div
          className={`p-5 rounded-2xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs ${
            integrity.isValid
              ? "bg-emerald-50/70 border-emerald-200"
              : "bg-rose-50 border-rose-200"
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
                <span className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">
                  {integrity.isValid
                    ? "Audit Chain Sealed & Verified (100% Cryptographically Sound)"
                    : "Cryptographic Tamper / Break Detected!"}
                </span>
                {integrity.isValid && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    SEALED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 font-mono mt-0.5">
                {integrity.message}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-200/60 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">Total Blocks:</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-white text-slate-900 font-bold border border-emerald-300 shadow-2xs">
                {integrity.totalBlocks}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <span>Standard:</span>
              <span className="font-bold text-slate-800">SHA-256 (64-byte Hex)</span>
            </div>
          </div>
        </div>
      )}

      {/* Search Filter Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter audit entries by entity reference, action, officer name, or SHA-256 hash..."
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono shadow-xs transition-colors"
        />
      </div>

      {/* Audit Blocks Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Sequential Block Ledger History</span>
          </h3>
          <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
            {filteredLogs.length} Block(s)
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-slate-400 animate-pulse">
            Verifying cryptographic hash chain & loading blocks...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No audit blocks match the filter keyword.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors text-xs space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 font-mono">
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 font-bold text-[10px] text-slate-800 border border-slate-200">
                      BLOCK #{log.sequenceNumber}
                    </span>
                    <span className="font-bold text-xs px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                      {log.action}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      ({log.entityType} Ref: <strong className="text-slate-800">{log.entityId}</strong>)
                    </span>
                  </div>

                  <div className="text-slate-500 font-mono text-[10.5px] flex items-center gap-1.5 shrink-0">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {formatIndianDate(log.timestamp)} • {log.timestamp.split("T")[1]?.slice(0, 8)} UTC
                    </span>
                  </div>
                </div>

                <p className="text-slate-800 font-sans text-xs leading-relaxed">
                  {log.details}
                </p>

                {/* Signatory Officer & Cryptographic Hashes */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 pt-2 font-mono text-[10.5px] text-slate-500 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      Signatory: <strong className="text-slate-900 font-semibold">{log.actorName}</strong>{" "}
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {log.actorRole}
                      </span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] min-w-0">
                    <span
                      title={`Previous Block Hash: ${log.previousHash}`}
                      className="truncate max-w-[180px] sm:max-w-[210px] bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 font-mono"
                    >
                      Prev: {log.previousHash.slice(0, 16)}...
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCopyHash(log.currentHash)}
                      title={`Click to copy full SHA-256 hash: ${log.currentHash}`}
                      className="inline-flex items-center gap-1 truncate max-w-[210px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 hover:border-blue-400 transition-colors cursor-pointer"
                    >
                      <span>Hash: {log.currentHash.slice(0, 16)}...</span>
                      {copiedHash === log.currentHash ? (
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      ) : (
                        <Copy className="w-3 h-3 text-blue-600/70 shrink-0" />
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
