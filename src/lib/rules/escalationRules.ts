import { EscalationTier, FdrInstrument } from "@/types/fdr";
import { getSystemConfig } from "../config";

export interface EscalationStatus {
  tier: EscalationTier;
  isBreached: boolean;
  daysIdle: number;
  thresholdDays: number;
  reason: string;
}

/**
 * Calculates current escalation tier and breach status based on configurable idle days
 */
export function evaluateEscalationTier(
  fdr: FdrInstrument,
  currentDaysIdle?: number
): EscalationStatus {
  const config = getSystemConfig();
  const idleDays = currentDaysIdle !== undefined ? currentDaysIdle : fdr.daysIdleInTier || 0;

  // Terminal or healthy statuses don't escalate
  if (
    fdr.status === "RELEASED" ||
    fdr.status === "RENEWED" ||
    (fdr.status === "ACTIVE" && (!fdr.discrepancies || fdr.discrepancies.every((d) => d.resolved)))
  ) {
    return {
      tier: "SCRUTINY_OFFICER",
      isBreached: false,
      daysIdle: idleDays,
      thresholdDays: config.escalationIdleDays.scrutinyToRo,
      reason: "Instrument is in compliant steady state.",
    };
  }

  // Tier 1: Scrutiny Officer (up to scrutinyToRo days)
  if (idleDays < config.escalationIdleDays.scrutinyToRo) {
    return {
      tier: "SCRUTINY_OFFICER",
      isBreached: false,
      daysIdle: idleDays,
      thresholdDays: config.escalationIdleDays.scrutinyToRo,
      reason: `Under review by Scrutiny Cell (${idleDays}/${config.escalationIdleDays.scrutinyToRo} days elapsed).`,
    };
  }

  // Tier 2: Regional Officer (between scrutinyToRo and roToBureauHead days)
  if (idleDays < config.escalationIdleDays.roToBureauHead) {
    return {
      tier: "REGIONAL_OFFICER",
      isBreached: true,
      daysIdle: idleDays,
      thresholdDays: config.escalationIdleDays.roToBureauHead,
      reason: `Escalated to Regional Officer due to ${idleDays} days of idle scrutiny.`,
    };
  }

  // Tier 3: Bureau Head (beyond roToBureauHead days)
  return {
    tier: "BUREAU_HEAD",
    isBreached: true,
    daysIdle: idleDays,
    thresholdDays: config.escalationIdleDays.roToBureauHead,
    reason: `Executive Bureau Head intervention mandated. Unresolved for ${idleDays} days.`,
  };
}

