"use client";

import React from "react";
import { getDaysRemaining } from "@/lib/formatters";

interface CircularValidityRingProps {
  maturityDate: string;
  size?: number;
  strokeWidth?: number;
}

export function CircularValidityRing({
  maturityDate,
  size = 64,
  strokeWidth = 5,
}: CircularValidityRingProps) {
  const days = getDaysRemaining(maturityDate);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Max scale: 3650 days (10 years)
  // Clamp percentage between 0 and 100
  const totalTenureDays = 3650;
  const clampedDays = Math.max(0, Math.min(totalTenureDays, days));
  const progressPercent = clampedDays / totalTenureDays;
  const strokeDashoffset = circumference - progressPercent * circumference;

  let strokeColor = "var(--botanical-primary)";
  let bgColor = "var(--botanical-subtle)";
  let statusText = `${days}d`;

  if (days < 0) {
    strokeColor = "var(--status-danger)";
    bgColor = "var(--status-danger-bg)";
    statusText = "MAT";
  } else if (days <= 15) {
    strokeColor = "var(--status-danger)";
    bgColor = "var(--status-danger-bg)";
  } else if (days <= 90) {
    strokeColor = "var(--saffron-primary)";
    bgColor = "var(--saffron-subtle)";
  }

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      title={`Maturity: ${maturityDate} (${days} days remaining)`}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--ink-border)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className="font-mono font-bold text-[11px] tabular-nums leading-none"
          style={{ color: strokeColor }}
        >
          {statusText}
        </span>
        <span className="text-[8px] uppercase tracking-tighter text-ink-muted leading-tight mt-0.5">
          {days < 0 ? "Expired" : "Left"}
        </span>
      </div>
    </div>
  );
}

