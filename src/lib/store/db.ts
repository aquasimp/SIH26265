import { FdrInstrument, Institution, ReleaseRequest, FdrStatus } from "@/types/fdr";
import { AuditLogEntry, AuditVerificationResult } from "@/types/audit";
import { generateSeedData } from "./seedData";
import { evaluateDiscrepancies } from "../rules/discrepancyRules";
import { calculateAttentionScore } from "../rules/attentionScore";
import { calculateBlockHash, verifyAuditChain } from "../hashChain";
import { queryMockBankVerification } from "../mockBankService";
import { UserSession } from "@/types/rbac";

// Global in-memory singleton preserving state across requests during dev and serverless runtime
interface InMemoryStore {
  institutions: Institution[];
  fdrs: FdrInstrument[];
  auditLogs: AuditLogEntry[];
  currentChainHash: string;
  isInitialized: boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var __aicte_store: InMemoryStore | undefined;
}

function initializeStore(): InMemoryStore {
  if (global.__aicte_store && global.__aicte_store.isInitialized) {
    return global.__aicte_store;
  }

  const { institutions, fdrs, auditLogs } = generateSeedData();
  const lastHash = auditLogs.length > 0 ? auditLogs[auditLogs.length - 1].currentHash : "0".repeat(64);

  const store: InMemoryStore = {
    institutions,
    fdrs,
    auditLogs,
    currentChainHash: lastHash,
    isInitialized: true,
  };

  global.__aicte_store = store;
  return store;
}

const store = initializeStore();

export function getStore(): InMemoryStore {
  return store;
}

export function resetStore(): void {
  const { institutions, fdrs, auditLogs } = generateSeedData();
  store.institutions = institutions;
  store.fdrs = fdrs;
  store.auditLogs = auditLogs;
  store.currentChainHash = auditLogs.length > 0 ? auditLogs[auditLogs.length - 1].currentHash : "0".repeat(64);
}

// ----------------------------------------------------------------------------
// Audit Helper
// ----------------------------------------------------------------------------
function recordAudit(
  entityId: string,
  action: AuditLogEntry["action"],
  actor: UserSession,
  details: string,
  diff?: Record<string, any>
): AuditLogEntry {
  const seq = store.auditLogs.length + 1;
  const timestamp = new Date().toISOString();
  const blockHash = calculateBlockHash(
    store.currentChainHash,
    seq,
    timestamp,
    entityId,
    action,
    actor.id,
    details,
    diff
  );

  const entry: AuditLogEntry = {
    id: `audit-${seq.toString().padStart(5, "0")}`,
    sequenceNumber: seq,
    timestamp,
    entityType: "FDR",
    entityId,
    action,
    actorRole: actor.role,
    actorName: actor.name,
    actorId: actor.id,
    details,
    previousHash: store.currentChainHash,
    currentHash: blockHash,
    diff,
  };

  store.currentChainHash = blockHash;
  store.auditLogs.push(entry);
  return entry;
}

// ----------------------------------------------------------------------------
// Institution Queries
// ----------------------------------------------------------------------------
export function getInstitutions(searchTerm?: string): Institution[] {
  if (!searchTerm) return store.institutions;
  const clean = searchTerm.toLowerCase();
  return store.institutions.filter(
    (i) =>
      i.name.toLowerCase().includes(clean) ||
      i.aicteId.toLowerCase().includes(clean) ||
      i.state.toLowerCase().includes(clean)
  );
}

export function getInstitutionById(id: string): Institution | undefined {
  return store.institutions.find((i) => i.id === id);
}

// ----------------------------------------------------------------------------
// FDR Queries & Filters
// ----------------------------------------------------------------------------
export interface FdrFilterParams {
  region?: string;
  bank?: string;
  status?: string;
  hasDiscrepancy?: boolean;
  institutionId?: string;
  search?: string;
  minAttentionScore?: number;
}

