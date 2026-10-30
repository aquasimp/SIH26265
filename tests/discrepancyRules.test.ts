import { describe, it, expect } from "vitest";
import { evaluateDiscrepancies } from "@/lib/rules/discrepancyRules";
import { FdrInstrument } from "@/types/fdr";

describe("Discrepancy Rules Engine", () => {
  const baseFdr: FdrInstrument = {
    id: "test-fdr-1",
    institutionId: "inst-1",
    fdrNumber: "FDR-2024-TEST-001",
    bankName: "State Bank of India",
    branchName: "Industrial Finance",
    ifscCode: "SBIN0004123",
    amount: 3500000,
    issueDate: "2024-01-01",
    maturityDate: "2034-01-01",
    tenureMonths: 120,
    jointAccountHolder: "Regional Officer, AICTE",
    lienMarked: true,
    status: "ACTIVE",
    verificationStatus: "BANK_CONFIRMED",
    attentionScore: 10,
    currentEscalationTier: "SCRUTINY_OFFICER",
    daysIdleInTier: 0,
    lastActionAt: "2024-01-01T00:00:00Z",
    autoRenewEligible: false,
    provenance: {
      fdrNumber: { declared: "FDR-2024-TEST-001", matchStatus: "MATCH", source: "INSTITUTION_DECLARED" },
      bankName: { declared: "State Bank of India", matchStatus: "MATCH", source: "INSTITUTION_DECLARED" },
      branchName: { declared: "Industrial Finance", matchStatus: "MATCH", source: "INSTITUTION_DECLARED" },
      ifscCode: { declared: "SBIN0004123", matchStatus: "MATCH", source: "INSTITUTION_DECLARED" },
      amount: { declared: 3500000, matchStatus: "MATCH", source: "INSTITUTION_DECLARED" },
      issueDate: { declared: "2024-01-01", matchStatus: "MATCH", source: "INSTITUTION_DECLARED" },
      maturityDate: { declared: "2034-01-01", matchStatus: "MATCH", source: "INSTITUTION_DECLARED" },
      lienMarked: { declared: true, matchStatus: "MATCH", source: "INSTITUTION_DECLARED" },
      jointAccountHolder: { declared: "Regional Officer, AICTE", matchStatus: "MATCH", source: "INSTITUTION_DECLARED" },
    },
    discrepancies: [],
    documents: [],
  };

  it("should pass clean authentic instrument with 0 flags", () => {
    const flags = evaluateDiscrepancies(baseFdr);
    expect(flags.length).toBe(0);
  });

  it("should trigger MISSING_FIELDS when mandatory parameters are empty", () => {
    const broken = { ...baseFdr, ifscCode: "", fdrNumber: "" };
    const flags = evaluateDiscrepancies(broken);
    expect(flags.some((f) => f.ruleCode === "MISSING_FIELDS")).toBe(true);
    expect(flags.find((f) => f.ruleCode === "MISSING_FIELDS")?.severity).toBe("CRITICAL");
  });

  it("should trigger MATURITY_BEFORE_ISSUE when temporal inversion occurs", () => {
    const inverted = { ...baseFdr, issueDate: "2026-05-01", maturityDate: "2024-05-01" };
    const flags = evaluateDiscrepancies(inverted);
    expect(flags.some((f) => f.ruleCode === "MATURITY_BEFORE_ISSUE")).toBe(true);
  });

  it("should trigger BANK_IFSC_MISMATCH when bank name conflicts with IFSC prefix", () => {
    const mismatch = { ...baseFdr, bankName: "State Bank of India", ifscCode: "HDFC0001234" };
    const flags = evaluateDiscrepancies(mismatch);
    expect(flags.some((f) => f.ruleCode === "BANK_IFSC_MISMATCH")).toBe(true);
  });

  it("should trigger LIEN_NOT_MARKED when lien is false", () => {
    const unpledged = { ...baseFdr, lienMarked: false };
    const flags = evaluateDiscrepancies(unpledged);
    expect(flags.some((f) => f.ruleCode === "LIEN_NOT_MARKED")).toBe(true);
  });

  it("should trigger DUPLICATE_FDR when another institution pledges same number & bank", () => {
    const existing: FdrInstrument = {
      ...baseFdr,
      id: "other-fdr",
      institutionId: "inst-99",
      fdrNumber: "FDR-2024-TEST-001",
    };
    const flags = evaluateDiscrepancies(baseFdr, { allFdrs: [existing] });
    expect(flags.some((f) => f.ruleCode === "DUPLICATE_FDR")).toBe(true);
  });
});

