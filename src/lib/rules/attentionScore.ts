import { FdrInstrument } from "@/types/fdr";
import { getDaysRemaining } from "../formatters";
import { getSystemConfig } from "../config";

export interface AttentionScoreBreakdown {
  totalScore: number;
  maturityScore: {
    points: number;
    maxPoints: number;
    reason: string;
  };
  discrepancyScore: {
    points: number;
    maxPoints: number;
    reason: string;
  };
  verificationScore: {
    points: number;
    maxPoints: number;
    reason: string;
  };
  renewalScore: {
    points: number;
    maxPoints: number;
    reason: string;
  };
  riskTier: "CRITICAL" | "ELEVATED" | "MODERATE" | "LOW";
}

/**
 * Calculates a transparent, fully explainable Attention Score (0 to 100)
 */
export function calculateAttentionScore(fdr: FdrInstrument): AttentionScoreBreakdown {
  const config = getSystemConfig();
  const maxMaturity = config.attentionWeights.maturityUrgency; // 40
  const maxDiscrepancy = config.attentionWeights.discrepancySeverity; // 30
  const maxVerification = config.attentionWeights.verificationStatus; // 20
  const maxRenewal = config.attentionWeights.renewalOverdue; // 10

  // 1. Maturity Urgency
  let maturityPts = 0;
  let maturityReason = "Maturity horizon is beyond 90 days (healthy).";
  if (fdr.maturityDate) {
    const days = getDaysRemaining(fdr.maturityDate);
    if (days < 0) {
      maturityPts = maxMaturity;
      maturityReason = `Deposit matured ${Math.abs(days)} days ago (Lapsed statutory coverage).`;
    } else if (days <= 7) {
      maturityPts = Math.round(maxMaturity * 0.9); // 36
      maturityReason = `Expiring critically within ${days} days.`;
    } else if (days <= 15) {
      maturityPts = Math.round(maxMaturity * 0.75); // 30
      maturityReason = `Expiring soon within ${days} days.`;
    } else if (days <= 30) {
      maturityPts = Math.round(maxMaturity * 0.6); // 24
      maturityReason = `Approaching maturity within ${days} days.`;
    } else if (days <= 60) {
      maturityPts = Math.round(maxMaturity * 0.4); // 16
      maturityReason = `Within 60-day renewal advisory horizon (${days} days).`;
    } else if (days <= 90) {
      maturityPts = Math.round(maxMaturity * 0.25); // 10
      maturityReason = `Within 90-day renewal notice window (${days} days).`;
    }
  }

  // 2. Discrepancy Severity
  let discrepancyPts = 0;
  let discrepancyReason = "No unresolved discrepancy flags.";
  const openFlags = (fdr.discrepancies || []).filter((d) => !d.resolved);
  if (openFlags.some((d) => d.severity === "CRITICAL")) {
    discrepancyPts = maxDiscrepancy; // 30
    discrepancyReason = `Open CRITICAL regulatory discrepancies detected (${openFlags.filter((d) => d.severity === "CRITICAL").length} flag(s)).`;
  } else if (openFlags.some((d) => d.severity === "HIGH")) {
    discrepancyPts = Math.round(maxDiscrepancy * 0.65); // 20
    discrepancyReason = `Open HIGH priority compliance observations (${openFlags.filter((d) => d.severity === "HIGH").length} flag(s)).`;
  } else if (openFlags.length > 0) {
    discrepancyPts = Math.round(maxDiscrepancy * 0.35); // 10
    discrepancyReason = `Advisory provenance flags open for review (${openFlags.length} flag(s)).`;
  }

  // 3. Verification State
  let verificationPts = 0;
  let verificationReason = "Core banking confirmation verified and matched.";
  switch (fdr.verificationStatus) {
    case "MISMATCH":
      verificationPts = maxVerification; // 20
      verificationReason = "Core banking response contradicts institution declared details.";
      break;
    case "MANUAL_REVIEW_REQUIRED":
    case "SOURCE_UNAVAILABLE":
      verificationPts = Math.round(maxVerification * 0.75); // 15
      verificationReason = "Automated verification unavailable; manual bank scrutiny required.";
      break;
    case "UNVERIFIED":
    case "VERIFICATION_PENDING":
      verificationPts = Math.round(maxVerification * 0.5); // 10
      verificationReason = "Verification pending initial officer scrutiny or bank confirmation.";
      break;
    case "BANK_CONFIRMED":
      verificationPts = 0;
      break;
  }

  // 4. Renewal Overdue
  let renewalPts = 0;
  let renewalReason = "Instrument is active or renewal in progress.";
  if (fdr.status === "MATURED" || fdr.status === "DEFICIENT") {
    renewalPts = maxRenewal; // 10
    renewalReason = "Deposit has reached maturity without renewal receipt submission.";
  }

  const totalScore = Math.min(100, maturityPts + discrepancyPts + verificationPts + renewalPts);

  let riskTier: AttentionScoreBreakdown["riskTier"] = "LOW";
  if (totalScore >= 70) riskTier = "CRITICAL";
  else if (totalScore >= 45) riskTier = "ELEVATED";
  else if (totalScore >= 25) riskTier = "MODERATE";

  return {
    totalScore,
    maturityScore: { points: maturityPts, maxPoints: maxMaturity, reason: maturityReason },
    discrepancyScore: { points: discrepancyPts, maxPoints: maxDiscrepancy, reason: discrepancyReason },
    verificationScore: { points: verificationPts, maxPoints: maxVerification, reason: verificationReason },
    renewalScore: { points: renewalPts, maxPoints: maxRenewal, reason: renewalReason },
    riskTier,
  };
}
