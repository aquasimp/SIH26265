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
  className?: string;
}

export function KpiCounterCard({
  label,
  value,
  subtitle,
  icon: Icon,
  formatAsCurrency = false,
  accentColor = "neutral",
  className = "",
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
    saffron: "text-amber-600 bg-amber-500/10 border-amber-500/25",
    botanical: "text-emerald-600 bg-emerald-500/10 border-emerald-500/25",
    danger: "text-rose-600 bg-rose-500/10 border-rose-500/25",
    neutral: "text-ink-secondary glass-well",
  }[accentColor];

  return (
    <div
      className={`liquid-glass-card rounded-[20px] p-4.5 sm:p-5 flex items-start justify-between shadow-xs hover:border-amber-500/35 transition-all select-none ${className}`}
    >
      <div className="space-y-1 min-w-0">
        <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted font-bold">
          {label}
        </span>
        <div className="font-mono text-2xl sm:text-[26px] font-extrabold text-ink-primary tabular-nums tracking-tight">
          {formattedDisplay}
        </div>
        {subtitle && (
          <div className="text-[11.5px] text-ink-muted truncate max-w-[240px]">
            {subtitle}
          </div>
        )}
      </div>
      <div className={`p-2.5 rounded-xl border ${colorStyles} shrink-0 ml-3 shadow-2xs`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
  );
}

export default KpiCounterCard;
