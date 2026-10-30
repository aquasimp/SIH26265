export type UserRole =
  | "INSTITUTION_USER"
  | "SCRUTINY_OFFICER"
  | "REGIONAL_OFFICER"
  | "BUREAU_HEAD"
  | "AUDITOR";

export interface UserSession {
  id: string;
  name: string;
  role: UserRole;
  designation: string;
  department: string;
  institutionId?: string; // Present if INSTITUTION_USER
  region?: string; // Present if REGIONAL_OFFICER (e.g. "Western", "Northern")
}

export interface PermissionMatrix {
  canSubmitFdr: boolean;
  canVerifyFdr: boolean;
  canOverrideDiscrepancy: boolean;
  canRequestRelease: boolean;
  canRecommendRelease: boolean;
  canApproveRelease: boolean;
  canViewAuditChain: boolean;
  canExportReports: boolean;
  canModifySystemSettings: boolean;
  canViewUnmaskedSensitiveData: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, PermissionMatrix> = {
  INSTITUTION_USER: {
    canSubmitFdr: true,
    canVerifyFdr: false,
    canOverrideDiscrepancy: false,
    canRequestRelease: true,
    canRecommendRelease: false,
    canApproveRelease: false,
    canViewAuditChain: false,
    canExportReports: false,
    canModifySystemSettings: false,
    canViewUnmaskedSensitiveData: false,
  },
  SCRUTINY_OFFICER: {
    canSubmitFdr: false,
    canVerifyFdr: true,
    canOverrideDiscrepancy: true,
    canRequestRelease: false,
    canRecommendRelease: false,
    canApproveRelease: false,
    canViewAuditChain: true,
    canExportReports: true,
    canModifySystemSettings: false,
    canViewUnmaskedSensitiveData: true,
  },
  REGIONAL_OFFICER: {
    canSubmitFdr: false,
    canVerifyFdr: true,
    canOverrideDiscrepancy: true,
    canRequestRelease: false,
    canRecommendRelease: true,
    canApproveRelease: false,
    canViewAuditChain: true,
    canExportReports: true,
    canModifySystemSettings: false,
    canViewUnmaskedSensitiveData: true,
  },
  BUREAU_HEAD: {
    canSubmitFdr: false,
    canVerifyFdr: true,
    canOverrideDiscrepancy: true,
    canRequestRelease: false,
    canRecommendRelease: true,
    canApproveRelease: true, // Only Competent Authority can approve final release
    canViewAuditChain: true,
    canExportReports: true,
    canModifySystemSettings: true,
    canViewUnmaskedSensitiveData: true,
  },
  AUDITOR: {
    canSubmitFdr: false,
    canVerifyFdr: false,
    canOverrideDiscrepancy: false,
    canRequestRelease: false,
    canRecommendRelease: false,
    canApproveRelease: false,
    canViewAuditChain: true,
    canExportReports: true,
    canModifySystemSettings: false,
    canViewUnmaskedSensitiveData: false,
  },
};

export const DEMO_USERS: Record<UserRole, UserSession> = {
  INSTITUTION_USER: {
    id: "usr-inst-01",
    name: "Dr. K. S. Ramanujan",
    role: "INSTITUTION_USER",
    designation: "Principal & Authorized Signatory",
    department: "Aryavarta Institute of Technology",
    institutionId: "inst-north-01",
  },
  SCRUTINY_OFFICER: {
    id: "usr-scrutiny-01",
    name: "Pooja Deshmukh",
    role: "SCRUTINY_OFFICER",
    designation: "Assistant Director (Scrutiny)",
    department: "Regulation Bureau - Verification Cell",
  },
  REGIONAL_OFFICER: {
    id: "usr-ro-west",
    name: "Rajesh Kumar Verma",
    role: "REGIONAL_OFFICER",
    designation: "Regional Officer",
    department: "Western Regional Office (WRO)",
    region: "Western",
  },
  BUREAU_HEAD: {
    id: "usr-bureau-head",
    name: "Prof. Ananya Sengupta",
    role: "BUREAU_HEAD",
    designation: "Adviser-I / Bureau Head",
    department: "Regulation Bureau, AICTE HQ",
  },
  AUDITOR: {
    id: "usr-auditor-01",
    name: "Vikramaditya Nair",
    role: "AUDITOR",
    designation: "Senior Statutory Auditor",
    department: "CAG / Internal Compliance Audit",
  },
};

