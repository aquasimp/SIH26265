"use client";

import React, { useEffect, useState } from "react";
import { LucideIcon } from "lucide-react";

interface KpiCounterCardProps {
  label: string;
  value: number;
  subtitle?: string;
  icon: LucideIcon;
  formatAsCurrency?: boolean;
  accentColor?: "saffron" | "botanical" | "danger" | "neutral";
}

export function KpiCounterCard({
  label,
  value,
  subtitle,
  icon: Icon,
  formatAsCurrency = false,
  accentColor = "neutral",
}: KpiCounterCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 800; // ms
    const steps = 30;
    const increment = value / steps;
    const stepTime = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  const formattedDisplay = formatAsCurrency
    ? `₹${(displayValue / 10000000).toFixed(2)} Cr`
    : displayValue.toLocaleString("en-IN");

  const colorStyles = {
    saffron: "text-saffron bg-saffron-subtle border-saffron/20",
    botanical: "text-botanical bg-botanical-subtle border-botanical/20",
    danger: "text-red-700 bg-red-50 dark:bg-red-950 dark:text-red-300 border-red-200",
    neutral: "text-ink-secondary bg-paper-200 border-ink-border",
  }[accentColor];

  return (
    <div className="p-4 bg-paper-50 border border-ink-border rounded shadow-ledger flex items-start justify-between">
      <div className="space-y-1">
        <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
          {label}
        </span>
        <div className="font-mono text-2xl font-bold text-ink-primary tabular-nums tracking-tight">
          {formattedDisplay}
        </div>
        {subtitle && (
          <div className="text-[11px] text-ink-muted font-sans">{subtitle}</div>
        )}
      </div>
      <div className={`p-2 rounded border ${colorStyles} shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
  );
}
