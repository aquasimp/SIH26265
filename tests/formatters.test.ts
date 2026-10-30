import { describe, it, expect } from "vitest";
import {
  formatIndianCurrency,
  formatIndianDate,
  getDaysRemaining,
  formatRemainingTenure,
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

    it("should handle invalid or null dates gracefully", () => {
      expect(formatIndianDate(null)).toBe("—");
      expect(formatIndianDate(undefined)).toBe("—");
      expect(formatIndianDate("invalid-date")).toBe("—");
    });
  });

  describe("getDaysRemaining & formatRemainingTenure", () => {
    it("should compute exact whole calendar days difference", () => {
      const base = "2026-10-30";
      const target = "2026-11-04"; // 5 days later
      expect(getDaysRemaining(target, base)).toBe(5);
    });

    it("should classify overdue past dates as EXPIRED", () => {
      const past = new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString().split("T")[0];
      const res = formatRemainingTenure(past);
      expect(res.urgency).toBe("EXPIRED");
      expect(res.label).toContain("Matured");
    });

    it("should classify tenure <= 15 days as CRITICAL", () => {
      const near = new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split("T")[0];
      const res = formatRemainingTenure(near);
      expect(res.urgency).toBe("CRITICAL");
      expect(res.label).toContain("Expiring in");
    });

    it("should classify tenure <= 90 days as UPCOMING", () => {
      const upcoming = new Date(Date.now() + 45 * 24 * 3600 * 1000).toISOString().split("T")[0];
      const res = formatRemainingTenure(upcoming);
      expect(res.urgency).toBe("UPCOMING");
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

