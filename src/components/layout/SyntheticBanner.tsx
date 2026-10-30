"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function SyntheticBanner() {
  const { t } = useApp();

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
      <div className="hidden lg:flex items-center gap-3.5 text-[10.5px] text-ink-muted shrink-0 font-medium">
        <span>ISO-20022 / CBS PARALLEL</span>
        <span>•</span>
        <span>SHA-256 LEDGER VALIDATED</span>
      </div>
    </aside>
  );
}

export default SyntheticBanner;
