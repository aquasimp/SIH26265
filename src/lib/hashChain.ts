import crypto from "crypto";
import { AuditLogEntry, AuditVerificationResult } from "@/types/audit";

export const GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

/**
 * Compute deterministic SHA-256 hash for an audit block
 */
export function calculateBlockHash(
  previousHash: string,
  sequenceNumber: number,
  timestamp: string,
  entityId: string,
  action: string,
  actorId: string,
  details: string,
  diffPayload?: Record<string, any>
): string {
  const serialized = [
    previousHash,
    sequenceNumber.toString(),
    timestamp,
    entityId,
    action,
    actorId,
    details,
    diffPayload ? JSON.stringify(diffPayload) : "",
  ].join("|");

  return crypto.createHash("sha256").update(serialized, "utf8").digest("hex");
}

/**
 * Validate an entire chain of audit log entries for cryptographic integrity
 */
export function verifyAuditChain(chain: AuditLogEntry[]): AuditVerificationResult {
  if (!chain || chain.length === 0) {
    return {
      isValid: true,
      totalBlocks: 0,
      message: "Audit chain is empty. Genesis state maintained.",
    };
  }

  for (let i = 0; i < chain.length; i++) {
    const block = chain[i];
    const expectedPreviousHash = i === 0 ? GENESIS_HASH : chain[i - 1].currentHash;

    if (block.previousHash !== expectedPreviousHash) {
      return {
        isValid: false,
        totalBlocks: chain.length,
        brokenBlockSequence: block.sequenceNumber,
        brokenBlockId: block.id,
        message: `Cryptographic break detected at block sequence #${block.sequenceNumber}. Previous hash mismatch.`,
      };
    }

    const calculatedCurrentHash = calculateBlockHash(
      block.previousHash,
      block.sequenceNumber,
      block.timestamp,
      block.entityId,
      block.action,
      block.actorId,
      block.details,
      block.diff
    );

    if (calculatedCurrentHash !== block.currentHash) {
      return {
        isValid: false,
        totalBlocks: chain.length,
        brokenBlockSequence: block.sequenceNumber,
        brokenBlockId: block.id,
        message: `Cryptographic tamper detected at block sequence #${block.sequenceNumber}. Stored hash diverges from block contents.`,
      };
    }
  }

  return {
    isValid: true,
    totalBlocks: chain.length,
    message: `Cryptographic integrity confirmed. All ${chain.length} blocks sequentially sealed with SHA-256.`,
  };
}
