"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function SyntheticBanner() {
  const { t } = useApp();

  return (
    <aside aria-label="Regulatory Notice" className="bg-amber-900/10 border-b border-amber-900/20 px-4 py-1 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between font-mono">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-3.5 h-3.5 text-saffron shrink-0" />
        <span className="font-semibold tracking-wide">NOTICE:</span>
        <span>{t("syntheticBanner")}</span>
      </div>
      <div className="hidden md:flex items-center gap-4 text-[11px] opacity-80">
        <span>ISO-20022 / SFMS PARALLEL</span>
        <span>SHA-256 LEDGER VALIDATED</span>
      </div>
    </aside>
  );
}
