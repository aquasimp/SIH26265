import { DiscrepancyFlag, DiscrepancyRuleCode, DISCREPANCY_CATALOG } from "@/types/discrepancy";
import { FdrInstrument } from "@/types/fdr";
import { getSystemConfig } from "../config";
import { getDaysRemaining } from "../formatters";

/**
 * Standard Indian Bank Name to RBI IFSC Prefix Map
 */
export const BANK_IFSC_MAP: Record<string, string[]> = {
  "State Bank of India": ["SBIN"],
  "Punjab National Bank": ["PUNB"],
  "Bank of Baroda": ["BARB"],
  "Canara Bank": ["CNRB"],
  "Union Bank of India": ["UBIN"],
  "Indian Bank": ["IDIB"],
  "Bank of India": ["BKID"],
  "Central Bank of India": ["CBIN"],
  "HDFC Bank": ["HDFC"],
  "ICICI Bank": ["ICIC"],
  "Axis Bank": ["UTIB"],
  "Kotak Mahindra Bank": ["KKBK"],
};

export interface DiscrepancyContext {
  allFdrs?: FdrInstrument[];
  discipline?: string;
}

/**
 * Deterministically evaluates all 8 discrepancy rules against an FDR instrument
 */
export function evaluateDiscrepancies(
  fdr: FdrInstrument,
  context: DiscrepancyContext = {}
): DiscrepancyFlag[] {
  const flags: DiscrepancyFlag[] = [];
  const config = getSystemConfig();
  const nowStr = new Date().toISOString();

  // Helper to construct a standard flag
  const createFlag = (
    ruleCode: DiscrepancyRuleCode,
    reason: string,
    evidence: DiscrepancyFlag["evidence"]
  ): DiscrepancyFlag => {
    const meta = DISCREPANCY_CATALOG[ruleCode];
    return {
      id: `flag-${fdr.id}-${ruleCode.toLowerCase()}`,
      fdrId: fdr.id,
      ruleCode,
      severity: meta.defaultSeverity,
      title: meta.name,
      reason,
      evidence,
      resolved: false,
      createdAt: nowStr,
    };
  };

  // Rule 1: MISSING_FIELDS
  const missing: string[] = [];
  if (!fdr.fdrNumber?.trim()) missing.push("FDR Number");
  if (!fdr.bankName?.trim()) missing.push("Issuing Bank");
  if (!fdr.ifscCode?.trim()) missing.push("IFSC Code");
  if (!fdr.amount || fdr.amount <= 0) missing.push("Principal Deposit Amount");
  if (!fdr.issueDate?.trim()) missing.push("Date of Issue");
  if (!fdr.maturityDate?.trim()) missing.push("Date of Maturity");

  if (missing.length > 0) {
    flags.push(
      createFlag(
        "MISSING_FIELDS",
        `Mandatory regulatory field(s) absent: ${missing.join(", ")}.`,
        { field: missing.join(", "), technicalDetails: "Missing non-nullable treasury parameters." }
      )
    );
  }

  // Rule 2: MATURITY_BEFORE_ISSUE (Temporal Inversion)
  if (fdr.issueDate && fdr.maturityDate) {
    const issueTime = new Date(fdr.issueDate).getTime();
    const maturityTime = new Date(fdr.maturityDate).getTime();
    if (maturityTime <= issueTime) {
      flags.push(
        createFlag(
          "MATURITY_BEFORE_ISSUE",
          `Maturity date (${fdr.maturityDate}) cannot be on or prior to the issue date (${fdr.issueDate}).`,
          {
            field: "maturityDate",
            declaredValue: fdr.maturityDate,
            expectedOrConfirmedValue: `Must be > ${fdr.issueDate}`,
            technicalDetails: `Delta: ${Math.round((maturityTime - issueTime) / (1000 * 3600 * 24))} days.`,
          }
        )
      );
    }
  }

  // Rule 3: AMOUNT_MISMATCH
  if (fdr.provenance?.amount?.confirmed !== undefined) {
    const declaredAmt = fdr.amount;
    const confirmedAmt = fdr.provenance.amount.confirmed;
    if (Math.abs(declaredAmt - confirmedAmt) > 0.01) {
      flags.push(
        createFlag(
          "AMOUNT_MISMATCH",
          `Declared deposit of ₹${declaredAmt.toLocaleString("en-IN")} differs from core banking confirmed sum of ₹${confirmedAmt.toLocaleString("en-IN")}.`,
          {
            field: "amount",
            declaredValue: declaredAmt,
            expectedOrConfirmedValue: confirmedAmt,
            technicalDetails: `Absolute variance: ₹${Math.abs(declaredAmt - confirmedAmt).toLocaleString("en-IN")}`,
          }
        )
      );
    }
  } else if (context.discipline && config.depositNormsByDiscipline[context.discipline]) {
    const minRequired = config.depositNormsByDiscipline[context.discipline];
    if (fdr.amount < minRequired) {
      flags.push(
        createFlag(
          "AMOUNT_MISMATCH",
          `Declared amount ₹${fdr.amount.toLocaleString("en-IN")} is below statutory norm of ₹${minRequired.toLocaleString("en-IN")} for ${context.discipline}.`,
          {
            field: "amount",
            declaredValue: fdr.amount,
            expectedOrConfirmedValue: minRequired,
            technicalDetails: `Deficit: ₹${(minRequired - fdr.amount).toLocaleString("en-IN")}`,
          }
        )
      );
    }
  }

  // Rule 4: BANK_IFSC_MISMATCH
  if (fdr.bankName && fdr.ifscCode) {
    const ifscPrefix = fdr.ifscCode.substring(0, 4).toUpperCase();
    const expectedPrefixes = BANK_IFSC_MAP[fdr.bankName];
    if (expectedPrefixes && !expectedPrefixes.includes(ifscPrefix)) {
      flags.push(
        createFlag(
          "BANK_IFSC_MISMATCH",
          `Issuing bank "${fdr.bankName}" expected IFSC prefix ${expectedPrefixes.join("/")}, but received "${ifscPrefix}".`,
          {
            field: "ifscCode",
            declaredValue: fdr.ifscCode,
            expectedOrConfirmedValue: expectedPrefixes.join(", "),
            technicalDetails: `RBI bank code mismatch between stated institution and IFSC routing prefix.`,
          }
        )
      );
    }
  }

  // Rule 5: DUPLICATE_FDR
  if (context.allFdrs && context.allFdrs.length > 0 && fdr.fdrNumber) {
    const duplicates = context.allFdrs.filter(
      (other) =>
        other.id !== fdr.id &&
        other.fdrNumber?.trim().toUpperCase() === fdr.fdrNumber.trim().toUpperCase() &&
        other.bankName?.trim().toUpperCase() === fdr.bankName?.trim().toUpperCase()
    );

    if (duplicates.length > 0) {
      const collidingInstitutions = duplicates.map((d) => d.institutionId).join(", ");
      flags.push(
        createFlag(
          "DUPLICATE_FDR",
          `Duplicate instrument collision: FDR number "${fdr.fdrNumber}" at "${fdr.bankName}" already exists under Institution(s): ${collidingInstitutions}.`,
          {
            field: "fdrNumber",
            declaredValue: fdr.fdrNumber,
            expectedOrConfirmedValue: "Must be globally unique",
            technicalDetails: `Collision count: ${duplicates.length} duplicate record(s).`,
          }
        )
      );
    }
  }

  // Rule 6: EXPIRED_INSTRUMENT
  if (fdr.maturityDate && fdr.status !== "RENEWED" && fdr.status !== "RELEASED") {
    const daysRemaining = getDaysRemaining(fdr.maturityDate);
    if (daysRemaining < 0) {
      flags.push(
        createFlag(
          "EXPIRED_INSTRUMENT",
          `Instrument matured ${Math.abs(daysRemaining)} days ago on ${fdr.maturityDate}. Active security deposit coverage has lapsed.`,
          {
            field: "maturityDate",
            declaredValue: fdr.maturityDate,
            expectedOrConfirmedValue: "Future maturity date or renewal endorsement",
            technicalDetails: `Lapsed by ${Math.abs(daysRemaining)} calendar days.`,
          }
        )
      );
    }
  }

  // Rule 7: LIEN_NOT_MARKED
  if (
    fdr.lienMarked === false ||
    (fdr.provenance?.lienMarked?.confirmed !== undefined && fdr.provenance.lienMarked.confirmed === false)
  ) {
    flags.push(
      createFlag(
        "LIEN_NOT_MARKED",
        `Core banking confirmation or declared certificate indicates lien is not pledged in favour of Regional Officer, AICTE.`,
        {
          field: "lienMarked",
          declaredValue: fdr.lienMarked,
          expectedOrConfirmedValue: true,
          technicalDetails: "Instrument vulnerable to unilateral pre-closure without AICTE consent.",
        }
      )
    );
  }

  // Rule 8: SUSPICIOUS_METADATA
  const docWithSuspiciousMeta = fdr.documents?.find(
    (d) => d.metadataAnalysis && d.metadataAnalysis.suspiciousFlags.length > 0
  );
  if (docWithSuspiciousMeta && docWithSuspiciousMeta.metadataAnalysis) {
    flags.push(
      createFlag(
        "SUSPICIOUS_METADATA",
        `Advisory notice: Document ${docWithSuspiciousMeta.name} exhibits digital creation anomalies (${docWithSuspiciousMeta.metadataAnalysis.suspiciousFlags.join(", ")}).`,
        {
          field: "documents",
          technicalDetails: `Advisory provenance flag. Document requires physical cross-verification.`,
        }
      )
    );
  }

  return flags;
}

