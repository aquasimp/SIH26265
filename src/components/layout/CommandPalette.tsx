"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Search, X, Layers, KeyRound, ScanLine, ArrowRight } from "lucide-react";
import { formatIndianCurrency } from "@/lib/formatters";

export function CommandPalette() {
  const { isCmdOpen, setIsCmdOpen } = useApp();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!isCmdOpen) {
      setQuery("");
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      fetch(`/api/fdrs?search=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setResults(data.data.slice(0, 8));
          }
        })
        .catch(() => { });
    }, 150);

    return () => clearTimeout(timer);
  }, [query, isCmdOpen]);

  if (!isCmdOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-20 bg-black/50 backdrop-blur-sm p-2 sm:p-4">
      <div className="w-full max-w-xl bg-paper-50 border border-ink-border rounded-xl sm:rounded shadow-ledger-elevated overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col max-h-[85dvh]">
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 border-b border-ink-border shrink-0">
          <Search className="w-4 h-4 text-ink-muted shrink-0 ml-1" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search FDR number, bank name, IFSC, college..."
            className="w-full bg-transparent text-base sm:text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none py-1"
          />
          <button
            onClick={() => setIsCmdOpen(false)}
            className="w-10 h-10 flex items-center justify-center text-ink-muted hover:text-ink-primary shrink-0 rounded-md"
            aria-label="Close command search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-ink-border">
          {results.length > 0 ? (
            results.map((fdr) => (
              <button
                key={fdr.id}
                onClick={() => {
                  setIsCmdOpen(false);
                  router.push(`/repository/${fdr.id}`);
                }}
                className="w-full text-left p-2.5 rounded hover:bg-paper-200 transition-colors flex items-center justify-between text-xs min-h-[44px]"
              >
                <div>
                  <div className="font-mono font-semibold text-ink-primary flex items-center gap-2">
                    <span>{fdr.fdrNumber}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-paper-300 font-sans">
                      {fdr.status}
                    </span>
                  </div>
                  <div className="text-ink-muted text-[11px] mt-0.5">
                    {fdr.bankName} • {fdr.ifscCode}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-medium text-ink-primary">
                    {formatIndianCurrency(fdr.amount)}
                  </div>
                  <div className="text-[10px] text-saffron flex items-center gap-1 justify-end">
                    <span>Inspect</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </div>
                </div>
              </button>
            ))
          ) : query ? (
            <div className="p-6 text-center text-xs text-ink-muted">
              No matching instruments found for &quot;{query}&quot;.
            </div>
          ) : (
            <div className="p-3 text-xs text-ink-muted space-y-1">
              <div className="font-mono text-[10px] uppercase text-ink-muted px-2 py-1">
                Quick Shortcuts
              </div>
              <button
                onClick={() => {
                  setIsCmdOpen(false);
                  router.push("/repository");
                }}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-paper-200 flex items-center gap-2"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Jump to Central Repository</span>
              </button>
              <button
                onClick={() => {
                  setIsCmdOpen(false);
                  router.push("/intake");
                }}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-paper-200 flex items-center gap-2"
              >
                <ScanLine className="w-3.5 h-3.5" />
                <span>Open OCR Intake Scanner</span>
              </button>
              <button
                onClick={() => {
                  setIsCmdOpen(false);
                  router.push("/release-workflow");
                }}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-paper-200 flex items-center gap-2"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>View Release & Refund Queue</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

