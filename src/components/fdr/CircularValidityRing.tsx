"use client";

import React from "react";
import { getDaysRemaining, formatCompactDuration } from "@/lib/formatters";
import { SEVERITY_CONFIG } from "@/lib/severity";

interface CircularValidityRingProps {
  maturityDate: string;
  size?: number;
  strokeWidth?: number;
  relativeToDate?: string;
  className?: string;
}

export function CircularValidityRing({
  maturityDate,
  size = 48,
  strokeWidth = 3.5,
  relativeToDate,
  className = "",
}: CircularValidityRingProps) {
  const days = getDaysRemaining(maturityDate, relativeToDate);
  const duration = formatCompactDuration(days);

  // SVG coordinate geometry based on a stable 48x48 viewBox
  const viewBoxSize = 48;
  const radius = (viewBoxSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Max scale: 3650 days (10 years) statutory maximum
  const totalTenureDays = 3650;
  const clampedDays = Math.max(0, Math.min(totalTenureDays, days));
  const progressPercent = clampedDays / totalTenureDays;
  const strokeDashoffset = circumference - progressPercent * circumference;

  const isExpired = duration.isExpired;

  // Determine colors based on urgency
  let strokeColor = SEVERITY_CONFIG.ok.ringStroke;
  let textColor = SEVERITY_CONFIG.ok.ringText;
  let bgFill = "transparent";

  if (isExpired) {
    strokeColor = SEVERITY_CONFIG.critical.ringStroke;
    textColor = SEVERITY_CONFIG.critical.ringText;
    bgFill = SEVERITY_CONFIG.critical.ringBg;
  } else if (days <= 15) {
    strokeColor = SEVERITY_CONFIG.critical.ringStroke;
    textColor = SEVERITY_CONFIG.critical.ringText;
  } else if (days <= 90) {
    strokeColor = SEVERITY_CONFIG.high.ringStroke;
    textColor = SEVERITY_CONFIG.high.ringText;
  }

  // Dynamic font size fitting based on compact string length
  let valueFontSize = 11;
  if (duration.compact.length >= 6) {
    valueFontSize = 8.5;
  } else if (duration.compact.length >= 5) {
    valueFontSize = 9.5;
  } else if (duration.compact.length === 4) {
    valueFontSize = 10;
  }

  return (
    <div
      role="img"
      aria-label={duration.fullTooltip}
      title={duration.fullTooltip}
      className={`relative inline-flex items-center justify-center shrink-0 cursor-help select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        width={size}
        height={size}
        className="w-full h-full"
      >
        {/* Background track circle */}
        <circle
          cx={viewBoxSize / 2}
          cy={viewBoxSize / 2}
          r={radius}
          stroke={isExpired ? strokeColor : "var(--ink-border, #e5e7eb)"}
          strokeWidth={strokeWidth}
          fill={bgFill}
          className="transition-colors duration-300"
        />

        {/* Dynamic progress ring (rotate 90 deg counter-clockwise so progress starts at 12 o'clock) */}
        {!isExpired && (
          <circle
            cx={viewBoxSize / 2}
            cy={viewBoxSize / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            transform={`rotate(-90 ${viewBoxSize / 2} ${viewBoxSize / 2})`}
            className="transition-all duration-700 ease-out"
          />
        )}

        {/* Text inside ring: Center-anchored in SVG coordinate space */}
        {isExpired ? (
          <>
            <text
              x={viewBoxSize / 2}
              y="20.5"
              textAnchor="middle"
              dominantBaseline="central"
              fill={textColor}
              fontSize="11"
              fontWeight="800"
              className="font-mono tracking-tight"
            >
              MAT
            </text>
            <text
              x={viewBoxSize / 2}
              y="31.5"
              textAnchor="middle"
              dominantBaseline="central"
              fill={textColor}
              fontSize="7.5"
              fontWeight="800"
              letterSpacing="0.05em"
              className="font-mono"
            >
              EXPIRED
            </text>
          </>
        ) : (
          <>
            <text
              x={viewBoxSize / 2}
              y="20.5"
              textAnchor="middle"
              dominantBaseline="central"
              fill={textColor}
              fontSize={valueFontSize}
              fontWeight="700"
              className="font-mono tabular-nums tracking-tighter"
            >
              {duration.compact}
            </text>
            <text
              x={viewBoxSize / 2}
              y="31.5"
              textAnchor="middle"
              dominantBaseline="central"
              fill="var(--ink-muted, #64748b)"
              fontSize="7.5"
              fontWeight="600"
              letterSpacing="0.04em"
              className="font-mono"
            >
              {duration.subtext}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
