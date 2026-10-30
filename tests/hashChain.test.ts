import { describe, it, expect } from "vitest";
import { calculateBlockHash, verifyAuditChain, GENESIS_HASH } from "@/lib/hashChain";
import { AuditLogEntry } from "@/types/audit";

describe("Tamper-Evident SHA-256 Audit Hash Chain", () => {
  it("should calculate deterministic block hash", () => {
    const hash1 = calculateBlockHash(GENESIS_HASH, 1, "2026-10-30T10:00:00Z", "fdr-1", "FDR_SUBMITTED", "usr-1", "Details");
    const hash2 = calculateBlockHash(GENESIS_HASH, 1, "2026-10-30T10:00:00Z", "fdr-1", "FDR_SUBMITTED", "usr-1", "Details");
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 hex string
  });

  it("should verify intact multi-block chain successfully", () => {
    const action1 = "FDR_SUBMITTED";
    const action2 = "BANK_VERIFICATION_CONFIRMED";
    const block1Hash = calculateBlockHash(GENESIS_HASH, 1, "2026-10-30T10:00:00Z", "fdr-1", action1, "u1", "First");
    const block2Hash = calculateBlockHash(block1Hash, 2, "2026-10-30T11:00:00Z", "fdr-1", action2, "u2", "Second");

    const chain: AuditLogEntry[] = [
      {
        id: "a-1",
        sequenceNumber: 1,
        timestamp: "2026-10-30T10:00:00Z",
        entityType: "FDR",
        entityId: "fdr-1",
        action: action1,
        actorRole: "INSTITUTION_USER",
        actorName: "Principal",
        actorId: "u1",
        details: "First",
        previousHash: GENESIS_HASH,
        currentHash: block1Hash,
      },
      {
        id: "a-2",
        sequenceNumber: 2,
        timestamp: "2026-10-30T11:00:00Z",
        entityType: "FDR",
        entityId: "fdr-1",
        action: action2,
        actorRole: "SCRUTINY_OFFICER",
        actorName: "Scrutiny Off",
        actorId: "u2",
        details: "Second",
        previousHash: block1Hash,
        currentHash: block2Hash,
      },
    ];

    const result = verifyAuditChain(chain);
    expect(result.isValid).toBe(true);
    expect(result.totalBlocks).toBe(2);
  });

  it("should detect tampering if payload or hash is modified retroactively", () => {
    const action1 = "FDR_SUBMITTED";
    const action2 = "BANK_VERIFICATION_CONFIRMED";
    const block1Hash = calculateBlockHash(GENESIS_HASH, 1, "2026-10-30T10:00:00Z", "fdr-1", action1, "u1", "First");
    const block2Hash = calculateBlockHash(block1Hash, 2, "2026-10-30T11:00:00Z", "fdr-1", action2, "u2", "Second");

    const chain: AuditLogEntry[] = [
      {
        id: "a-1",
        sequenceNumber: 1,
        timestamp: "2026-10-30T10:00:00Z",
        entityType: "FDR",
        entityId: "fdr-1",
        action: action1,
        actorRole: "INSTITUTION_USER",
        actorName: "Principal",
        actorId: "u1",
        details: "TAMPERED DETAILS AFTER SIGNING", // altered!
        previousHash: GENESIS_HASH,
        currentHash: block1Hash,
      },
      {
        id: "a-2",
        sequenceNumber: 2,
        timestamp: "2026-10-30T11:00:00Z",
        entityType: "FDR",
        entityId: "fdr-1",
        action: action2,
        actorRole: "SCRUTINY_OFFICER",
        actorName: "Scrutiny Off",
        actorId: "u2",
        details: "Second",
        previousHash: block1Hash,
        currentHash: block2Hash,
      },
    ];

    const result = verifyAuditChain(chain);
    expect(result.isValid).toBe(false);
    expect(result.brokenBlockSequence).toBe(1);
  });
});