export function getFdrs(filters: FdrFilterParams = {}): FdrInstrument[] {
  let results = store.fdrs;

  if (filters.institutionId) {
    results = results.filter((f) => f.institutionId === filters.institutionId);
  }

  if (filters.region && filters.region !== "ALL") {
    const instIdsInRegion = new Set(
      store.institutions.filter((i) => i.region === filters.region).map((i) => i.id)
    );
    results = results.filter((f) => instIdsInRegion.has(f.institutionId));
  }

  if (filters.bank && filters.bank !== "ALL") {
    results = results.filter((f) => f.bankName === filters.bank);
  }

  if (filters.status && filters.status !== "ALL") {
    results = results.filter((f) => f.status === filters.status);
  }

  if (filters.hasDiscrepancy !== undefined) {
    results = results.filter((f) =>
      filters.hasDiscrepancy
        ? (f.discrepancies || []).some((d) => !d.resolved)
        : (f.discrepancies || []).every((d) => d.resolved)
    );
  }

  if (filters.minAttentionScore !== undefined) {
    results = results.filter((f) => f.attentionScore >= filters.minAttentionScore!);
  }

  if (filters.search) {
    const clean = filters.search.toLowerCase();
    results = results.filter((f) => {
      const inst = store.institutions.find((i) => i.id === f.institutionId);
      return (
        f.fdrNumber.toLowerCase().includes(clean) ||
        f.bankName.toLowerCase().includes(clean) ||
        f.ifscCode.toLowerCase().includes(clean) ||
        (inst && inst.name.toLowerCase().includes(clean)) ||
        (inst && inst.aicteId.toLowerCase().includes(clean))
      );
    });
  }

  const instMap = new Map(store.institutions.map((i) => [i.id, i]));
  return results.map((fdr) => {
    const inst = instMap.get(fdr.institutionId);
    return {
      ...fdr,
      institutionName: fdr.institutionName || inst?.name,
      institutionAicteId: fdr.institutionAicteId || inst?.aicteId,
      institutionRegion: fdr.institutionRegion || inst?.region,
    };
  });
}

export function getFdrById(id: string): FdrInstrument | undefined {
  const fdr = store.fdrs.find((f) => f.id === id);
  if (!fdr) return undefined;
  const inst = store.institutions.find((i) => i.id === fdr.institutionId);
  return {
    ...fdr,
    institutionName: fdr.institutionName || inst?.name,
    institutionAicteId: fdr.institutionAicteId || inst?.aicteId,
    institutionRegion: fdr.institutionRegion || inst?.region,
  };
}

