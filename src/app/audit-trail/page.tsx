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
} from "lucide-react";

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [integrity, setIntegrity] = useState<AuditVerificationResult | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    fetch("/api/audit-trail?limit=150")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLogs(data.data);
          setIntegrity(data.integrity);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const clean = searchTerm.toLowerCase();
    return (
      log.entityId.toLowerCase().includes(clean) ||
      log.action.toLowerCase().includes(clean) ||
      log.actorName.toLowerCase().includes(clean) ||
      log.actorRole.toLowerCase().includes(clean) ||
      log.details.toLowerCase().includes(clean)
    );
  });

  return (
    <div className="space-y-5 sm:space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="liquid-glass-card rounded-[22px] p-4.5 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-lg sm:text-xl text-ink-primary tracking-tight">
            Tamper-Evident SHA-256 Cryptographic Audit Ledger
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Immutable blockchain-style event chain tracking every submission, verification, override, and release
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] text-xs font-mono font-medium rounded border border-ink-border bg-paper-50 hover:bg-paper-200 text-ink-primary transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-ink-muted" />
          <span>Re-verify Chain</span>
        </button>
      </div>

      {/* Cryptographic Integrity Status Card */}
      {integrity && (
        <div
          className={`p-4.5 rounded-[20px] liquid-glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
            integrity.isValid
              ? "bg-botanical-subtle border-botanical/30 text-botanical"
              : "bg-red-50 border-red-300 text-red-700"
          }`}
        >
          <div className="flex items-center gap-3">
            {integrity.isValid ? (
              <ShieldCheck className="w-6 h-6 text-botanical shrink-0" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-red-600 shrink-0" />
            )}
            <div>
              <div className="font-serif font-bold text-sm">
                {integrity.isValid
                  ? "Audit Chain Sealed & Verified (100% Cryptographically Sound)"
                  : "Cryptographic Tamper / Break Detected!"}
              </div>
              <p className="text-[11px] font-mono mt-0.5">{integrity.message}</p>
            </div>
          </div>
          <div className="font-mono text-xs text-right shrink-0">
            <div>
              Total Blocks: <strong>{integrity.totalBlocks}</strong>
            </div>
            <div className="text-[10px] opacity-80">Algorithm: SHA-256 (64-byte Hex)</div>
          </div>
        </div>
      )}

      {/* Search Filter Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter audit entries by entity ref, action, officer name, or keyword..."
          className="w-full pl-9 pr-3 py-2 text-xs bg-paper-50 border border-ink-border rounded text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-ink-secondary font-mono"
        />
      </div>

      {/* Audit Blocks Timeline */}
      <div className="liquid-glass-card rounded-[22px] shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-paper-100 border-b border-ink-border flex items-center justify-between">
          <h3 className="font-serif font-bold text-sm text-ink-primary">
            Sequential Block Ledger History
          </h3>
          <span className="font-mono text-xs text-ink-muted">
            Displaying {filteredLogs.length} Block(s)
          </span>
        </div>

        <div className="divide-y divide-ink-border">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-paper-100/50 transition-colors text-xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-mono">
                  <span className="px-2 py-0.5 rounded bg-paper-300 font-bold text-[10px] text-ink-primary">
                    BLOCK #{log.sequenceNumber}
                  </span>
                  <span className="font-bold text-saffron">{log.action}</span>
                  <span className="text-ink-muted text-[10px]">({log.entityType} Ref: {log.entityId})</span>
                </div>
                <div className="text-ink-muted font-mono text-[10px] flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  <span>{formatIndianDate(log.timestamp)} • {log.timestamp.split("T")[1]?.slice(0, 8)} UTC</span>
                </div>
              </div>

              <p className="text-ink-primary font-sans text-xs">{log.details}</p>

              {/* Actor & Hashes */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pt-1 font-mono text-[10px] text-ink-muted border-t border-ink-border/50">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-botanical" />
                  <span>
                    Signatory: <strong className="text-ink-primary">{log.actorName}</strong> ({log.actorRole})
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[9px] min-w-0">
                  <span title={log.previousHash} className="truncate max-w-[180px] sm:max-w-[200px]">
                    Prev: {log.previousHash.slice(0, 16)}...
                  </span>
                  <span title={log.currentHash} className="truncate max-w-[180px] sm:max-w-[200px] text-saffron font-bold">
                    Hash: {log.currentHash.slice(0, 16)}...
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

