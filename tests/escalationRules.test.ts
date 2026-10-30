import { describe, it, expect } from "vitest";
import { evaluateEscalationTier } from "@/lib/rules/escalationRules";
import { FdrInstrument } from "@/types/fdr";

describe("Alert & Escalation Scheduling Engine", () => {
  const mockFdr = (daysIdle: number, status: FdrInstrument["status"] = "PENDING_VERIFICATION"): FdrInstrument => ({
    id: "fdr-esc",
    institutionId: "inst-1",
    fdrNumber: "FDR-ESC-01",
    bankName: "State Bank of India",
    branchName: "Branch",
    ifscCode: "SBIN0001000",
    amount: 3500000,
    issueDate: "2024-01-01",
    maturityDate: "2034-01-01",
    tenureMonths: 120,
    jointAccountHolder: "Regional Officer, AICTE",
    lienMarked: true,
    status,
    verificationStatus: "VERIFICATION_PENDING",
    attentionScore: 50,
    currentEscalationTier: "SCRUTINY_OFFICER",
    daysIdleInTier: daysIdle,
    lastActionAt: "2026-10-30T00:00:00Z",
    autoRenewEligible: false,
    provenance: {} as any,
    discrepancies: [],
    documents: [],
  });

  it("should keep instrument with Scrutiny Officer during initial 0-4 days", () => {
    const res = evaluateEscalationTier(mockFdr(3));
    expect(res.tier).toBe("SCRUTINY_OFFICER");
    expect(res.isBreached).toBe(false);
  });

  it("should escalate to Regional Officer when idle >= 5 days", () => {
    const res = evaluateEscalationTier(mockFdr(7));
    expect(res.tier).toBe("REGIONAL_OFFICER");
    expect(res.isBreached).toBe(true);
  });

  it("should escalate to Bureau Head when idle >= 10 days", () => {
    const res = evaluateEscalationTier(mockFdr(12));
    expect(res.tier).toBe("BUREAU_HEAD");
    expect(res.isBreached).toBe(true);
  });
});