// ----------------------------------------------------------------------------
// FDR Actions: Create / Submit
// ----------------------------------------------------------------------------
export function createFdr(
  data: Partial<FdrInstrument> & { institutionId: string },
  actor: UserSession
): FdrInstrument {
  const id = `fdr-${Date.now().toString().slice(-6)}`;
  const now = new Date().toISOString();

  const newInstrument: FdrInstrument = {
    id,
    institutionId: data.institutionId,
    fdrNumber: data.fdrNumber || `FDR-${Date.now()}`,
    bankName: data.bankName || "State Bank of India",
    branchName: data.branchName || "Main Branch",
    ifscCode: data.ifscCode || "SBIN0001000",
    amount: data.amount || 3500000,
    issueDate: data.issueDate || now.split("T")[0],
    maturityDate: data.maturityDate || now.split("T")[0],
    tenureMonths: data.tenureMonths || 120,
    jointAccountHolder: data.jointAccountHolder || "Regional Officer, AICTE",
    lienMarked: data.lienMarked ?? true,
    status: "SUBMITTED",
    verificationStatus: "VERIFICATION_PENDING",
    attentionScore: 50,
    currentEscalationTier: "SCRUTINY_OFFICER",
    daysIdleInTier: 0,
    lastActionAt: now,
    autoRenewEligible: false,
    provenance: {
      fdrNumber: { declared: data.fdrNumber || "", matchStatus: "UNVERIFIED", source: "INSTITUTION_DECLARED" },
      bankName: { declared: data.bankName || "", matchStatus: "UNVERIFIED", source: "INSTITUTION_DECLARED" },
      branchName: { declared: data.branchName || "", matchStatus: "UNVERIFIED", source: "INSTITUTION_DECLARED" },
      ifscCode: { declared: data.ifscCode || "", matchStatus: "UNVERIFIED", source: "INSTITUTION_DECLARED" },
      amount: { declared: data.amount || 0, matchStatus: "UNVERIFIED", source: "INSTITUTION_DECLARED" },
      issueDate: { declared: data.issueDate || "", matchStatus: "UNVERIFIED", source: "INSTITUTION_DECLARED" },
      maturityDate: { declared: data.maturityDate || "", matchStatus: "UNVERIFIED", source: "INSTITUTION_DECLARED" },
      lienMarked: { declared: data.lienMarked ?? true, matchStatus: "UNVERIFIED", source: "INSTITUTION_DECLARED" },
      jointAccountHolder: { declared: data.jointAccountHolder || "", matchStatus: "UNVERIFIED", source: "INSTITUTION_DECLARED" },
    },
    discrepancies: [],
    documents: data.documents || [],
  };

  // Run discrepancy check against existing repository
  const inst = getInstitutionById(data.institutionId);
  const flags = evaluateDiscrepancies(newInstrument, {
    allFdrs: store.fdrs,
    discipline: inst?.category,
  });
  newInstrument.discrepancies = flags;

  if (flags.some((f) => f.severity === "CRITICAL")) {
    newInstrument.status = "DEFICIENT";
  }

  // Calculate attention score
  const scoreBreakdown = calculateAttentionScore(newInstrument);
  newInstrument.attentionScore = scoreBreakdown.totalScore;

  store.fdrs.unshift(newInstrument);

  recordAudit(
    newInstrument.id,
    "FDR_SUBMITTED",
    actor,
    `New term deposit instrument ${newInstrument.fdrNumber} submitted for ${inst?.name || "Institution"}. Principal: INR ${newInstrument.amount.toLocaleString("en-IN")}.`,
    { after: { fdrNumber: newInstrument.fdrNumber, amount: newInstrument.amount } }
  );

  return newInstrument;
}

