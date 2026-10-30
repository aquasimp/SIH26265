"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { DEMO_USERS, ROLE_PERMISSIONS, UserRole } from "@/types/rbac";
import {
  Users,
  ShieldCheck,
  Check,
  X,
  UserCheck,
  Building,
  KeyRound,
  FileCheck,
  Info,
} from "lucide-react";

export default function UsersAndRolesPage() {
  const { currentRole, setRole } = useApp();

  const roleEntries: { role: UserRole; title: string; description: string; user: any }[] = [
    {
      role: "REGIONAL_OFFICER",
      title: "Regional Officer (RO)",
      description: "Regional scrutiny officer conducting jurisdictional checks, discrepancy review, and release endorsements.",
      user: DEMO_USERS.REGIONAL_OFFICER,
    },
    {
      role: "SCRUTINY_OFFICER",
      title: "Scrutiny Officer",
      description: "Technical officer at AICTE HQ performing document intake, OCR scrutiny, and discrepancy resolution.",
      user: DEMO_USERS.SCRUTINY_OFFICER,
    },
    {
      role: "INSTITUTION_USER",
      title: "Institution User (Principal / Trust)",
      description: "Authorized college representative registering deposits, filing renewals, and submitting release requests.",
      user: DEMO_USERS.INSTITUTION_USER,
    },
    {
      role: "BUREAU_HEAD",
      title: "Bureau Head (Competent Authority)",
      description: "Apex administrative authority sanctioning final FDR discharge orders and approving policy configurations.",
      user: DEMO_USERS.BUREAU_HEAD,
    },
    {
      role: "AUDITOR",
      title: "Statutory Auditor (CAG / Vigilance)",
      description: "Independent audit authority inspecting cryptographic hash chains with masked financial PII view.",
      user: DEMO_USERS.AUDITOR,
    },
  ];

  const permissionKeys: { key: keyof typeof ROLE_PERMISSIONS["REGIONAL_OFFICER"]; label: string }[] = [
    { key: "canSubmitFdr", label: "Submit New FDR Certificate" },
    { key: "canVerifyFdr", label: "Execute Bank CBS Verification" },
    { key: "canOverrideDiscrepancy", label: "Resolve / Override Discrepancy" },
    { key: "canRequestRelease", label: "Submit Release / Refund Request" },
    { key: "canRecommendRelease", label: "Endorse Regional Release Recommendation" },
    { key: "canApproveRelease", label: "Sanction Bureau Head Discharge Order" },
    { key: "canViewAuditChain", label: "Inspect Cryptographic SHA-256 Ledger" },
    { key: "canExportReports", label: "Export Regulatory Reports (CSV / Ledger)" },
    { key: "canModifySystemSettings", label: "Update Regulatory Norms & Settings" },
    { key: "canViewUnmaskedSensitiveData", label: "View Unmasked Account & CIF Numbers" },
  ];

  return (
    <div className="space-y-6 select-none animate-glass-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
            ADMINISTRATION · ROLE-BASED ACCESS CONTROL
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            User & Role Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Demonstration role simulator and permission privilege matrix under AICTE Delegation of Financial Powers.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200/60 rounded-xl text-xs text-blue-700 font-semibold self-start sm:self-auto">
          <UserCheck className="w-4 h-4 text-blue-600" />
          <span>Active Session: {currentRole}</span>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="p-4 bg-slate-100/80 border border-slate-200 rounded-2xl flex items-start gap-3">
        <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 leading-relaxed">
          In this evaluation prototype, authentication uses instant <strong>Role-Switching</strong> to enable jury members to test each perspective (Institution, Scrutiny Officer, Regional Officer, Bureau Head, Auditor) without requiring separate login accounts. In production, this binds to AICTE Single Sign-On (SSO) with PKI certificates.
        </p>
      </div>

      {/* Demo Users Directory (Click to Switch) */}
      <div className="space-y-3">
        <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          <span>Select Role to Test Portal Workflow</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roleEntries.map((item) => {
            const isCurrent = currentRole === item.role;

            return (
              <div
                key={item.role}
                className={`bg-white border rounded-2xl p-4 shadow-xs flex flex-col justify-between transition-all ${
                  isCurrent
                    ? "border-blue-500 ring-2 ring-blue-100 shadow-sm"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10.5px] font-bold text-blue-600 uppercase tracking-wider">
                        {item.role}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 mt-0.5">
                        {item.title}
                      </h3>
                    </div>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 leading-snug">
                    {item.description}
                  </p>

                  <div className="pt-2 text-[11px] text-slate-600 border-t border-slate-100 space-y-0.5">
                    <div><strong>Simulated User:</strong> {item.user.name}</div>
                    <div className="text-slate-400">{item.user.designation} · {item.user.department}</div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setRole(item.role)}
                    disabled={isCurrent}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-slate-100 text-slate-400 cursor-default"
                        : "bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white"
                    }`}
                  >
                    {isCurrent ? "Active In Session" : "Switch To This Role"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comprehensive Permission Matrix */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden space-y-2">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Role Permission Matrix</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Formal privilege mapping enforcing separation of duties under AICTE Financial Governance.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Privilege Function</th>
                <th className="py-3 px-3 text-center">Institution</th>
                <th className="py-3 px-3 text-center">Scrutiny Officer</th>
                <th className="py-3 px-3 text-center">Regional Officer</th>
                <th className="py-3 px-3 text-center">Bureau Head</th>
                <th className="py-3 px-3 text-center">Auditor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {permissionKeys.map((p) => (
                <tr key={p.key} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {p.label}
                  </td>
                  {(["INSTITUTION_USER", "SCRUTINY_OFFICER", "REGIONAL_OFFICER", "BUREAU_HEAD", "AUDITOR"] as UserRole[]).map((r) => {
                    const hasPerm = ROLE_PERMISSIONS[r][p.key];
                    return (
                      <td key={r} className="py-3 px-3 text-center">
                        {hasPerm ? (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

