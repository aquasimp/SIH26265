"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FdrInstrument, Institution } from "@/types/fdr";
import { formatIndianCurrency, formatIndianDate, formatRemainingTenure } from "@/lib/formatters";
import { CircularValidityRing } from "@/components/fdr/CircularValidityRing";
import { useApp } from "@/context/AppContext";
import {
  Building2,
  Clock,
  AlertTriangle,
  RotateCw,
  KeyRound,
  FileText,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export default function InstitutionDeskPage() {
  const { currentRole, currentUser } = useApp();
  const [fdrs, setFdrs] = useState<FdrInstrument[]>([]);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);

  // Renewal Modal
  const [renewalTargetFdr, setRenewalTargetFdr] = useState<FdrInstrument | null>(null);
  const [renewalForm, setRenewalForm] = useState({
    fdrNumber: "",
    bankName: "",
    branchName: "",
    ifscCode: "",
    amount: 3500000,
    issueDate: "2026-10-30",
    maturityDate: "2036-10-30",
  });
  const [isRenewing, setIsRenewing] = useState(false);

  useEffect(() => {
    // Fetch FDRs for Aryavarta Institute of Technology (inst-001)
    fetch("/api/fdrs?institutionId=inst-001")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFdrs(data.data);
        }
      })
      .finally(() => setLoading(false));

    // Fetch institution details
    setInstitution({
      id: "inst-001",
      aicteId: "1-900000000",
      name: "Aryavarta Institute of Technology & Science",
      region: "Western",
      state: "Maharashtra",
      city: "Hub-1",
      category: "Engineering & Technology",
      establishmentYear: 2005,
      trustName: "Shri Aryavarta Educational & Charitable Foundation",
      authorizedSignatoryName: "Prof. Dr. R. K. Sharma",
      contactEmail: "dean.admin@aryavarta-edu.synthetic.in",
      contactPhone: "+91 9876543210",
    });
  }, []);

  const openRenewalModal = (fdr: FdrInstrument) => {
    setRenewalTargetFdr(fdr);
    setRenewalForm({
      fdrNumber: `FDR-${new Date().getFullYear()}-REN-${Math.floor(1000 + Math.random() * 9000)}`,
      bankName: fdr.bankName,
      branchName: fdr.branchName,
      ifscCode: fdr.ifscCode,
      amount: fdr.amount,
      issueDate: new Date().toISOString().split("T")[0],
      maturityDate: new Date(Date.now() + 10 * 365 * 24 * 3600 * 1000).toISOString().split("T")[0],
    });
  };

  const handleExecuteRenewal = async () => {
    if (!renewalTargetFdr) return;
    setIsRenewing(true);
    try {
      const res = await fetch(`/api/fdrs/${renewalTargetFdr.id}/renewal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": currentRole,
        },
        body: JSON.stringify(renewalForm),
      });
      const data = await res.json();
      if (data.success) {
        setRenewalTargetFdr(null);
        // Refresh list
        const refreshed = await fetch("/api/fdrs?institutionId=inst-001").then((r) => r.json());
        if (refreshed.success) setFdrs(refreshed.data);
      } else {
        alert(data.error || "Renewal failed");
      }
    } finally {
      setIsRenewing(false);
    }
  };

  const activeFdrs = fdrs.filter((f) => f.status === "ACTIVE" || f.status === "EXPIRING");
  const dueForRenewal = fdrs.filter((f) => f.status === "EXPIRING" || f.status === "MATURED");
  const withDiscrepancies = fdrs.filter((f) => (f.discrepancies || []).some((d) => !d.resolved));

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* College Header Card */}
      {institution && (
        <div className="p-5 bg-paper-50 border border-ink-border rounded shadow-ledger flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-saffron text-white flex items-center justify-center font-serif font-bold text-lg">
              AIT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-base text-ink-primary">
                  {institution.name}
                </h2>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-paper-200 border border-ink-border">
                  AICTE ID: {institution.aicteId}
                </span>
              </div>
              <p className="text-xs text-ink-muted">
                {institution.category} • {institution.region} Regional Office (WRO) • Established {institution.establishmentYear}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs border-t md:border-t-0 pt-3 md:pt-0">
            <Link
              href="/intake"
              className="px-3 py-1.5 bg-saffron hover:bg-saffron-hover text-white rounded font-medium shadow-sm flex items-center gap-1.5"
            >
              <span>+ New Deposit Submission</span>
            </Link>
          </div>
        </div>
      )}

      {/* Immediate Attention Dues Alert */}
      {dueForRenewal.length > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 rounded text-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-amber-900 dark:text-amber-200 font-serif">
              <Clock className="w-4 h-4 text-saffron" />
              <span>Action Due: {dueForRenewal.length} Security Deposit(s) Expiring or Lapsed</span>
            </div>
            <span className="font-mono text-[11px] text-saffron font-bold">RENEWAL NOTICE ACTIVE</span>
          </div>

          <div className="space-y-2">
            {dueForRenewal.map((fdr) => (
              <div
                key={fdr.id}
                className="p-3 bg-paper-50 border border-amber-200 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="font-mono font-bold text-ink-primary flex items-center gap-2">
                    <span>{fdr.fdrNumber}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-sans font-medium">
                      Maturity: {formatIndianDate(fdr.maturityDate)}
                    </span>
                  </div>
                  <div className="text-[11px] text-ink-secondary mt-0.5">
                    {fdr.bankName} • Pledged Sum: {formatIndianCurrency(fdr.amount)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openRenewalModal(fdr)}
                    className="px-3 py-1.5 bg-saffron hover:bg-saffron-hover text-white rounded font-mono text-xs flex items-center gap-1 shadow-sm"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Upload 10-Yr Renewal</span>
                  </button>
                  <Link
                    href={`/repository/${fdr.id}`}
                    className="px-2.5 py-1.5 border border-ink-border rounded bg-paper-100 hover:bg-paper-200 text-ink-primary font-mono text-xs"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discrepancies Requiring Response */}
      {withDiscrepancies.length > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-300 rounded text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-red-800 dark:text-red-200 font-serif">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Compliance Observations Requiring Action</span>
          </div>
          <p className="text-[11px] text-ink-secondary">
            AICTE verification cell has flagged {withDiscrepancies.length} deposit record(s). Please inspect the observations and coordinate with your issuing bank branch to rectify the lien endorsement.
          </p>
        </div>
      )}

      {/* Active Portfolio Ledger Table */}
      <div className="border border-ink-border rounded bg-paper-50 shadow-ledger overflow-hidden">
        <div className="px-5 py-3.5 bg-paper-100 border-b border-ink-border flex items-center justify-between">
          <h3 className="font-serif font-bold text-sm text-ink-primary">
            Institutional Fixed Deposit Holdings
          </h3>
          <span className="font-mono text-xs text-ink-muted">
            Total Pledged: {formatIndianCurrency(fdrs.reduce((a, b) => a + b.amount, 0))}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-paper-100 font-mono text-[10px] uppercase text-ink-muted border-b border-ink-border">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Validity</th>
                <th className="py-2.5 px-4 font-semibold">FDR Ref / Issuing Bank</th>
                <th className="py-2.5 px-4 font-semibold">Principal Sum</th>
                <th className="py-2.5 px-4 font-semibold">CBS Lien Status</th>
                <th className="py-2.5 px-4 font-semibold">Treasury Status</th>
                <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-border font-mono">
              {fdrs.map((fdr) => (
                <tr key={fdr.id} className="hover:bg-paper-100/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <CircularValidityRing maturityDate={fdr.maturityDate} size={36} strokeWidth={3.5} />
                      <span className="text-ink-primary font-semibold">
                        {formatIndianDate(fdr.maturityDate)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-ink-primary">{fdr.fdrNumber}</div>
                    <div className="text-[11px] text-ink-muted">{fdr.bankName}</div>
                  </td>
                  <td className="py-3 px-4 text-ink-primary font-bold">
                    {formatIndianCurrency(fdr.amount)}
                  </td>
                  <td className="py-3 px-4">
                    {fdr.lienMarked ? (
                      <span className="text-botanical font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Registered to AICTE</span>
                      </span>
                    ) : (
                      <span className="text-red-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Unpledged</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-paper-200 border border-ink-border text-ink-primary font-semibold text-[10px]">
                      {fdr.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/repository/${fdr.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-ink-border bg-paper-100 hover:bg-paper-200 text-ink-primary transition-colors text-xs font-sans"
                    >
                      <span>Manage</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Renewal Submission Modal */}
      {renewalTargetFdr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-paper-50 border border-ink-border rounded shadow-ledger-elevated p-5 space-y-4">
            <h4 className="font-serif font-bold text-sm text-ink-primary">
              Submit 10-Year Renewal Instrument
            </h4>
            <p className="text-xs text-ink-muted">
              Replacing matured deposit <strong className="font-mono">{renewalTargetFdr.fdrNumber}</strong> with newly created bank term certificate.
            </p>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-[10px] text-ink-muted uppercase">Renewal FDR Number</label>
                <input
                  type="text"
                  value={renewalForm.fdrNumber}
                  onChange={(e) => setRenewalForm({ ...renewalForm, fdrNumber: e.target.value })}
                  className="w-full p-2 bg-paper-100 border border-ink-border rounded font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] text-ink-muted uppercase">Bank & Branch</label>
                <input
                  type="text"
                  value={renewalForm.bankName}
                  onChange={(e) => setRenewalForm({ ...renewalForm, bankName: e.target.value })}
                  className="w-full p-2 bg-paper-100 border border-ink-border rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-ink-muted uppercase">Issue Date</label>
                  <input
                    type="date"
                    value={renewalForm.issueDate}
                    onChange={(e) => setRenewalForm({ ...renewalForm, issueDate: e.target.value })}
                    className="w-full p-2 bg-paper-100 border border-ink-border rounded"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-ink-muted uppercase">Maturity Date (+10y)</label>
                  <input
                    type="date"
                    value={renewalForm.maturityDate}
                    onChange={(e) => setRenewalForm({ ...renewalForm, maturityDate: e.target.value })}
                    className="w-full p-2 bg-paper-100 border border-ink-border rounded"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRenewalTargetFdr(null)}
                className="px-3 py-1.5 text-xs text-ink-secondary hover:text-ink-primary font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRenewal}
                disabled={isRenewing}
                className="px-4 py-1.5 text-xs bg-saffron hover:bg-saffron-hover text-white rounded font-medium shadow-sm"
              >
                {isRenewing ? "Submitting..." : "Submit Renewal Deposit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
