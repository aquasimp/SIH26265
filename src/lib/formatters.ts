/**
 * Format currency according to the Indian Numbering System (Lakhs & Crores)
 * e.g., 1250000 -> "12,50,000"
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
 * Format an ISO date string (YYYY-MM-DD or full ISO) into Indian institutional format: "DD MMM YYYY"
 * e.g., "2026-10-15" -> "15 Oct 2026"
 */
export function formatIndianDate(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return "—";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "—";
    
    const day = String(d.getDate()).padStart(2, "0");
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return "—";
  }
}

/**
 * Calculate difference in whole days between today and target date
 * Positive = future (days remaining until maturity)
 * Negative = past (days overdue)
 */
export function getDaysRemaining(targetDateStr: string, relativeToDateStr?: string): number {
  try {
    const target = new Date(targetDateStr);
    const base = relativeToDateStr ? new Date(relativeToDateStr) : new Date();
    
    // Normalize to midnight UTC for clean whole day math
    const targetUtc = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
    const baseUtc = Date.UTC(base.getFullYear(), base.getMonth(), base.getDate());
    
    const diffTime = targetUtc - baseUtc;
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/**
 * Format days remaining with human regulatory context
 */
export function formatRemainingTenure(targetDateStr: string): {
  days: number;
  label: string;
  urgency: "EXPIRED" | "CRITICAL" | "UPCOMING" | "HEALTHY";
} {
  const days = getDaysRemaining(targetDateStr);
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
