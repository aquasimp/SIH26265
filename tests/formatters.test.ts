import { describe, it, expect } from "vitest";
import {
  formatIndianCurrency,
  formatIndianDate,
  getDaysRemaining,
  formatRemainingTenure,
  formatCompactDuration,
  parseDateParts,
  maskSensitiveId,
  getBankCodeFromIfsc,
} from "@/lib/formatters";

describe("Indian Treasury Formatting & Utility Functions", () => {
  describe("formatIndianCurrency", () => {
    it("should format standard lakhs in Indian numbering (12,50,000)", () => {
      expect(formatIndianCurrency(1250000)).toBe("₹12,50,000");
    });

    it("should format multi-crore sums correctly (42,50,00,000)", () => {
      expect(formatIndianCurrency(425000000)).toBe("₹42,50,00,000");
    });

    it("should handle amounts without currency symbol when requested", () => {
      expect(formatIndianCurrency(3500000, false)).toBe("35,00,000");
    });

    it("should handle small amounts under a thousand (500)", () => {
      expect(formatIndianCurrency(500)).toBe("₹500");
    });

    it("should handle zero and negative numbers cleanly", () => {
      expect(formatIndianCurrency(0)).toBe("₹0");
      expect(formatIndianCurrency(-50000)).toBe("-₹50,000");
    });

    it("should return dash for NaN", () => {
      expect(formatIndianCurrency(NaN)).toBe("—");
    });
  });

  describe("formatIndianDate", () => {
    it("should format ISO date string into Indian institutional DD MMM YYYY format", () => {
      expect(formatIndianDate("2026-10-30")).toBe("30 Oct 2026");
      expect(formatIndianDate("2034-01-15")).toBe("15 Jan 2034");
    });

    it("should never shift dates across timezone offsets", () => {
      // Simulate standard YYYY-MM-DD input
      expect(formatIndianDate("2026-08-01")).toBe("01 Aug 2026");
      expect(formatIndianDate("2026-09-15")).toBe("15 Sep 2026");
      expect(formatIndianDate("2026-10-16")).toBe("16 Oct 2026");
      expect(formatIndianDate("2026-11-04")).toBe("04 Nov 2026");
      expect(formatIndianDate("2033-08-10")).toBe("10 Aug 2033");
      expect(formatIndianDate("2034-03-01")).toBe("01 Mar 2034");
    });

    it("should handle invalid or null dates gracefully", () => {
      expect(formatIndianDate(null)).toBe("—");
      expect(formatIndianDate(undefined)).toBe("—");
      expect(formatIndianDate("invalid-date")).toBe("—");
    });
  });

  describe("formatCompactDuration", () => {
    it("should format multi-year durations compactly over 365 days", () => {
      // 2679 days = 7 years + 124 days (~4 months) -> "7y 4m"
      const res2679 = formatCompactDuration(2679);
      expect(res2679.compact).toBe("7y 4m");
      expect(res2679.subtext).toBe("LEFT");
      expect(res2679.isOverYear).toBe(true);
      expect(res2679.fullTooltip).toContain("2679 days remaining");

      // 2476 days = 6 years + 286 days (~9 months) -> "6y 9m"
      const res2476 = formatCompactDuration(2476);
      expect(res2476.compact).toBe("6y 9m");
      expect(res2476.subtext).toBe("LEFT");

      // Exact 1 year = 365 days -> "1y"
      const res365 = formatCompactDuration(365);
      expect(res365.compact).toBe("1y");
      expect(res365.subtext).toBe("LEFT");
    });

    it("should format days under 365 days as NNNd", () => {
      expect(formatCompactDuration(364).compact).toBe("364d");
      expect(formatCompactDuration(90).compact).toBe("90d");
      expect(formatCompactDuration(45).compact).toBe("45d");
      expect(formatCompactDuration(5).compact).toBe("5d");
      expect(formatCompactDuration(0).compact).toBe("0d");
    });

    it("should format expired negative days with unmistakable MAT and EXPIRED label", () => {
      const exp45 = formatCompactDuration(-45);
      expect(exp45.compact).toBe("MAT");
      expect(exp45.subtext).toBe("EXPIRED");
      expect(exp45.isExpired).toBe(true);
      expect(exp45.fullTooltip).toContain("Matured 45 days ago");

      const exp90 = formatCompactDuration(-90);
      expect(exp90.compact).toBe("MAT");
      expect(exp90.subtext).toBe("EXPIRED");
      expect(exp90.isExpired).toBe(true);
      expect(exp90.fullTooltip).toContain("Matured 90 days ago");
    });
  });

  describe("getDaysRemaining & formatRemainingTenure", () => {
    it("should compute exact whole calendar days difference relative to baseline", () => {
      const base = "2026-10-30";
      expect(getDaysRemaining("2026-11-04", base)).toBe(5);
      expect(getDaysRemaining("2026-10-30", base)).toBe(0);
      expect(getDaysRemaining("2026-10-29", base)).toBe(-1);
      expect(getDaysRemaining("2026-10-16", base)).toBe(-14);
      expect(getDaysRemaining("2026-09-15", base)).toBe(-45);
      expect(getDaysRemaining("2026-08-01", base)).toBe(-90);
      expect(getDaysRemaining("2034-03-01", base)).toBe(2679);
      expect(getDaysRemaining("2033-08-10", base)).toBe(2476);
    });

    it("should handle leap year transitions cleanly", () => {
      const base = "2028-02-28";
      expect(getDaysRemaining("2028-02-29", base)).toBe(1);
      expect(getDaysRemaining("2028-03-01", base)).toBe(2);
    });

    it("should classify overdue past dates as EXPIRED", () => {
      const res = formatRemainingTenure("2026-09-15", "2026-10-30");
      expect(res.urgency).toBe("EXPIRED");
      expect(res.label).toBe("Matured 45d ago");
    });

    it("should classify tenure <= 15 days as CRITICAL", () => {
      const res = formatRemainingTenure("2026-11-04", "2026-10-30");
      expect(res.urgency).toBe("CRITICAL");
      expect(res.label).toBe("Expiring in 5d");
    });

    it("should classify tenure <= 90 days as UPCOMING", () => {
      const res = formatRemainingTenure("2026-12-15", "2026-10-30");
      expect(res.urgency).toBe("UPCOMING");
      expect(res.label).toBe("46d remaining");
    });

    it("should classify tenure > 90 days as HEALTHY", () => {
      const res = formatRemainingTenure("2034-03-01", "2026-10-30");
      expect(res.urgency).toBe("HEALTHY");
      expect(res.label).toBe("2679d remaining");
    });
  });

  describe("maskSensitiveId", () => {
    it("should mask sensitive account and FDR numbers for auditor privacy", () => {
      const masked = maskSensitiveId("FDR-2024-SBI-88129", 4, 2);
      expect(masked.startsWith("FDR-")).toBe(true);
      expect(masked.endsWith("29")).toBe(true);
      expect(masked).toContain("•");
    });

    it("should preserve short strings that cannot be safely masked", () => {
      expect(maskSensitiveId("1234")).toBe("1234");
    });
  });

  describe("getBankCodeFromIfsc", () => {
    it("should extract 4-character RBI bank code prefix", () => {
      expect(getBankCodeFromIfsc("SBIN0001234")).toBe("SBIN");
      expect(getBankCodeFromIfsc("HDFC0004567")).toBe("HDFC");
      expect(getBankCodeFromIfsc("punb0123400")).toBe("PUNB");
    });

    it("should return empty string for invalid short IFSC", () => {
      expect(getBankCodeFromIfsc("")).toBe("");
      expect(getBankCodeFromIfsc("SB")).toBe("");
    });
  });
});
