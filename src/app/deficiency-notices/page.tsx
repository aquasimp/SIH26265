"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  FileText,
  Clock,
  Building,
  CheckCircle2,
  Send,
  ExternalLink,
  Download,
} from "lucide-react";

export default function DeficiencyNoticesPage() {
  const notices = [
    {
      id: "DN-2026-NW-0842-01",
      institution: "Apex Institute of Technology & Management",
      pid: "1-3948201",
      dossierId: "AICTE - 2026 - NW - 0842",
      type: "SPATIAL_DEFICIT",
      severity: "CRITICAL",
      title: "Statutory Built-up Floor Deficit under APH 2024–27 Chapter VII",
      description:
        "Proposed intake expansion of 360 UG + 90 PG students requires 10,512.5 m² built-up area. Extracted blueprint vectors demonstrate 8,530.0 m², resulting in a net shortfall of 1,982.5 m² (18.9% deficit).",
      clauseRef: "APH Chapter VII Clause 7.1 & Table 7.1 (Normative Space Requirements)",
      issuedDate: "28 Oct 2026",
      cureDeadline: "15 Nov 2026",
      status: "RESPONSE_PENDING",
      actions: ["Inspect Blueprint", "Download Notice PDF", "Schedule Physical Scrutiny"],
    },
    {
      id: "DN-2026-NW-0842-02",
      institution: "Apex Institute of Technology & Management",
      pid: "1-3948201",
      dossierId: "AICTE - 2026 - NW - 0842",
      type: "LAND_FSI_DEFICIT",
      severity: "HIGH",
      title: "Municipal Land Area Deficit (Urban Floor Mandate)",
      description:
        "Sanctioned plot size of 2.15 Acres falls short of the statutory 2.50 Acres requirement under municipal FSI 2.0 urban norms. Deficit of -0.35 Acres requires submission of urban local body FAR concession certificate.",
      clauseRef: "APH Chapter I Clause 1.4 & Municipal Master Plan 2031",
      issuedDate: "29 Oct 2026",
      cureDeadline: "15 Nov 2026",
      status: "EVIDENCE_SUBMITTED",
      actions: ["Review ULB Certificate", "Verify Land Contiguity"],
    },
  ];

  return (
    <div className="space-y-5 max-w-full animate-glass-in select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            REGULATORY ENFORCEMENT CELL
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Deficiency Notices & Rectification Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Statutory discrepancy notices issued under AICTE Approval Process Handbook (APH 2024–27).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/blueprint-analysis"
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Blueprint Vectorizer Studio</span>
          </Link>
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 border-l-4 border-l-rose-500"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                  {notice.id}
                </span>
                <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {notice.severity}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {notice.institution} ({notice.dossierId})
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {notice.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {notice.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400 pt-1">
                <span>Norm: {notice.clauseRef}</span>
                <span>•</span>
                <span>Issued: {notice.issuedDate}</span>
                <span>•</span>
                <span className="text-rose-600 font-semibold">Cure Deadline: {notice.cureDeadline}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 lg:w-48">
              <Link
                href="/blueprint-analysis"
                className="w-full py-2 px-3 text-center rounded-xl text-xs font-bold bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 transition-colors"
              >
                Inspect Geometry Vector
              </Link>
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Notice PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

