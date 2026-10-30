"use client";

import React, { useState } from "react";
import { ShieldAlert, X } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function SyntheticBanner() {
  const { t } = useApp();
  const [dismissed, setDismissed] = useState(true); // Closed by default to match clean screenshot

  if (dismissed) return null;

  return (
    <aside
      aria-label="Regulatory Notice"
      className="glass-well rounded-[14px] border border-amber-500/20 bg-amber-500/5 px-3.5 py-1.5 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between font-mono max-w-full overflow-hidden shadow-2xs select-none"
    >
      <div className="flex items-center gap-2 min-w-0">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="font-bold tracking-wide shrink-0 text-[10.5px] uppercase">
          AICTE STATUTORY PILOT:
        </span>
        <span className="truncate text-[11px] sm:text-xs text-ink-secondary">
          {t("syntheticBanner")}
        </span>
      </div>
      <div className="flex items-center gap-3 text-[10.5px] text-ink-muted shrink-0 font-medium">
        <span className="hidden lg:inline">ISO-20022 / CBS PARALLEL • SHA-256 LEDGER VALIDATED</span>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-ink-muted hover:text-ink-primary"
          title="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}

export default SyntheticBanner;
