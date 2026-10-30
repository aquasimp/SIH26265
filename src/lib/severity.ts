export type SeverityTier = "critical" | "high" | "medium" | "low" | "ok";

export interface SeverityStyle {
  tier: SeverityTier;
  label: string;
  // Score badge classes
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  // Discrepancy chip classes (AA contrast guaranteed)
  chipBg: string;
  chipText: string;
  chipBorder: string;
  // Ring colors
  ringStroke: string;
  ringBg: string;
  ringText: string;
  // Hex reference
  hex: string;
}

export const SEVERITY_CONFIG: Record<SeverityTier, SeverityStyle> = {
  critical: {
    tier: "critical",
    label: "CRITICAL",
    badgeBg: "bg-red-100 dark:bg-red-950/80",
    badgeText: "text-red-700 dark:text-red-300 font-bold",
    badgeBorder: "border-red-300 dark:border-red-800",
    chipBg: "bg-red-50 dark:bg-red-950/70",
    chipText: "text-red-700 dark:text-red-300 font-semibold",
    chipBorder: "border-red-300 dark:border-red-800",
    ringStroke: "#dc2626", // red-600
    ringBg: "rgba(220, 38, 38, 0.12)",
    ringText: "#b91c1c", // red-700
    hex: "#dc2626",
  },
  high: {
    tier: "high",
    label: "HIGH",
    badgeBg: "bg-amber-100 dark:bg-amber-950/80",
    badgeText: "text-amber-800 dark:text-amber-200 font-bold",
    badgeBorder: "border-amber-300 dark:border-amber-700",
    chipBg: "bg-amber-50 dark:bg-amber-950/70",
    chipText: "text-amber-800 dark:text-amber-200 font-semibold",
    chipBorder: "border-amber-300 dark:border-amber-700",
    ringStroke: "#ea580c", // orange-600
    ringBg: "rgba(234, 88, 12, 0.12)",
    ringText: "#c2410c", // orange-700
    hex: "#ea580c",
  },
  medium: {
    tier: "medium",
    label: "ELEVATED",
    badgeBg: "bg-amber-50 dark:bg-amber-950/50",
    badgeText: "text-amber-700 dark:text-amber-300 font-semibold",
    badgeBorder: "border-amber-200 dark:border-amber-800",
    chipBg: "bg-amber-50/80 dark:bg-amber-950/50",
    chipText: "text-amber-700 dark:text-amber-300 font-medium",
    chipBorder: "border-amber-200 dark:border-amber-800",
    ringStroke: "var(--saffron-primary, #b45309)",
    ringBg: "var(--saffron-subtle, rgba(217, 119, 6, 0.1))",
    ringText: "var(--saffron-primary, #b45309)",
    hex: "#d97706",
  },
  low: {
    tier: "low",
    label: "ADVISORY",
    badgeBg: "bg-paper-200 dark:bg-paper-300",
    badgeText: "text-ink-secondary",
    badgeBorder: "border-ink-border",
    chipBg: "bg-paper-100 dark:bg-paper-200",
    chipText: "text-ink-secondary",
    chipBorder: "border-ink-border",
    ringStroke: "#64748b", // slate-500
    ringBg: "rgba(100, 116, 139, 0.1)",
    ringText: "#475569", // slate-600
    hex: "#64748b",
  },
  ok: {
    tier: "ok",
    label: "VERIFIED",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/60",
    badgeText: "text-emerald-700 dark:text-emerald-300 font-medium",
    badgeBorder: "border-emerald-300 dark:border-emerald-800",
    chipBg: "bg-emerald-50 dark:bg-emerald-950/60",
    chipText: "text-emerald-700 dark:text-emerald-300 font-medium",
    chipBorder: "border-emerald-300 dark:border-emerald-800",
    ringStroke: "var(--botanical-primary, #15803d)",
    ringBg: "var(--botanical-subtle, rgba(22, 101, 52, 0.1))",
    ringText: "var(--botanical-primary, #15803d)",
    hex: "#15803d",
  },
};

/**
 * Map attention score (0-100) to canonical severity tier
 */
export function mapScoreToSeverity(score: number): SeverityTier {
  if (score >= 70) return "critical";
  if (score >= 45) return "high";
  if (score >= 25) return "medium";
  if (score > 0) return "low";
  return "ok";
}

/**
 * Map discrepancy flag severity code to canonical severity tier
 */
export function mapFlagSeverityToTier(severity: string): SeverityTier {
  switch (severity?.toUpperCase()) {
    case "CRITICAL":
      return "critical";
    case "HIGH":
      return "high";
    case "MEDIUM":
    case "MODERATE":
      return "medium";
    case "ADVISORY":
    case "LOW":
      return "low";
    default:
      return "low";
  }
}

/**
 * Map remaining tenure urgency to canonical severity tier
 */
export function mapUrgencyToTier(urgency: string): SeverityTier {
  switch (urgency?.toUpperCase()) {
    case "EXPIRED":
      return "critical";
    case "CRITICAL":
      return "high";
    case "UPCOMING":
      return "medium";
    case "HEALTHY":
      return "ok";
    default:
      return "ok";
  }
}

export function getSeverityStyles(tier: SeverityTier): SeverityStyle {
  return SEVERITY_CONFIG[tier] || SEVERITY_CONFIG.low;
}