// ----------------------------------------------------------------------------
// FDR Actions: Mock Bank Verification
// ----------------------------------------------------------------------------
export async function verifyFdrWithBank(
  fdrId: string,
  actor: UserSession
): Promise<{ fdr: FdrInstrument; discrepanciesCount: number }> {
  const fdr = getFdrById(fdrId);
  if (!fdr) throw new Error(`FDR record not found: ${fdrId}`);

  const mockResponse = await queryMockBankVerification({
    fdrNumber: fdr.fdrNumber,
    bankName: fdr.bankName,
    ifscCode: fdr.ifscCode,
    amount: fdr.amount,
  });

  const now = new Date().toISOString();
  fdr.lastActionAt = now;

  // Update Provenance with Core Banking Confirmed values
  fdr.provenance.fdrNumber.confirmed = mockResponse.fdrNumber;
  fdr.provenance.fdrNumber.matchStatus = mockResponse.fdrNumber === fdr.fdrNumber ? "MATCH" : "MISMATCH";
  fdr.provenance.fdrNumber.confirmedAt = now;

  fdr.provenance.bankName.confirmed = mockResponse.bankName;
  fdr.provenance.bankName.matchStatus = mockResponse.bankName === fdr.bankName ? "MATCH" : "MISMATCH";
  fdr.provenance.bankName.confirmedAt = now;

  fdr.provenance.branchName.confirmed = mockResponse.branchName;
  fdr.provenance.branchName.matchStatus = "MATCH";
  fdr.provenance.branchName.confirmedAt = now;

  fdr.provenance.ifscCode.confirmed = mockResponse.ifscCode;
  fdr.provenance.ifscCode.matchStatus = mockResponse.ifscCode === fdr.ifscCode ? "MATCH" : "MISMATCH";
  fdr.provenance.ifscCode.confirmedAt = now;

  fdr.provenance.amount.confirmed = mockResponse.depositAmount;
  fdr.provenance.amount.matchStatus = Math.abs(mockResponse.depositAmount - fdr.amount) < 0.01 ? "MATCH" : "MISMATCH";
  fdr.provenance.amount.confirmedAt = now;

  fdr.provenance.lienMarked.confirmed = mockResponse.lienMarked;
  fdr.provenance.lienMarked.matchStatus = mockResponse.lienMarked ? "MATCH" : "MISMATCH";
  fdr.provenance.lienMarked.confirmedAt = now;

  // Re-evaluate discrepancies
  const inst = getInstitutionById(fdr.institutionId);
  const flags = evaluateDiscrepancies(fdr, {
    allFdrs: store.fdrs,
    discipline: inst?.category,
  });
  fdr.discrepancies = flags;

  if (flags.some((f) => f.severity === "CRITICAL" && !f.resolved)) {
    fdr.status = "DEFICIENT";
    fdr.verificationStatus = "MISMATCH";
    recordAudit(
      fdr.id,
      "BANK_VERIFICATION_MISMATCH",
      actor,
      `Core banking verification returned discrepancies for ${fdr.fdrNumber}. Ref: ${mockResponse.cbsTransactionRef}`,
      { diff: { discrepancies: flags.map((f) => f.ruleCode) } }
    );
  } else {
    fdr.status = "ACTIVE";
    fdr.verificationStatus = "BANK_CONFIRMED";
    recordAudit(
      fdr.id,
      "BANK_VERIFICATION_CONFIRMED",
      actor,
      `Core banking verification confirmed instrument authenticity. CBS Ref: ${mockResponse.cbsTransactionRef}`,
      { confirmedAmount: mockResponse.depositAmount, lienMarked: mockResponse.lienMarked }
    );
  }

  // Update Attention Score
  const scoreBreakdown = calculateAttentionScore(fdr);
  fdr.attentionScore = scoreBreakdown.totalScore;

  return { fdr, discrepanciesCount: flags.filter((f) => !f.resolved).length };
}

// ----------------------------------------------------------------------------
// FDR Actions: Discrepancy Resolution
// ----------------------------------------------------------------------------
export function resolveDiscrepancy(
  fdrId: string,
  flagId: string,
  resolutionNote: string,
  actor: UserSession
): FdrInstrument {
  const fdr = getFdrById(fdrId);
  if (!fdr) throw new Error(`FDR record not found: ${fdrId}`);

  const flag = (fdr.discrepancies || []).find((d) => d.id === flagId);
  if (!flag) throw new Error(`Discrepancy flag not found: ${flagId}`);

  flag.resolved = true;
  flag.resolvedBy = actor.name;
  flag.resolvedAt = new Date().toISOString();
  flag.resolutionNote = resolutionNote;

  // If no remaining critical discrepancies, restore status
  const remainingCritical = (fdr.discrepancies || []).filter((d) => !d.resolved && d.severity === "CRITICAL");
  if (remainingCritical.length === 0 && fdr.status === "DEFICIENT") {
    fdr.status = fdr.verificationStatus === "BANK_CONFIRMED" ? "ACTIVE" : "PENDING_VERIFICATION";
  }

  // Re-calculate attention score
  const scoreBreakdown = calculateAttentionScore(fdr);
  fdr.attentionScore = scoreBreakdown.totalScore;

  recordAudit(
    fdr.id,
    "DISCREPANCY_RESOLVED",
    actor,
    `Discrepancy "${flag.title}" (${flag.ruleCode}) resolved by ${actor.role}. Note: ${resolutionNote}`,
    { flagId, ruleCode: flag.ruleCode, resolutionNote }
  );

  return fdr;
}

