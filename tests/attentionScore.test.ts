import { describe, it, expect } from "vitest";
import { calculateAttentionScore } from "@/lib/rules/attentionScore";
import { FdrInstrument } from "@/types/fdr";

describe("Transparent Attention Score Engine", () => {
  const mockFdr = (overrides: Partial<FdrInstrument> = {}): FdrInstrument => ({
    id: "fdr-score-test",
    institutionId: "inst-1",
    fdrNumber: "FDR-TEST",
    bankName: "State Bank of India",
    branchName: "Main",
    ifscCode: "SBIN0001000",
    amount: 3500000,
    issueDate: "2016-10-01",
    maturityDate: "2036-10-01", // 10 years in future
    tenureMonths: 120,
    jointAccountHolder: "Regional Officer, AICTE",
    lienMarked: true,
    status: "ACTIVE",
    verificationStatus: "BANK_CONFIRMED",
    attentionScore: 0,
    currentEscalationTier: "SCRUTINY_OFFICER",
    daysIdleInTier: 0,
    lastActionAt: "2026-10-30T00:00:00Z",
    autoRenewEligible: false,
    provenance: {} as any,
    discrepancies: [],
    documents: [],
    ...overrides,
  });

  it("should score healthy, long-horizon verified instrument near 0 (LOW risk)", () => {
    const res = calculateAttentionScore(mockFdr());
    expect(res.totalScore).toBe(0);
    expect(res.riskTier).toBe("LOW");
  });

  it("should elevate score when maturity is critically approaching <= 7 days", () => {
    // 5 days from today
    const inFiveDays = new Date();
    inFiveDays.setDate(inFiveDays.getDate() + 5);
    const res = calculateAttentionScore(mockFdr({ maturityDate: inFiveDays.toISOString().split("T")[0] }));
    expect(res.maturityScore.points).toBeGreaterThanOrEqual(30);
    expect(res.totalScore).toBeGreaterThanOrEqual(30);
  });

  it("should allocate maximum 30 points for open CRITICAL discrepancy", () => {
    const fdr = mockFdr({
      discrepancies: [
        {
          id: "flag-1",
          fdrId: "fdr-1",
          ruleCode: "BANK_IFSC_MISMATCH",
          severity: "CRITICAL",
          title: "Mismatch",
          reason: "Bank code conflict",
          evidence: {},
          resolved: false,
          createdAt: "2026-10-30T00:00:00Z",
        },
      ],
    });
    const res = calculateAttentionScore(fdr);
    expect(res.discrepancyScore.points).toBe(30);
  });

  it("should cap max total score at 100", () => {
    // All bad conditions: overdue, critical flag, mismatch, matured
    const past = new Date();
    past.setDate(past.getDate() - 30);
    const fdr = mockFdr({
      maturityDate: past.toISOString().split("T")[0],
      status: "MATURED",
      verificationStatus: "MISMATCH",
      discrepancies: [
        {
          id: "flag-1",
          fdrId: "fdr-1",
          ruleCode: "DUPLICATE_FDR",
          severity: "CRITICAL",
          title: "Duplicate",
          reason: "Collision",
          evidence: {},
          resolved: false,
          createdAt: "2026-10-30T00:00:00Z",
        },
      ],
    });
    const res = calculateAttentionScore(fdr);
    expect(res.totalScore).toBe(100);
    expect(res.riskTier).toBe("CRITICAL");
  });
});

