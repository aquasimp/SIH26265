import { DiscrepancyFlag } from "./discrepancy";

export type FdrStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "PENDING_VERIFICATION"
  | "ACTIVE"
  | "EXPIRING"
  | "MATURED"
  | "RENEWAL_SUBMITTED"
  | "RENEWED"
  | "RELEASE_REQUESTED"
  | "RELEASE_RECOMMENDED"
  | "RELEASED"
  | "DEFICIENT";

export type VerificationStatus =
  | "UNVERIFIED"
  | "VERIFICATION_PENDING"
  | "BANK_CONFIRMED"
  | "MISMATCH"
  | "SOURCE_UNAVAILABLE"
  | "MANUAL_REVIEW_REQUIRED";

export type EscalationTier = "SCRUTINY_OFFICER" | "REGIONAL_OFFICER" | "BUREAU_HEAD";

export interface ProvenanceField<T> {
  declared: T;
  confirmed?: T;
  matchStatus: "MATCH" | "MISMATCH" | "UNVERIFIED";
  source: "INSTITUTION_DECLARED" | "MOCK_CBS_API" | "MANUAL_SCRUTINY";
  confirmedAt?: string;
}

export interface FdrProvenance {
  fdrNumber: ProvenanceField<string>;
  bankName: ProvenanceField<string>;
  branchName: ProvenanceField<string>;
  ifscCode: ProvenanceField<string>;
  amount: ProvenanceField<number>;
  issueDate: ProvenanceField<string>;
  maturityDate: ProvenanceField<string>;
  lienMarked: ProvenanceField<boolean>;
  jointAccountHolder: ProvenanceField<string>;
}

export interface FdrDocument {
  id: string;
  fdrId: string;
  name: string;
  type: "FDR_RECEIPT" | "BANK_LIEN_CONFIRMATION" | "RELEASE_AFFIDAVIT" | "SANCTION_ORDER" | "OTHER";
  version: number;
  uploadedAt: string;
  uploadedBy: string;
  fileSizeKb: number;
  mimeType: string;
  downloadUrl: string;
  ocrConfidence?: number;
  ocrExtractedPayload?: Record<string, any>;
  metadataAnalysis?: {
    suspiciousFlags: string[];
    isAdvisoryOnly: boolean;
  };
}

export interface ReleaseRequest {
  id: string;
  fdrId: string;
  requestedAt: string;
  requestedBy: string;
  applicantJustification: string;
  affidavitDocId?: string;
  nocNoObjectionCertificateId?: string;
  status: "SUBMITTED" | "UNDER_SCRUTINY" | "RO_RECOMMENDED" | "BUREAU_APPROVED" | "REJECTED";
  roRecommendationNote?: string;
  roRecommendedAt?: string;
  roRecommendedBy?: string;
  bureauApprovalOrderNo?: string;
  bureauApprovalNote?: string;
  bureauApprovedAt?: string;
  bureauApprovedBy?: string;
  rejectionReason?: string;
}

export interface FdrInstrument {
  id: string;
  institutionId: string;
  fdrNumber: string;
  bankName: string;
  branchName: string;
  ifscCode: string;
  amount: number; // in INR
  issueDate: string; // ISO string YYYY-MM-DD
  maturityDate: string; // ISO string YYYY-MM-DD
  tenureMonths: number;
  jointAccountHolder: string; // e.g. "Regional Officer, AICTE Western Region"
  lienMarked: boolean;
  status: FdrStatus;
  verificationStatus: VerificationStatus;
  attentionScore: number; // 0 to 100
  currentEscalationTier: EscalationTier;
  daysIdleInTier: number;
  lastActionAt: string;
  autoRenewEligible: boolean;
  replacedByFdrId?: string;
  replacesFdrId?: string;
  provenance: FdrProvenance;
  discrepancies: DiscrepancyFlag[];
  documents: FdrDocument[];
  releaseRequest?: ReleaseRequest;
}

export interface Institution {
  id: string;
  aicteId: string; // e.g. "1-93827101"
  name: string;
  region: "Northern" | "Western" | "Southern" | "Eastern" | "South-Western" | "Central" | "North-Western" | "North-Eastern";
  state: string;
  city: string;
  category: "Engineering & Technology" | "Management" | "Pharmacy" | "Architecture & Planning" | "Applied Arts & Crafts" | "Design";
  establishmentYear: number;
  trustName: string;
  authorizedSignatoryName: string;
  contactEmail: string;
  contactPhone: string;
  fdrCount?: number;
  totalDepositSum?: number;
}