// ----------------------------------------------------------------------------
// FDR Actions: Renewal Submission
// ----------------------------------------------------------------------------
export function submitRenewal(
  oldFdrId: string,
  newFdrData: Partial<FdrInstrument>,
  actor: UserSession
): { oldFdr: FdrInstrument; renewalFdr: FdrInstrument } {
  const oldFdr = getFdrById(oldFdrId);
  if (!oldFdr) throw new Error(`FDR record not found: ${oldFdrId}`);

  // Create new renewal instrument
  const renewalFdr = createFdr(
    {
      ...newFdrData,
      institutionId: oldFdr.institutionId,
      replacesFdrId: oldFdr.id,
      amount: newFdrData.amount || oldFdr.amount,
      jointAccountHolder: oldFdr.jointAccountHolder,
    },
    actor
  );

  // Link old FDR
  oldFdr.status = "RENEWED";
  oldFdr.replacedByFdrId = renewalFdr.id;
  oldFdr.attentionScore = 0; // Settled

  recordAudit(
    oldFdr.id,
    "RENEWAL_SUBMITTED",
    actor,
    `Matured instrument ${oldFdr.fdrNumber} replaced by new renewal certificate ${renewalFdr.fdrNumber}.`,
    { oldFdrId: oldFdr.id, newFdrId: renewalFdr.id }
  );

  return { oldFdr, renewalFdr };
}

// ----------------------------------------------------------------------------
// FDR Actions: Release & Refund Governance (Hard gate on discrepancies)
// ----------------------------------------------------------------------------
export function requestRelease(
  fdrId: string,
  justification: string,
  actor: UserSession
): FdrInstrument {
  const fdr = getFdrById(fdrId);
  if (!fdr) throw new Error(`FDR record not found: ${fdrId}`);

  // Hard Rule Check: Cannot request release if open discrepancies exist
  const openFlags = (fdr.discrepancies || []).filter((d) => !d.resolved);
  if (openFlags.length > 0) {
    throw new Error(
      `RELEASE BLOCKED: Cannot initiate release while ${openFlags.length} discrepancy flag(s) remain open. All observations must be resolved first.`
    );
  }

  const releaseReq: ReleaseRequest = {
    id: `rel-${Date.now().toString().slice(-6)}`,
    fdrId: fdr.id,
    requestedAt: new Date().toISOString(),
    requestedBy: actor.name,
    applicantJustification: justification,
    status: "SUBMITTED",
  };

  fdr.releaseRequest = releaseReq;
  fdr.status = "RELEASE_REQUESTED";

  recordAudit(
    fdr.id,
    "RELEASE_REQUESTED",
    actor,
    `Institution initiated security deposit release request. Justification: ${justification}`,
    { justification }
  );

  return fdr;
}

export function recommendReleaseByRo(
  fdrId: string,
  recommendationNote: string,
  actor: UserSession
): FdrInstrument {
  const fdr = getFdrById(fdrId);
  if (!fdr || !fdr.releaseRequest) throw new Error(`Active release request not found for FDR: ${fdrId}`);

  // Hard Rule Check
  const openFlags = (fdr.discrepancies || []).filter((d) => !d.resolved);
  if (openFlags.length > 0) {
    throw new Error(`RELEASE BLOCKED: Cannot recommend release with open discrepancies.`);
  }

  const now = new Date().toISOString();
  fdr.releaseRequest.status = "RO_RECOMMENDED";
  fdr.releaseRequest.roRecommendationNote = recommendationNote;
  fdr.releaseRequest.roRecommendedAt = now;
  fdr.releaseRequest.roRecommendedBy = actor.name;
  fdr.status = "RELEASE_RECOMMENDED";

  recordAudit(
    fdr.id,
    "RELEASE_RECOMMENDED_BY_RO",
    actor,
    `Regional Officer ${actor.name} endorsed release request. Scrutiny note: ${recommendationNote}`,
    { recommendationNote }
  );

  return fdr;
}

