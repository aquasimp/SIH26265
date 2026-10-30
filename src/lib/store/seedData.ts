import { Institution, FdrInstrument, FdrStatus, VerificationStatus, EscalationTier } from "@/types/fdr";
import { DiscrepancyFlag } from "@/types/discrepancy";
import { AuditLogEntry } from "@/types/audit";
import { calculateBlockHash, GENESIS_HASH } from "../hashChain";
import { calculateAttentionScore } from "../rules/attentionScore";

// Deterministic seed data generator
export function generateSeedData(): {
  institutions: Institution[];
  fdrs: FdrInstrument[];
  auditLogs: AuditLogEntry[];
} {
  const regions: Institution["region"][] = [
    "Northern", "Western", "Southern", "Eastern",
    "South-Western", "Central", "North-Western", "North-Eastern"
  ];

  const statesByRegion: Record<Institution["region"], string[]> = {
    Northern: ["Uttar Pradesh", "Uttarakhand", "Delhi NCT"],
    Western: ["Maharashtra", "Gujarat", "Goa"],
    Southern: ["Tamil Nadu", "Andhra Pradesh", "Telangana"],
    Eastern: ["West Bengal", "Odisha", "Bihar"],
    "South-Western": ["Karnataka", "Kerala"],
    Central: ["Madhya Pradesh", "Chhattisgarh"],
    "North-Western": ["Punjab", "Haryana", "Rajasthan", "Himachal Pradesh"],
    "North-Eastern": ["Assam", "Meghalaya", "Tripura"],
  };

  const disciplines: Institution["category"][] = [
    "Engineering & Technology",
    "Management",
    "Pharmacy",
    "Architecture & Planning",
    "Applied Arts & Crafts",
    "Design",
  ];

  const banks = [
    { name: "State Bank of India", ifscPrefix: "SBIN", branch: "SME Commercial Branch" },
    { name: "Punjab National Bank", ifscPrefix: "PUNB", branch: "Industrial Area Branch" },
    { name: "Bank of Baroda", ifscPrefix: "BARB", branch: "Mid-Corporate Branch" },
    { name: "Canara Bank", ifscPrefix: "CNRB", branch: "Town Hall Branch" },
    { name: "Union Bank of India", ifscPrefix: "UBIN", branch: "Capital Market Branch" },
    { name: "HDFC Bank", ifscPrefix: "HDFC", branch: "Institutional Banking Branch" },
    { name: "ICICI Bank", ifscPrefix: "ICIC", branch: "Treasury Operations Branch" },
    { name: "Axis Bank", ifscPrefix: "UTIB", branch: "Corporate Finance Branch" },
  ];

  const collegePrefixes = [
    "Aryavarta", "Sahyadri", "Kaveri", "Vindhyachal", "Brahmaputra",
    "Marudhar", "Narmada", "Utkal", "Dronacharya", "Chanakya",
    "Bhaskara", "Varahamihira", "Patanjali", "Nalanda Heritage", "Takshashila Global",
    "Godavari", "Satpura", "Aravalli", "Himalayan Foothills", "Konkan Coast",
    "Malabar", "Coromandel", "Deccan Horizon", "Indus Pioneer", "Ganga Valley",
    "Shivalik", "Nilgiri", "Sundarbans", "Zanskar", "Thar Desert",
  ];

  const collegeSuffixes = [
    "Institute of Technology & Science",
    "College of Engineering & Polytechnic",
    "Academy of Technical Education",
    "Institute of Management & Applied Studies",
    "Pioneer College of Pharmaceutical Sciences",
    "School of Architecture & Urban Design",
    "Technical Research Campus",
    "College of Technology & Advanced Computing",
  ];

  // 1. Generate 60 Fictional Institutions
  const institutions: Institution[] = [];
  for (let i = 0; i < 60; i++) {
    const region = regions[i % regions.length];
    const states = statesByRegion[region];
    const state = states[i % states.length];
    const category = disciplines[i % disciplines.length];
    const pIndex = i % collegePrefixes.length;
    const sIndex = Math.floor(i / 5) % collegeSuffixes.length;
    const name = `${collegePrefixes[pIndex]} ${collegeSuffixes[sIndex]}`;

    institutions.push({
      id: `inst-${(i + 1).toString().padStart(3, "0")}`,
      aicteId: `1-${(900000000 + i * 137).toString().substring(0, 9)}`,
      name,
      region,
      state,
      city: `Hub-${(i % 12) + 1}`,
      category,
      establishmentYear: 2005 + (i % 18),
      trustName: `Shri ${collegePrefixes[pIndex]} Educational & Charitable Foundation`,
      authorizedSignatoryName: `Prof. Dr. ${["R. K. Sharma", "Sunita Nair", "Amitav Sen", "P. Venkatraman", "Meenakshi Joshi"][i % 5]}`,
      contactEmail: `dean.admin@${collegePrefixes[pIndex].toLowerCase().replace(/\s+/g, "")}-edu.synthetic.in`,
      contactPhone: `+91 98${(76543210 + i * 31).toString().substring(0, 8)}`,
      fdrCount: 0,
      totalDepositSum: 0,
    });
  }

  // Reference date: 2026-10-30 (Current simulated regulatory audit epoch)
  const baseDate = new Date("2026-10-30T10:00:00Z");

  const fdrs: FdrInstrument[] = [];
  const auditLogs: AuditLogEntry[] = [];
  let currentChainHash = GENESIS_HASH;
  let logSeq = 1;

  const appendAuditLog = (
    entityId: string,
    action: AuditLogEntry["action"],
    actorRole: AuditLogEntry["actorRole"],
    actorName: string,
    actorId: string,
    details: string,
    timestamp: string,
    diff?: AuditLogEntry["diff"]
  ) => {
    const blockHash = calculateBlockHash(
      currentChainHash,
      logSeq,
      timestamp,
      entityId,
      action,
      actorId,
      details,
      diff
    );
    const entry: AuditLogEntry = {
      id: `audit-${logSeq.toString().padStart(5, "0")}`,
      sequenceNumber: logSeq,
      timestamp,
      entityType: "FDR",
      entityId,
      action,
      actorRole,
      actorName,
      actorId,
      details,
      previousHash: currentChainHash,
      currentHash: blockHash,
      diff,
    };
    currentChainHash = blockHash;
    logSeq++;
    auditLogs.push(entry);
  };

  // Helper date add
  const addDays = (d: Date, days: number): string => {
    const res = new Date(d);
    res.setDate(res.getDate() + days);
    return res.toISOString().split("T")[0];
  };

  // 2. Build Specifically Crafted Edge Cases (P0 for Testing & Verification)

  // Edge Case 1: Expiring in 5 days (Critical Urgency)
  const ec1Inst = institutions[0];
  const ec1Issue = addDays(baseDate, -3650 + 5); // 10 years ago minus 5 days
  const ec1Maturity = addDays(baseDate, 5); // 5 days from today
  fdrs.push({
    id: "fdr-ec-01-expiring-soon",
    institutionId: ec1Inst.id,
    fdrNumber: "FDR-2016-SBI-88129",
    bankName: "State Bank of India",
    branchName: "Industrial Finance Branch",
    ifscCode: "SBIN0004123",
    amount: 3500000,
    issueDate: ec1Issue,
    maturityDate: ec1Maturity,
    tenureMonths: 120,
    jointAccountHolder: `Regional Officer, AICTE ${ec1Inst.region} Region`,
    lienMarked: true,
    status: "EXPIRING",
    verificationStatus: "BANK_CONFIRMED",
    attentionScore: 78,
    currentEscalationTier: "REGIONAL_OFFICER",
    daysIdleInTier: 6,
    lastActionAt: "2026-10-24T10:00:00Z",
    autoRenewEligible: true,
    provenance: {
      fdrNumber: { declared: "FDR-2016-SBI-88129", confirmed: "FDR-2016-SBI-88129", matchStatus: "MATCH", source: "MOCK_CBS_API" },
      bankName: { declared: "State Bank of India", confirmed: "State Bank of India", matchStatus: "MATCH", source: "MOCK_CBS_API" },
      branchName: { declared: "Industrial Finance Branch", confirmed: "Industrial Finance Branch", matchStatus: "MATCH", source: "MOCK_CBS_API" },
      ifscCode: { declared: "SBIN0004123", confirmed: "SBIN0004123", matchStatus: "MATCH", source: "MOCK_CBS_API" },
      amount: { declared: 3500000, confirmed: 3500000, matchStatus: "MATCH", source: "MOCK_CBS_API" },
      issueDate: { declared: ec1Issue, confirmed: ec1Issue, matchStatus: "MATCH", source: "MOCK_CBS_API" },
      maturityDate: { declared: ec1Maturity, confirmed: ec1Maturity, matchStatus: "MATCH", source: "MOCK_CBS_API" },
      lienMarked: { declared: true, confirmed: true, matchStatus: "MATCH", source: "MOCK_CBS_API" },
      jointAccountHolder: { declared: `Regional Officer, AICTE ${ec1Inst.region} Region`, confirmed: `Regional Officer, AICTE ${ec1Inst.region} Region`, matchStatus: "MATCH", source: "MOCK_CBS_API" },
    },
    discrepancies: [],
    documents: [
      {
        id: "doc-ec1-fdr",
        fdrId: "fdr-ec-01-expiring-soon",
        name: "SBI_Joint_FDR_Original_Certificate.pdf",
        type: "FDR_RECEIPT",
        version: 1,
        uploadedAt: "2016-11-05T08:30:00Z",
        uploadedBy: "Institution Signatory",
        fileSizeKb: 842,
        mimeType: "application/pdf",
        downloadUrl: "/sample-fdr.pdf",
      },
    ],
  });
  appendAuditLog(
    "fdr-ec-01-expiring-soon",
    "FDR_SUBMITTED",
    "INSTITUTION_USER",
    ec1Inst.authorizedSignatoryName,
    "usr-inst-01",
    "Initial 10-year term deposit certificate submitted for Western Regional approval.",
    "2016-11-05T08:30:00Z"
  );

  // Edge Case 2: Already Matured & Overdue Renewal
  const ec2Inst = institutions[1];
  const ec2Issue = addDays(baseDate, -3650 - 45);
  const ec2Maturity = addDays(baseDate, -45); // Matured 45 days ago
  fdrs.push({
    id: "fdr-ec-02-matured-overdue",
    institutionId: ec2Inst.id,
    fdrNumber: "FDR-2016-PNB-54109",
    bankName: "Punjab National Bank",
    branchName: "Industrial Area Branch",
    ifscCode: "PUNB0123400",
    amount: 3500000,
    issueDate: ec2Issue,
    maturityDate: ec2Maturity,
    tenureMonths: 120,
    jointAccountHolder: `Regional Officer, AICTE ${ec2Inst.region} Region`,
    lienMarked: true,
    status: "MATURED",
    verificationStatus: "BANK_CONFIRMED",
    attentionScore: 85,
    currentEscalationTier: "BUREAU_HEAD",
    daysIdleInTier: 14,
    lastActionAt: "2026-10-16T11:00:00Z",
    autoRenewEligible: false,
    provenance: {
      fdrNumber: { declared: "FDR-2016-PNB-54109", confirmed: "FDR-2016-PNB-54109", matchStatus: "MATCH", source: "MOCK_CBS_API" },
      bankName: { declared: "Punjab National Bank", confirmed: "Punjab National Bank", matchStatus: "MATCH", source: "MOCK_CBS_API" },
      branchName: { declared: "Industrial Area Branch", confirmed: "Industrial Area Branch", matchStatus: "MATCH", source: "MOCK_CBS_API" },
      ifscCode: { declared: "PUNB0123400", confirmed: "PUNB0123400", matchStatus: "MATCH", source: "MOCK_CBS_API" },
      amount: { declared: 3500000, confirmed: 3500000, matchStatus: "MATCH", source: "MOCK_CBS_API" },
      issueDate: { declared: ec2Issue, confirmed: ec2Issue, matchStatus: "MATCH", source: "MOCK_CBS_API" },
      maturityDate: { declared: ec2Maturity, confirmed: ec2Maturity, matchStatus: "MATCH", source: "MOCK_CBS_API" },
      lienMarked: { declared: true, confirmed: true, matchStatus: "MATCH", source: "MOCK_CBS_API" },
      jointAccountHolder: { declared: `Regional Officer, AICTE ${ec2Inst.region} Region`, confirmed: `Regional Officer, AICTE ${ec2Inst.region} Region`, matchStatus: "MATCH", source: "MOCK_CBS_API" },
    },
    discrepancies: [
      {
        id: "flag-ec2-expired",
        fdrId: "fdr-ec-02-matured-overdue",
        ruleCode: "EXPIRED_INSTRUMENT",
        severity: "HIGH",
        title: "Instrument Overdue / Matured Without Renewal",
        reason: "Instrument matured 45 days ago on 2026-09-15. Active security deposit coverage has lapsed.",
        evidence: { field: "maturityDate", declaredValue: ec2Maturity, technicalDetails: "Lapsed 45 days. Renewal demand notice pending." },
        resolved: false,
        createdAt: "2026-09-16T00:00:00Z",
      },
    ],
    documents: [],
  });

  // Edge Case 3: Duplicate FDR collision across institutions
  const ec3InstA = institutions[2];
  const ec3InstB = institutions[3];
  const dupFdrNum = "FDR-2024-COLLISION-991";
  fdrs.push({
    id: "fdr-ec-03-dup-a",
    institutionId: ec3InstA.id,
    fdrNumber: dupFdrNum,
    bankName: "Canara Bank",
    branchName: "Town Hall Branch",
    ifscCode: "CNRB0001092",
    amount: 1500000,
    issueDate: "2024-03-01",
    maturityDate: "2034-03-01",
    tenureMonths: 120,
    jointAccountHolder: `Regional Officer, AICTE ${ec3InstA.region} Region`,
    lienMarked: true,
    status: "DEFICIENT",
    verificationStatus: "MISMATCH",
    attentionScore: 90,
    currentEscalationTier: "BUREAU_HEAD",
    daysIdleInTier: 8,
    lastActionAt: "2026-10-22T09:30:00Z",
    autoRenewEligible: false,
    provenance: {
      fdrNumber: { declared: dupFdrNum, confirmed: dupFdrNum, matchStatus: "MATCH", source: "MOCK_CBS_API" },
      bankName: { declared: "Canara Bank", confirmed: "Canara Bank", matchStatus: "MATCH", source: "MOCK_CBS_API" },
      branchName: { declared: "Town Hall Branch", confirmed: "Town Hall Branch", matchStatus: "MATCH", source: "MOCK_CBS_API" },
      ifscCode: { declared: "CNRB0001092", confirmed: "CNRB0001092", matchStatus: "MATCH", source: "MOCK_CBS_API" },
      amount: { declared: 1500000, confirmed: 1500000, matchStatus: "MATCH", source: "MOCK_CBS_API" },
      issueDate: { declared: "2024-03-01", confirmed: "2024-03-01", matchStatus: "MATCH", source: "MOCK_CBS_API" },
      maturityDate: { declared: "2034-03-01", confirmed: "2034-03-01", matchStatus: "MATCH", source: "MOCK_CBS_API" },
      lienMarked: { declared: true, confirmed: true, matchStatus: "MATCH", source: "MOCK_CBS_API" },
      jointAccountHolder: { declared: `Regional Officer, AICTE`, confirmed: `Regional Officer, AICTE`, matchStatus: "MATCH", source: "MOCK_CBS_API" },
    },
    discrepancies: [
      {
        id: "flag-ec3-dup-a",
        fdrId: "fdr-ec-03-dup-a",
        ruleCode: "DUPLICATE_FDR",
        severity: "CRITICAL",
        title: "Cross-Institutional Instrument Collision",
        reason: `Duplicate instrument collision: FDR number "${dupFdrNum}" at "Canara Bank" also pledged by institution ${ec3InstB.name} (${ec3InstB.id}).`,
        evidence: { field: "fdrNumber", declaredValue: dupFdrNum, technicalDetails: "Cross-entity collision detected in central repository." },
        resolved: false,
        createdAt: "2026-10-20T14:00:00Z",
      },
    ],
    documents: [],
  });

  fdrs.push({
    id: "fdr-ec-03-dup-b",
    institutionId: ec3InstB.id,
    fdrNumber: dupFdrNum,
    bankName: "Canara Bank",
    branchName: "Town Hall Branch",
    ifscCode: "CNRB0001092",
    amount: 1500000,
    issueDate: "2024-03-01",
    maturityDate: "2034-03-01",
    tenureMonths: 120,
    jointAccountHolder: `Regional Officer, AICTE ${ec3InstB.region} Region`,
    lienMarked: true,
    status: "DEFICIENT",
    verificationStatus: "MISMATCH",
    attentionScore: 90,
    currentEscalationTier: "BUREAU_HEAD",
    daysIdleInTier: 8,
    lastActionAt: "2026-10-22T09:30:00Z",
    autoRenewEligible: false,
    provenance: {
      fdrNumber: { declared: dupFdrNum, confirmed: dupFdrNum, matchStatus: "MATCH", source: "MOCK_CBS_API" },
      bankName: { declared: "Canara Bank", confirmed: "Canara Bank", matchStatus: "MATCH", source: "MOCK_CBS_API" },
      branchName: { declared: "Town Hall Branch", confirmed: "Town Hall Branch", matchStatus: "MATCH", source: "MOCK_CBS_API" },
      ifscCode: { declared: "CNRB0001092", confirmed: "CNRB0001092", matchStatus: "MATCH", source: "MOCK_CBS_API" },
      amount: { declared: 1500000, confirmed: 1500000, matchStatus: "MATCH", source: "MOCK_CBS_API" },
      issueDate: { declared: "2024-03-01", confirmed: "2024-03-01", matchStatus: "MATCH", source: "MOCK_CBS_API" },
      maturityDate: { declared: "2034-03-01", confirmed: "2034-03-01", matchStatus: "MATCH", source: "MOCK_CBS_API" },
      lienMarked: { declared: true, confirmed: true, matchStatus: "MATCH", source: "MOCK_CBS_API" },
      jointAccountHolder: { declared: `Regional Officer, AICTE`, confirmed: `Regional Officer, AICTE`, matchStatus: "MATCH", source: "MOCK_CBS_API" },
    },
    discrepancies: [
      {
        id: "flag-ec3-dup-b",
        fdrId: "fdr-ec-03-dup-b",
        ruleCode: "DUPLICATE_FDR",
        severity: "CRITICAL",
        title: "Cross-Institutional Instrument Collision",
        reason: `Duplicate instrument collision: FDR number "${dupFdrNum}" at "Canara Bank" also pledged by institution ${ec3InstA.name} (${ec3InstA.id}).`,
        evidence: { field: "fdrNumber", declaredValue: dupFdrNum, technicalDetails: "Cross-entity collision detected in central repository." },
        resolved: false,
        createdAt: "2026-10-20T14:00:00Z",
      },
    ],
    documents: [],
  });

  // Edge Case 4: Bank vs IFSC prefix mismatch
  const ec4Inst = institutions[4];
  fdrs.push({
    id: "fdr-ec-04-ifsc-mismatch",
    institutionId: ec4Inst.id,
    fdrNumber: "FDR-2023-SBI-41908",
    bankName: "State Bank of India",
    branchName: "Industrial Finance Branch",
    ifscCode: "HDFC0001234", // Mismatch!
    amount: 3500000,
    issueDate: "2023-08-10",
    maturityDate: "2033-08-10",
    tenureMonths: 120,
    jointAccountHolder: `Regional Officer, AICTE`,
    lienMarked: true,
    status: "DEFICIENT",
    verificationStatus: "MISMATCH",
    attentionScore: 75,
    currentEscalationTier: "SCRUTINY_OFFICER",
    daysIdleInTier: 3,
    lastActionAt: "2026-10-27T12:00:00Z",
    autoRenewEligible: false,
    provenance: {
      fdrNumber: { declared: "FDR-2023-SBI-41908", confirmed: undefined, matchStatus: "UNVERIFIED", source: "INSTITUTION_DECLARED" },
      bankName: { declared: "State Bank of India", confirmed: undefined, matchStatus: "UNVERIFIED", source: "INSTITUTION_DECLARED" },
      branchName: { declared: "Industrial Finance Branch", confirmed: undefined, matchStatus: "UNVERIFIED", source: "INSTITUTION_DECLARED" },
      ifscCode: { declared: "HDFC0001234", confirmed: undefined, matchStatus: "MISMATCH", source: "INSTITUTION_DECLARED" },
      amount: { declared: 3500000, confirmed: undefined, matchStatus: "UNVERIFIED", source: "INSTITUTION_DECLARED" },
      issueDate: { declared: "2023-08-10", confirmed: undefined, matchStatus: "UNVERIFIED", source: "INSTITUTION_DECLARED" },
      maturityDate: { declared: "2033-08-10", confirmed: undefined, matchStatus: "UNVERIFIED", source: "INSTITUTION_DECLARED" },
      lienMarked: { declared: true, confirmed: undefined, matchStatus: "UNVERIFIED", source: "INSTITUTION_DECLARED" },
      jointAccountHolder: { declared: "Regional Officer, AICTE", confirmed: undefined, matchStatus: "UNVERIFIED", source: "INSTITUTION_DECLARED" },
    },
    discrepancies: [
      {
        id: "flag-ec4-ifsc",
        fdrId: "fdr-ec-04-ifsc-mismatch",
        ruleCode: "BANK_IFSC_MISMATCH",
        severity: "CRITICAL",
        title: "Banking Institution vs IFSC Prefix Conflict",
        reason: 'Issuing bank "State Bank of India" expected IFSC prefix SBIN, but received "HDFC".',
        evidence: { field: "ifscCode", declaredValue: "HDFC0001234", expectedOrConfirmedValue: "SBIN" },
        resolved: false,
        createdAt: "2026-10-27T12:00:00Z",
      },
    ],
    documents: [],
  });

  // Edge Case 5: Release requested but BLOCKED by open discrepancy (P0 Workflow Rule)
  const ec5Inst = institutions[5];
  fdrs.push({
    id: "fdr-ec-05-release-blocked",
    institutionId: ec5Inst.id,
    fdrNumber: "FDR-2016-BOB-90214",
    bankName: "Bank of Baroda",
    branchName: "Mid-Corporate Branch",
    ifscCode: "BARB0MIDCOR",
    amount: 2500000,
    issueDate: "2016-08-01",
    maturityDate: "2026-08-01", // Matured, completed 10 years
    tenureMonths: 120,
    jointAccountHolder: `Regional Officer, AICTE`,
    lienMarked: false, // Discrepancy!
    status: "RELEASE_REQUESTED",
    verificationStatus: "MISMATCH",
    attentionScore: 82,
    currentEscalationTier: "REGIONAL_OFFICER",
    daysIdleInTier: 7,
    lastActionAt: "2026-10-23T14:30:00Z",
    autoRenewEligible: false,
    provenance: {
      fdrNumber: { declared: "FDR-2016-BOB-90214", confirmed: "FDR-2016-BOB-90214", matchStatus: "MATCH", source: "MOCK_CBS_API" },
      bankName: { declared: "Bank of Baroda", confirmed: "Bank of Baroda", matchStatus: "MATCH", source: "MOCK_CBS_API" },
      branchName: { declared: "Mid-Corporate Branch", confirmed: "Mid-Corporate Branch", matchStatus: "MATCH", source: "MOCK_CBS_API" },
      ifscCode: { declared: "BARB0MIDCOR", confirmed: "BARB0MIDCOR", matchStatus: "MATCH", source: "MOCK_CBS_API" },
      amount: { declared: 2500000, confirmed: 2500000, matchStatus: "MATCH", source: "MOCK_CBS_API" },
      issueDate: { declared: "2016-08-01", confirmed: "2016-08-01", matchStatus: "MATCH", source: "MOCK_CBS_API" },
      maturityDate: { declared: "2026-08-01", confirmed: "2026-08-01", matchStatus: "MATCH", source: "MOCK_CBS_API" },
      lienMarked: { declared: false, confirmed: false, matchStatus: "MATCH", source: "MOCK_CBS_API" },
      jointAccountHolder: { declared: "Regional Officer, AICTE", confirmed: "None (Sole Holding)", matchStatus: "MISMATCH", source: "MOCK_CBS_API" },
    },
    discrepancies: [
      {
        id: "flag-ec5-lien",
        fdrId: "fdr-ec-05-release-blocked",
        ruleCode: "LIEN_NOT_MARKED",
        severity: "CRITICAL",
        title: "AICTE Lien Notation Missing in Core Banking",
        reason: "Core banking confirmation indicates deposit was created in trust sole name without official AICTE lien lock.",
        evidence: { field: "lienMarked", declaredValue: false, expectedOrConfirmedValue: true },
        resolved: false,
        createdAt: "2026-08-05T10:00:00Z",
      },
    ],
    documents: [],
    releaseRequest: {
      id: "rel-ec-05",
      fdrId: "fdr-ec-05-release-blocked",
      requestedAt: "2026-10-10T11:00:00Z",
      requestedBy: ec5Inst.authorizedSignatoryName,
      applicantJustification: "Tenure of 10 years completed on 01 Aug 2026. Requesting final refund of deposit.",
      status: "UNDER_SCRUTINY",
    },
  });

  // Edge Case 6: Release Ready for Final Bureau Head Approval (Recommended by RO)
  const ec6Inst = institutions[6];
  fdrs.push({
    id: "fdr-ec-06-release-ready",
    institutionId: ec6Inst.id,
    fdrNumber: "FDR-2016-UBI-12904",
    bankName: "Union Bank of India",
    branchName: "Capital Market Branch",
    ifscCode: "UBIN0541290",
    amount: 3500000,
    issueDate: "2016-09-01",
    maturityDate: "2026-09-01",
    tenureMonths: 120,
    jointAccountHolder: `Regional Officer, AICTE Northern Region`,
    lienMarked: true,
    status: "RELEASE_RECOMMENDED",
    verificationStatus: "BANK_CONFIRMED",
    attentionScore: 40,
    currentEscalationTier: "BUREAU_HEAD",
    daysIdleInTier: 2,
    lastActionAt: "2026-10-28T16:00:00Z",
    autoRenewEligible: false,
    provenance: {
      fdrNumber: { declared: "FDR-2016-UBI-12904", confirmed: "FDR-2016-UBI-12904", matchStatus: "MATCH", source: "MOCK_CBS_API" },
      bankName: { declared: "Union Bank of India", confirmed: "Union Bank of India", matchStatus: "MATCH", source: "MOCK_CBS_API" },
      branchName: { declared: "Capital Market Branch", confirmed: "Capital Market Branch", matchStatus: "MATCH", source: "MOCK_CBS_API" },
      ifscCode: { declared: "UBIN0541290", confirmed: "UBIN0541290", matchStatus: "MATCH", source: "MOCK_CBS_API" },
      amount: { declared: 3500000, confirmed: 3500000, matchStatus: "MATCH", source: "MOCK_CBS_API" },
      issueDate: { declared: "2016-09-01", confirmed: "2016-09-01", matchStatus: "MATCH", source: "MOCK_CBS_API" },
      maturityDate: { declared: "2026-09-01", confirmed: "2026-09-01", matchStatus: "MATCH", source: "MOCK_CBS_API" },
      lienMarked: { declared: true, confirmed: true, matchStatus: "MATCH", source: "MOCK_CBS_API" },
      jointAccountHolder: { declared: "Regional Officer, AICTE Northern Region", confirmed: "Regional Officer, AICTE Northern Region", matchStatus: "MATCH", source: "MOCK_CBS_API" },
    },
    discrepancies: [],
    documents: [
      {
        id: "doc-ec6-affidavit",
        fdrId: "fdr-ec-06-release-ready",
        name: "Release_Affidavit_Notarized.pdf",
        type: "RELEASE_AFFIDAVIT",
        version: 1,
        uploadedAt: "2026-09-10T10:00:00Z",
        uploadedBy: "Institution Principal",
        fileSizeKb: 1204,
        mimeType: "application/pdf",
        downloadUrl: "/sample-affidavit.pdf",
      },
    ],
    releaseRequest: {
      id: "rel-ec-06",
      fdrId: "fdr-ec-06-release-ready",
      requestedAt: "2026-09-10T10:00:00Z",
      requestedBy: ec6Inst.authorizedSignatoryName,
      applicantJustification: "10-year term completed satisfactorily with continuous approval compliance. Requesting deposit discharge.",
      status: "RO_RECOMMENDED",
      roRecommendationNote: "Verified permanent campus functioning and zero pending student complaints. Recommended for discharge.",
      roRecommendedAt: "2026-10-28T16:00:00Z",
      roRecommendedBy: "Rajesh Kumar Verma (RO)",
    },
  });

  // 3. Generate remaining realistic FDRs to reach 140 instruments
  const targetTotal = 140;
  const currentCount = fdrs.length; // 7 already created

  for (let i = currentCount; i < targetTotal; i++) {
    const inst = institutions[i % institutions.length];
    const bank = banks[i % banks.length];
    const tenureMonths = 120; // 10 years
    
    // Spread maturities over past, near future, and long future
    // Distribution:
    // 15% expiring in 1-90 days
    // 10% matured in past
    // 70% active healthy (1-8 years remaining)
    // 5% with subtle discrepancies
    const mode = i % 20;
    let daysToMaturity = 1200; // default healthy
    let status: FdrStatus = "ACTIVE";
    let verificationStatus: VerificationStatus = "BANK_CONFIRMED";
    let flags: DiscrepancyFlag[] = [];

    if (mode === 0 || mode === 1) {
      // Near expiring (15-60 days)
      daysToMaturity = 15 + (i * 3) % 45;
      status = "EXPIRING";
    } else if (mode === 2) {
      // Expired/Matured
      daysToMaturity = -(10 + (i * 2) % 40);
      status = "MATURED";
      flags.push({
        id: `flag-gen-${i}-expired`,
        fdrId: `fdr-gen-${i}`,
        ruleCode: "EXPIRED_INSTRUMENT",
        severity: "HIGH",
        title: "Instrument Overdue / Matured Without Renewal",
        reason: `Deposit matured ${Math.abs(daysToMaturity)} days ago without renewal.`,
        evidence: { field: "maturityDate", declaredValue: addDays(baseDate, daysToMaturity) },
        resolved: false,
        createdAt: addDays(baseDate, daysToMaturity + 1) + "T00:00:00Z",
      });
    } else if (mode === 3) {
      // Pending verification / new intake
      daysToMaturity = 3600;
      status = "PENDING_VERIFICATION";
      verificationStatus = "VERIFICATION_PENDING";
    } else if (mode === 4) {
      // Unmarked lien flag
      daysToMaturity = 800;
      status = "DEFICIENT";
      verificationStatus = "MISMATCH";
      flags.push({
        id: `flag-gen-${i}-lien`,
        fdrId: `fdr-gen-${i}`,
        ruleCode: "LIEN_NOT_MARKED",
        severity: "CRITICAL",
        title: "AICTE Lien Notation Missing in Core Banking",
        reason: "Core banking records show deposit is unpledged.",
        evidence: { field: "lienMarked", declaredValue: false, expectedOrConfirmedValue: true },
        resolved: false,
        createdAt: addDays(baseDate, -20) + "T10:00:00Z",
      });
    } else {
      // Healthy active
      daysToMaturity = 180 + (i * 29) % 2800;
      status = "ACTIVE";
    }

    const maturityDate = addDays(baseDate, daysToMaturity);
    const issueDate = addDays(new Date(maturityDate), -tenureMonths * 30.5);
    const fdrNumber = `FDR-${issueDate.substring(0, 4)}-${bank.ifscPrefix}-${(10000 + i * 79).toString()}`;
    const amount = (inst.category === "Engineering & Technology" ? 3500000 : 1500000);
    const ifscCode = `${bank.ifscPrefix}0${(1000 + (i % 800)).toString().padStart(5, "0")}`;

    // Provenance
    const isMismatch = verificationStatus === "MISMATCH";
    const isUnverified = verificationStatus === "VERIFICATION_PENDING" || (verificationStatus as string) === "UNVERIFIED";

    const fdrRecord: FdrInstrument = {
      id: `fdr-gen-${(i + 1).toString().padStart(4, "0")}`,
      institutionId: inst.id,
      fdrNumber,
      bankName: bank.name,
      branchName: bank.branch,
      ifscCode,
      amount,
      issueDate,
      maturityDate,
      tenureMonths,
      jointAccountHolder: `Regional Officer, AICTE ${inst.region} Region`,
      lienMarked: flags.some((f) => f.ruleCode === "LIEN_NOT_MARKED") ? false : true,
      status,
      verificationStatus,
      attentionScore: status === "MATURED" ? 75 : status === "EXPIRING" ? 60 : flags.length > 0 ? 70 : 15,
      currentEscalationTier: status === "MATURED" ? "REGIONAL_OFFICER" : "SCRUTINY_OFFICER",
      daysIdleInTier: (i % 8),
      lastActionAt: addDays(baseDate, -(i % 14)) + "T10:00:00Z",
      autoRenewEligible: status === "EXPIRING",
      provenance: {
        fdrNumber: { declared: fdrNumber, confirmed: isUnverified ? undefined : fdrNumber, matchStatus: isUnverified ? "UNVERIFIED" : "MATCH", source: isUnverified ? "INSTITUTION_DECLARED" : "MOCK_CBS_API" },
        bankName: { declared: bank.name, confirmed: isUnverified ? undefined : bank.name, matchStatus: isUnverified ? "UNVERIFIED" : "MATCH", source: isUnverified ? "INSTITUTION_DECLARED" : "MOCK_CBS_API" },
        branchName: { declared: bank.branch, confirmed: isUnverified ? undefined : bank.branch, matchStatus: isUnverified ? "UNVERIFIED" : "MATCH", source: isUnverified ? "INSTITUTION_DECLARED" : "MOCK_CBS_API" },
        ifscCode: { declared: ifscCode, confirmed: isUnverified ? undefined : ifscCode, matchStatus: isUnverified ? "UNVERIFIED" : "MATCH", source: isUnverified ? "INSTITUTION_DECLARED" : "MOCK_CBS_API" },
        amount: { declared: amount, confirmed: isUnverified ? undefined : (isMismatch ? Math.round(amount * 0.9) : amount), matchStatus: isUnverified ? "UNVERIFIED" : (isMismatch ? "MISMATCH" : "MATCH"), source: isUnverified ? "INSTITUTION_DECLARED" : "MOCK_CBS_API" },
        issueDate: { declared: issueDate, confirmed: isUnverified ? undefined : issueDate, matchStatus: isUnverified ? "UNVERIFIED" : "MATCH", source: isUnverified ? "INSTITUTION_DECLARED" : "MOCK_CBS_API" },
        maturityDate: { declared: maturityDate, confirmed: isUnverified ? undefined : maturityDate, matchStatus: isUnverified ? "UNVERIFIED" : "MATCH", source: isUnverified ? "INSTITUTION_DECLARED" : "MOCK_CBS_API" },
        lienMarked: { declared: true, confirmed: isUnverified ? undefined : (flags.some((f) => f.ruleCode === "LIEN_NOT_MARKED") ? false : true), matchStatus: isUnverified ? "UNVERIFIED" : (flags.some((f) => f.ruleCode === "LIEN_NOT_MARKED") ? "MISMATCH" : "MATCH"), source: isUnverified ? "INSTITUTION_DECLARED" : "MOCK_CBS_API" },
        jointAccountHolder: { declared: `Regional Officer, AICTE ${inst.region} Region`, confirmed: isUnverified ? undefined : `Regional Officer, AICTE ${inst.region} Region`, matchStatus: isUnverified ? "UNVERIFIED" : "MATCH", source: isUnverified ? "INSTITUTION_DECLARED" : "MOCK_CBS_API" },
      },
      discrepancies: flags,
      documents: [
        {
          id: `doc-${fdrNumber}-fdr`,
          fdrId: `fdr-gen-${(i + 1).toString().padStart(4, "0")}`,
          name: `${bank.ifscPrefix}_FixedDeposit_Certificate.pdf`,
          type: "FDR_RECEIPT",
          version: 1,
          uploadedAt: issueDate + "T11:00:00Z",
          uploadedBy: inst.authorizedSignatoryName,
          fileSizeKb: 720 + (i * 13) % 400,
          mimeType: "application/pdf",
          downloadUrl: "/sample-fdr.pdf",
        },
      ],
    };

    fdrs.push(fdrRecord);

    if (i < 20) {
      appendAuditLog(
        fdrRecord.id,
        "FDR_SUBMITTED",
        "INSTITUTION_USER",
        inst.authorizedSignatoryName,
        `usr-${inst.id}`,
        `Term deposit certificate ${fdrNumber} submitted. Principal INR ${amount.toLocaleString("en-IN")}.`,
        issueDate + "T11:00:00Z"
      );
    }
  }

  // Update institution aggregations and populate FDR institution details
  const instMap = new Map(institutions.map((i) => [i.id, i]));
  fdrs.forEach((fdr) => {
    const inst = instMap.get(fdr.institutionId);
    if (inst) {
      fdr.institutionName = inst.name;
      fdr.institutionAicteId = inst.aicteId;
      fdr.institutionRegion = inst.region;
    }
    // Calculate deterministic attention score dynamically
    fdr.attentionScore = calculateAttentionScore(fdr).totalScore;
  });

  institutions.forEach((inst) => {
    const matching = fdrs.filter((f) => f.institutionId === inst.id);
    inst.fdrCount = matching.length;
    inst.totalDepositSum = matching.reduce((acc, curr) => acc + curr.amount, 0);
  });

  return { institutions, fdrs, auditLogs };
}
