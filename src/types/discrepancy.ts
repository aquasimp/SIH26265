export type DiscrepancySeverity = "CRITICAL" | "HIGH" | "ADVISORY";

export type DiscrepancyRuleCode =
  | "MISSING_FIELDS"
  | "MATURITY_BEFORE_ISSUE"
  | "AMOUNT_MISMATCH"
  | "BANK_IFSC_MISMATCH"
  | "DUPLICATE_FDR"
  | "EXPIRED_INSTRUMENT"
  | "LIEN_NOT_MARKED"
  | "SUSPICIOUS_METADATA";

export interface DiscrepancyFlag {
  id: string;
  fdrId: string;
  ruleCode: DiscrepancyRuleCode;
  severity: DiscrepancySeverity;
  title: string;
  reason: string;
  evidence: {
    field?: string;
    declaredValue?: string | number | boolean;
    expectedOrConfirmedValue?: string | number | boolean;
    technicalDetails?: string;
  };
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNote?: string;
  createdAt: string;
}

export interface RuleDefinition {
  code: DiscrepancyRuleCode;
  name: string;
  defaultSeverity: DiscrepancySeverity;
  description: string;
  remediationHint: string;
}

export const DISCREPANCY_CATALOG: Record<DiscrepancyRuleCode, RuleDefinition> = {
  MISSING_FIELDS: {
    code: "MISSING_FIELDS",
    name: "Mandatory Regulatory Field Absent",
    defaultSeverity: "CRITICAL",
    description: "One or more mandatory statutory deposit fields (e.g. IFSC, Bank Branch, Issue Date) are empty.",
    remediationHint: "Institution must furnish the complete deposit particulars before processing can advance.",
  },
  MATURITY_BEFORE_ISSUE: {
    code: "MATURITY_BEFORE_ISSUE",
    name: "Temporal Inversion (Maturity <= Issue Date)",
    defaultSeverity: "CRITICAL",
    description: "The stated maturity date occurs on or prior to the deposit issue date, violating basic chronology.",
    remediationHint: "Correct typographical inversion or request certified deposit schedule from issuing bank.",
  },
  AMOUNT_MISMATCH: {
    code: "AMOUNT_MISMATCH",
    name: "Deposit Quantum Discrepancy",
    defaultSeverity: "HIGH",
    description: "Discrepancy detected between declared deposit sum and core banking confirmed amount or prescribed norm.",
    remediationHint: "Verify certified bank deposit ledger or seek balance top-up from the applicant trust.",
  },
  BANK_IFSC_MISMATCH: {
    code: "BANK_IFSC_MISMATCH",
    name: "Banking Institution vs IFSC Prefix Conflict",
    defaultSeverity: "CRITICAL",
    description: "Issuing bank stated on certificate contradicts the RBI financial routing prefix in the IFSC code.",
    remediationHint: "Verify issuing bank branch IFSC against Reserve Bank of India IFSC directory.",
  },
  DUPLICATE_FDR: {
    code: "DUPLICATE_FDR",
    name: "Cross-Institutional Instrument Collision",
    defaultSeverity: "CRITICAL",
    description: "The identical FDR number and issuing bank exists under another distinct institution or application.",
    remediationHint: "Initiate vigilance review for potential duplicate pledging across multiple entities.",
  },
  EXPIRED_INSTRUMENT: {
    code: "EXPIRED_INSTRUMENT",
    name: "Instrument Overdue / Matured Without Renewal",
    defaultSeverity: "HIGH",
    description: "Deposit instrument has reached maturity and has not been formally renewed or discharged.",
    remediationHint: "Issue immediate statutory demand notice to applicant institution for deposit renewal.",
  },
  LIEN_NOT_MARKED: {
    code: "LIEN_NOT_MARKED",
    name: "AICTE Lien Notation Missing in Core Banking",
    defaultSeverity: "CRITICAL",
    description: "Core banking record or bank letter fails to confirm registered lien in favour of Regional Officer, AICTE.",
    remediationHint: "Mandate institution to submit Bank Confirmation Letter with CBS lien endorsement screenshot.",
  },
  SUSPICIOUS_METADATA: {
    code: "SUSPICIOUS_METADATA",
    name: "Document Digital Provenance Anomaly",
    defaultSeverity: "ADVISORY",
    description: "PDF/Image creation metadata displays post-dated generation or desktop editing application signatures.",
    remediationHint: "Advisory flag for officer review; compare scan visual typography against known bank templates.",
  },
};