export function approveReleaseByBureauHead(
  fdrId: string,
  approvalOrderNo: string,
  approvalNote: string,
  actor: UserSession
): FdrInstrument {
  const fdr = getFdrById(fdrId);
  if (!fdr || !fdr.releaseRequest) throw new Error(`Active release request not found for FDR: ${fdrId}`);

  // Strict RBAC: Only BUREAU_HEAD can approve
  if (actor.role !== "BUREAU_HEAD") {
    throw new Error("PERMISSION DENIED: Only Competent Authority (Bureau Head) can sanction final deposit release.");
  }

  // Hard Rule Check
  const openFlags = (fdr.discrepancies || []).filter((d) => !d.resolved);
  if (openFlags.length > 0) {
    throw new Error(`RELEASE BLOCKED: Cannot execute release with open discrepancies.`);
  }

  const now = new Date().toISOString();
  fdr.releaseRequest.status = "BUREAU_APPROVED";
  fdr.releaseRequest.bureauApprovalOrderNo = approvalOrderNo;
  fdr.releaseRequest.bureauApprovalNote = approvalNote;
  fdr.releaseRequest.bureauApprovedAt = now;
  fdr.releaseRequest.bureauApprovedBy = actor.name;
  fdr.status = "RELEASED";
  fdr.attentionScore = 0; // Settled

  recordAudit(
    fdr.id,
    "RELEASE_APPROVED_BY_BUREAU_HEAD",
    actor,
    `Final deposit discharge sanctioned by Bureau Head ${actor.name}. AICTE Sanction Order No: ${approvalOrderNo}`,
    { approvalOrderNo, approvalNote }
  );

  return fdr;
}

// ----------------------------------------------------------------------------
// Audit Trail & Cryptographic Verification
// ----------------------------------------------------------------------------
export function getAuditTrail(limit = 100): AuditLogEntry[] {
  return [...store.auditLogs].reverse().slice(0, limit);
}

export function verifyAuditIntegrity(): AuditVerificationResult {
  return verifyAuditChain(store.auditLogs);
}

// ----------------------------------------------------------------------------
// Analytics & Metrics (Simulated from synthetic dataset)
// ----------------------------------------------------------------------------
export function getKpiMetrics() {
  const all = store.fdrs;
  const activeCount = all.filter((f) => f.status === "ACTIVE").length;
  const expiringCount = all.filter((f) => f.status === "EXPIRING").length;
  const maturedCount = all.filter((f) => f.status === "MATURED").length;
  const renewedCount = all.filter((f) => f.status === "RENEWED").length;
  const releasedCount = all.filter((f) => f.status === "RELEASED").length;
  const deficientCount = all.filter((f) => f.status === "DEFICIENT").length;
  const pendingCount = all.filter((f) => f.status === "PENDING_VERIFICATION" || f.status === "SUBMITTED").length;

  const totalDepositSum = all.reduce((acc, f) => acc + f.amount, 0);
  const activeDepositSum = all
    .filter((f) => f.status === "ACTIVE" || f.status === "EXPIRING")
    .reduce((acc, f) => acc + f.amount, 0);

  const openDiscrepancies = all.reduce(
    (acc, f) => acc + (f.discrepancies || []).filter((d) => !d.resolved).length,
    0
  );

  return {
    totalInstruments: all.length,
    activeCount,
    expiringCount,
    maturedCount,
    renewedCount,
    releasedCount,
    deficientCount,
    pendingCount,
    totalDepositSum,
    activeDepositSum,
    openDiscrepancies,
  };
}

export function getMaturityLadder() {
  // Aggregate maturities by month across next 12 months
  const monthsMap: Record<string, { month: string; activeSum: number; expiringCount: number }> = {};
  const now = new Date("2026-10-30T10:00:00Z");

  for (let i = 0; i < 12; i++) {
    const d = new Date(now);
    d.setMonth(d.getMonth() + i);
    const key = `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear().toString().slice(-2)}`;
    monthsMap[key] = { month: key, activeSum: 0, expiringCount: 0 };
  }

  store.fdrs.forEach((f) => {
    if (!f.maturityDate) return;
    const mDate = new Date(f.maturityDate);
    const key = `${mDate.toLocaleString("default", { month: "short" })} ${mDate.getFullYear().toString().slice(-2)}`;
    if (monthsMap[key]) {
      monthsMap[key].activeSum += f.amount;
      monthsMap[key].expiringCount += 1;
    }
  });

  return Object.values(monthsMap);
}
