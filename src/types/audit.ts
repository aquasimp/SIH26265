import { UserRole } from "./rbac";

export interface AuditLogEntry {
  id: string;
  sequenceNumber: number;
  timestamp: string;
  entityType: "FDR" | "DISCREPANCY" | "RELEASE_REQUEST" | "SYSTEM_SETTING" | "VERIFICATION";
  entityId: string;
  action:
    | "FDR_SUBMITTED"
    | "FDR_SCRUTINIZED"
    | "BANK_VERIFICATION_INITIATED"
    | "BANK_VERIFICATION_CONFIRMED"
    | "BANK_VERIFICATION_MISMATCH"
    | "DISCREPANCY_FLAGGED"
    | "DISCREPANCY_RESOLVED"
    | "RENEWAL_SUBMITTED"
    | "RELEASE_REQUESTED"
    | "RELEASE_RECOMMENDED_BY_RO"
    | "RELEASE_APPROVED_BY_BUREAU_HEAD"
    | "RELEASE_REJECTED"
    | "SYSTEM_SETTINGS_UPDATED";
  actorRole: UserRole;
  actorName: string;
  actorId: string;
  details: string;
  previousHash: string;
  currentHash: string;
  diff?: Record<string, any>;
}

export interface AuditVerificationResult {
  isValid: boolean;
  totalBlocks: number;
  brokenBlockSequence?: number;
  brokenBlockId?: string;
  message: string;
}
