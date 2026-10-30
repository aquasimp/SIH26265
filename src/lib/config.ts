export interface SystemConfig {
  portalTitle: string;
  regulatoryBody: string;
  defaultMaturityTenureMonths: number;
  reminderDaysTiers: number[]; // e.g. [90, 60, 30, 15, 7]
  escalationIdleDays: {
    scrutinyToRo: number; // e.g. 5 days
    roToBureauHead: number; // e.g. 10 days
  };
  attentionWeights: {
    maturityUrgency: number; // Max 40 pts
    discrepancySeverity: number; // Max 30 pts
    verificationStatus: number; // Max 20 pts
    renewalOverdue: number; // Max 10 pts
  };
  depositNormsByDiscipline: Record<string, number>; // in INR
  requiredDocumentTypes: string[];
}

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  portalTitle: "AICTE Security Deposit / FDR Central Treasury",
  regulatoryBody: "All India Council for Technical Education — Regulation Bureau",
  defaultMaturityTenureMonths: 120, // 10 years statutory norm
  reminderDaysTiers: [90, 60, 30, 15, 7],
  escalationIdleDays: {
    scrutinyToRo: 5,
    roToBureauHead: 10,
  },
  attentionWeights: {
    maturityUrgency: 40,
    discrepancySeverity: 30,
    verificationStatus: 20,
    renewalOverdue: 10,
  },
  depositNormsByDiscipline: {
    "Engineering & Technology": 3500000, // ₹35 Lakhs
    Management: 1500000, // ₹15 Lakhs
    Pharmacy: 2000000, // ₹20 Lakhs
    "Architecture & Planning": 1500000, // ₹15 Lakhs
    "Applied Arts & Crafts": 1000000, // ₹10 Lakhs
    Design: 1500000, // ₹15 Lakhs
  },
  requiredDocumentTypes: [
    "FDR_RECEIPT",
    "BANK_LIEN_CONFIRMATION",
    "RELEASE_AFFIDAVIT",
    "SANCTION_ORDER",
  ],
};

let activeConfig: SystemConfig = { ...DEFAULT_SYSTEM_CONFIG };

export function getSystemConfig(): SystemConfig {
  return activeConfig;
}

export function updateSystemConfig(newConfig: Partial<SystemConfig>): SystemConfig {
  activeConfig = {
    ...activeConfig,
    ...newConfig,
    escalationIdleDays: {
      ...activeConfig.escalationIdleDays,
      ...(newConfig.escalationIdleDays || {}),
    },
    attentionWeights: {
      ...activeConfig.attentionWeights,
      ...(newConfig.attentionWeights || {}),
    },
    depositNormsByDiscipline: {
      ...activeConfig.depositNormsByDiscipline,
      ...(newConfig.depositNormsByDiscipline || {}),
    },
  };
  return activeConfig;
}
