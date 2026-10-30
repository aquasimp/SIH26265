/**
 * Format currency according to the Indian Numbering System (Lakhs & Crores)
 * e.g., 1250000 -> "₹12,50,000"
 */
export function formatIndianCurrency(amount: number, includeSymbol: boolean = true): string {
  if (isNaN(amount)) return "—";
  
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  const str = absAmount.toString();
  
  let formatted = "";
  if (str.length <= 3) {
    formatted = str;
  } else {
    const lastThree = str.substring(str.length - 3);
    const otherNumbers = str.substring(0, str.length - 3);
    const withCommas = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    formatted = `${withCommas},${lastThree}`;
  }

  const sign = isNegative ? "-" : "";
  return includeSymbol ? `${sign}₹${formatted}` : `${sign}${formatted}`;
}

/**
 * Canonical reference date for the portal dataset simulation
 * When running SIH evaluation / synthetic dataset, today is pinned to 2026-10-30
 * unless overridden via environment variable or custom date.
 */
let systemReferenceDate = "2026-10-30";

export function setSystemReferenceDate(dateStr: string): void {
  systemReferenceDate = dateStr;
}

export function getTodayDateString(): string {
  return typeof process !== "undefined" && process.env?.NEXT_PUBLIC_PORTAL_DATE
    ? process.env.NEXT_PUBLIC_PORTAL_DATE
    : systemReferenceDate;
}

/**
 * Timezone-safe date parts extractor (avoids UTC to local midnight timezone shifts)
 */
export function parseDateParts(dateInput: string | Date | undefined | null): {
  year: number;
  month: number;
  day: number;
} | null {
  if (!dateInput) return null;
  if (typeof dateInput === "string") {
    const match = dateInput.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return {
        year: parseInt(match[1], 10),
        month: parseInt(match[2], 10) - 1, // 0-indexed month
        day: parseInt(match[3], 10),
      };
    }
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  // If parsed from an ISO string, check if it had UTC Z or time
  if (typeof dateInput === "string" && dateInput.includes("T")) {
    return {
      year: d.getUTCFullYear(),
      month: d.getUTCMonth(),
      day: d.getUTCDate(),
    };
  }
  return {
    year: d.getFullYear(),
    month: d.getMonth(),
    day: d.getDate(),
  };
}

/**
 * Format an ISO date string into Indian institutional format: "DD MMM YYYY"
 * Guaranteed to be timezone-independent: "2026-10-30" will always be "30 Oct 2026".
 */
export function formatIndianDate(dateInput: string | Date | undefined | null): string {
  const parts = parseDateParts(dateInput);
  if (!parts) return "—";

  const day = String(parts.day).padStart(2, "0");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const month = months[parts.month];
  return `${day} ${month} ${parts.year}`;
}

/**
 * Calculate difference in whole days between base date (today) and target date
 * Positive = future (days remaining until maturity)
 * Negative = past (days overdue / matured)
 * Pure UTC midnight calculation — immune to client timezone and DST shifts.
 */
export function getDaysRemaining(targetDateStr: string, relativeToDateStr?: string): number {
  try {
    const targetParts = parseDateParts(targetDateStr);
    const baseParts = parseDateParts(relativeToDateStr || getTodayDateString());

    if (!targetParts || !baseParts) return 0;

    const targetUtc = Date.UTC(targetParts.year, targetParts.month, targetParts.day);
    const baseUtc = Date.UTC(baseParts.year, baseParts.month, baseParts.day);

    const diffMs = targetUtc - baseUtc;
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/**
 * Format duration into compact human units for space-constrained badges & rings
 * Over 365 days: "7y 4m", "6y 9m" (or "1y 2m")
 * Under 365 days: "NNNd" (e.g. "240d", "45d", "5d")
 * Expired: "EXP" (with exact days overdue)
 */
export function formatCompactDuration(days: number): {
  compact: string;
  subtext: string;
  fullTooltip: string;
  isExpired: boolean;
  isOverYear: boolean;
} {
  if (days < 0) {
    const absDays = Math.abs(days);
    return {
      compact: "MAT",
      subtext: "EXPIRED",
      fullTooltip: `Matured ${absDays} day${absDays === 1 ? "" : "s"} ago (Statutory deposit lapsed)`,
      isExpired: true,
      isOverYear: false,
    };
  }

  if (days >= 365) {
    const years = Math.floor(days / 365);
    const remDays = days % 365;
    const months = Math.floor(remDays / 30);
    const compact = months > 0 ? `${years}y ${months}m` : `${years}y`;
    return {
      compact,
      subtext: "LEFT",
      fullTooltip: `${days} days remaining (${compact} until maturity)`,
      isExpired: false,
      isOverYear: true,
    };
  }

  return {
    compact: `${days}d`,
    subtext: "LEFT",
    fullTooltip: `${days} day${days === 1 ? "" : "s"} remaining until maturity`,
    isExpired: false,
    isOverYear: false,
  };
}

/**
 * Format days remaining with human regulatory context
 */
export function formatRemainingTenure(targetDateStr: string, relativeToDateStr?: string): {
  days: number;
  label: string;
  urgency: "EXPIRED" | "CRITICAL" | "UPCOMING" | "HEALTHY";
} {
  const days = getDaysRemaining(targetDateStr, relativeToDateStr);
  if (days < 0) {
    return {
      days,
      label: `Matured ${Math.abs(days)}d ago`,
      urgency: "EXPIRED",
    };
  }
  if (days <= 15) {
    return {
      days,
      label: `Expiring in ${days}d`,
      urgency: "CRITICAL",
    };
  }
  if (days <= 90) {
    return {
      days,
      label: `${days}d remaining`,
      urgency: "UPCOMING",
    };
  }
  return {
    days,
    label: `${days}d remaining`,
    urgency: "HEALTHY",
  };
}

/**
 * Mask sensitive bank account / FDR strings for unprivileged views
 * e.g., "SBIN0012345678" -> "SBIN••••78"
 */
export function maskSensitiveId(val: string, visiblePrefix = 4, visibleSuffix = 2): string {
  if (!val || val.length <= visiblePrefix + visibleSuffix) return val;
  const prefix = val.substring(0, visiblePrefix);
  const suffix = val.substring(val.length - visibleSuffix);
  return `${prefix}${"•".repeat(Math.max(3, val.length - visiblePrefix - visibleSuffix))}${suffix}`;
}

/**
 * Extract issuing bank code from IFSC
 */
export function getBankCodeFromIfsc(ifsc: string): string {
  if (!ifsc || ifsc.length < 4) return "";
  return ifsc.substring(0, 4).toUpperCase();
}
