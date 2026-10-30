import { describe, it, expect, beforeEach } from "vitest";
import {
  getFdrById,
  requestRelease,
  recommendReleaseByRo,
  approveReleaseByBureauHead,
  resolveDiscrepancy,
  resetStore,
} from "@/lib/store/db";
import { DEMO_USERS } from "@/types/rbac";

describe("Hard Release & Refund Governance Gate", () => {
  beforeEach(() => {
    resetStore();
  });

  it("should HARD BLOCK release request when open discrepancies exist", () => {
    // fdr-ec-05-release-blocked has an open LIEN_NOT_MARKED discrepancy
    const blockedFdr = getFdrById("fdr-ec-05-release-blocked")!;
    expect(blockedFdr).toBeDefined();

    expect(() => {
      requestRelease(
        blockedFdr.id,
        "Tenure over, please release",
        DEMO_USERS.INSTITUTION_USER
      );
    }).toThrow(/RELEASE BLOCKED/i);
  });

  it("should allow release workflow progression once discrepancies are resolved", () => {
    const blockedFdr = getFdrById("fdr-ec-05-release-blocked")!;
    const flag = blockedFdr.discrepancies.find((d) => !d.resolved)!;

    // Resolve the discrepancy with officer justification
    resolveDiscrepancy(
      blockedFdr.id,
      flag.id,
      "Bank provided certified lien rectification letter",
      DEMO_USERS.SCRUTINY_OFFICER
    );

    // Now request release
    const updated = requestRelease(
      blockedFdr.id,
      "Tenure completed, requesting deposit refund",
      DEMO_USERS.INSTITUTION_USER
    );
    expect(updated.status).toBe("RELEASE_REQUESTED");

    // Regional Officer recommendation
    const recommended = recommendReleaseByRo(
      blockedFdr.id,
      "Campus inspection verified, recommended",
      DEMO_USERS.REGIONAL_OFFICER
    );
    expect(recommended.status).toBe("RELEASE_RECOMMENDED");

    // Bureau Head approval
    const approved = approveReleaseByBureauHead(
      blockedFdr.id,
      "AICTE/REG/2026/REL-9912",
      "Sanctioned as per regulations",
      DEMO_USERS.BUREAU_HEAD
    );
    expect(approved.status).toBe("RELEASED");
    expect(approved.releaseRequest?.bureauApprovalOrderNo).toBe("AICTE/REG/2026/REL-9912");
  });

  it("should reject non-Bureau Head role attempting to approve release", () => {
    const readyFdr = getFdrById("fdr-ec-06-release-ready")!;
    expect(readyFdr.status).toBe("RELEASE_RECOMMENDED");

    // Scrutiny officer tries to execute final release
    expect(() => {
      approveReleaseByBureauHead(
        readyFdr.id,
        "ORDER-123",
        "Note",
        DEMO_USERS.SCRUTINY_OFFICER // Not Bureau Head!
      );
    }).toThrow(/PERMISSION DENIED/i);
  });
});

