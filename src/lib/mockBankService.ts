/**
 * ============================================================================
 * [MOCK BANK SERVICE] — NOT A REAL LIVE BANK INTEGRATION
 * Models a Core Banking Solution (CBS) API / SFMS gateway for demonstration
 * of Indian banking FDR verification and lien confirmation workflows.
 * ============================================================================
 */

export interface MockBankVerificationRequest {
  fdrNumber: string;
  bankName: string;
  ifscCode: string;
  amount: number;
}

export interface MockBankVerificationResponse {
  isMockService: true;
  cbsTransactionRef: string;
  verifiedAt: string;
  cbsStatus: "ACCOUNT_ACTIVE" | "ACCOUNT_CLOSED" | "NOT_FOUND" | "SUSPENDED";
  bankName: string;
  branchName: string;
  ifscCode: string;
  fdrNumber: string;
  depositAmount: number;
  issueDate: string;
  maturityDate: string;
  lienMarked: boolean;
  lienBeneficiary: string;
  discrepanciesDetected: string[];
}

/**
 * Deterministic Mock Bank Core Banking Verification Adapter
 */
export async function queryMockBankVerification(
  req: MockBankVerificationRequest
): Promise<MockBankVerificationResponse> {
  // Simulate network latency (200ms)
  await new Promise((resolve) => setTimeout(resolve, 200));

  const fdrClean = (req.fdrNumber || "").trim().toUpperCase();
  const bankClean = (req.bankName || "").trim();
  const now = new Date();

  // Scenario 1: Forged / Non-existent FDR
  if (fdrClean.includes("FAKE") || fdrClean.includes("999999")) {
    return {
      isMockService: true,
      cbsTransactionRef: `CBS-ERR-${Date.now()}`,
      verifiedAt: now.toISOString(),
      cbsStatus: "NOT_FOUND",
      bankName: bankClean,
      branchName: "UNKNOWN",
      ifscCode: req.ifscCode,
      fdrNumber: req.fdrNumber,
      depositAmount: 0,
      issueDate: "",
      maturityDate: "",
      lienMarked: false,
      lienBeneficiary: "NONE",
      discrepanciesDetected: ["FDR receipt number not found in CBS term deposit ledger"],
    };
  }

  // Scenario 2: Unmarked Lien (sole institution name)
  if (fdrClean.includes("NOLIEN") || req.fdrNumber.endsWith("07")) {
    return {
      isMockService: true,
      cbsTransactionRef: `CBS-LN-${Date.now().toString().slice(-6)}`,
      verifiedAt: now.toISOString(),
      cbsStatus: "ACCOUNT_ACTIVE",
      bankName: bankClean,
      branchName: "Industrial Finance Branch",
      ifscCode: req.ifscCode,
      fdrNumber: req.fdrNumber,
      depositAmount: req.amount,
      issueDate: "2020-04-10",
      maturityDate: "2030-04-10",
      lienMarked: false,
      lienBeneficiary: "NONE (Sole Account Holder)",
      discrepanciesDetected: ["Lien not registered in CBS in favour of AICTE Regional Officer"],
    };
  }

  // Scenario 3: Amount Mismatch (e.g. institution declared 35L, bank shows 3.5L)
  if (fdrClean.includes("AMT") || req.fdrNumber.endsWith("03")) {
    const reducedAmount = Math.round(req.amount / 10);
    return {
      isMockService: true,
      cbsTransactionRef: `CBS-DIFF-${Date.now().toString().slice(-6)}`,
      verifiedAt: now.toISOString(),
      cbsStatus: "ACCOUNT_ACTIVE",
      bankName: bankClean,
      branchName: "Mid Corporate Branch",
      ifscCode: req.ifscCode,
      fdrNumber: req.fdrNumber,
      depositAmount: reducedAmount,
      issueDate: "2021-08-15",
      maturityDate: "2031-08-15",
      lienMarked: true,
      lienBeneficiary: "Regional Officer, AICTE",
      discrepanciesDetected: [
        `Deposit principal in CBS is ₹${reducedAmount.toLocaleString("en-IN")}, differing from declared ₹${req.amount.toLocaleString("en-IN")}`,
      ],
    };
  }

  // Scenario 4: Standard Authentic & Verified Deposit
  return {
    isMockService: true,
    cbsTransactionRef: `CBS-OK-${Date.now().toString().slice(-6)}`,
    verifiedAt: now.toISOString(),
    cbsStatus: "ACCOUNT_ACTIVE",
    bankName: bankClean,
    branchName: "Overseas & Institutional Branch",
    ifscCode: req.ifscCode,
    fdrNumber: req.fdrNumber,
    depositAmount: req.amount,
    issueDate: "2022-06-01",
    maturityDate: "2032-06-01",
    lienMarked: true,
    lienBeneficiary: "Regional Officer, AICTE",
    discrepanciesDetected: [],
  };
}
