import { describe, it, expect } from "vitest";
import { generateSeedData } from "@/lib/store/seedData";
import { getFdrs } from "@/lib/store/db";

describe("FDR Instrument Uniqueness & Cross-Entity Collision Verification", () => {
  const { fdrs, institutions } = generateSeedData();

  it("should have globally unique primary IDs for every instrument", () => {
    const idSet = new Set<string>();
    const duplicateIds: string[] = [];

    fdrs.forEach((fdr) => {
      if (idSet.has(fdr.id)) {
        duplicateIds.push(fdr.id);
      }
      idSet.add(fdr.id);
    });

    expect(duplicateIds).toEqual([]);
    expect(idSet.size).toBe(fdrs.length);
  });

  it("should explicitly identify cross-institutional FDR collisions with distinct institutions", () => {
    // Edge case 3: FDR-2024-COLLISION-991
    const collisions = fdrs.filter((f) => f.fdrNumber === "FDR-2024-COLLISION-991");
    expect(collisions.length).toBe(2);

    // Must belong to two distinct institutions
    const [rowA, rowB] = collisions;
    expect(rowA.institutionId).not.toBe(rowB.institutionId);

    // Each row must carry its distinct institution name and AICTE ID
    expect(rowA.institutionName).toBeDefined();
    expect(rowB.institutionName).toBeDefined();
    expect(rowA.institutionName).not.toBe(rowB.institutionName);
    expect(rowA.institutionAicteId).not.toBe(rowB.institutionAicteId);

    // Both must carry the DUPLICATE_FDR discrepancy flag
    expect(rowA.discrepancies.some((d) => d.ruleCode === "DUPLICATE_FDR")).toBe(true);
    expect(rowB.discrepancies.some((d) => d.ruleCode === "DUPLICATE_FDR")).toBe(true);
  });

  it("should never have unintended identical rows from the same institution", () => {
    const compositeKeys = new Map<string, string>();
    const unintendedDuplicates: string[] = [];

    fdrs.forEach((fdr) => {
      // An institution cannot have two instruments with the exact same FDR number
      const key = `${fdr.institutionId}::${fdr.fdrNumber}`;
      if (compositeKeys.has(key)) {
        unintendedDuplicates.push(key);
      }
      compositeKeys.set(key, fdr.id);
    });

    expect(unintendedDuplicates).toEqual([]);
  });

  it("should attach institution details via getFdrs query engine", () => {
    const allFdrs = getFdrs();
    expect(allFdrs.length).toBeGreaterThan(0);
    allFdrs.forEach((f) => {
      expect(f.institutionName).toBeTruthy();
      expect(f.institutionAicteId).toBeTruthy();
    });
  });
});
