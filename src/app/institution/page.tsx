"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FdrInstrument, Institution } from "@/types/fdr";
import { formatIndianCurrency, formatIndianDate, formatRemainingTenure } from "@/lib/formatters";
import { CircularValidityRing } from "@/components/fdr/CircularValidityRing";
import { useApp } from "@/context/AppContext";
import {
  SEVERITY_CONFIG,
  mapUrgencyToTier,
} from "@/lib/severity";
import {
  Building2,
  Clock,
  AlertTriangle,
  RotateCw,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export default function InstitutionDeskPage() {
  const { currentRole } = useApp();
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

    // Set institution details
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

  if (loading || !institution) {
    return (
      <div className="p-8 text-center text-xs font-mono text-ink-muted">
        Loading institutional deposit desk...
      </div>
    );
  }

  // Triage flags
  const expiringSoon = fdrs.filter(
    (f) => f.status === "EXPIRING" || f.status === "MATURED"
  );
  const withDiscrepancies = fdrs.filter(
    (f) => (f.discrepancies || []).some((d) => !d.resolved)
  );

  return (
    <div className="space-y-5 sm:space-y-6 max-w-5xl mx-auto">
      {/* Institution Master Header */}
      <div className="p-4 sm:p-5 liquid-glass-card rounded-[22px] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-serif font-bold text-base sm:text-lg text-ink-primary">
              {institution.name}
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-saffron-subtle text-saffron border border-saffron/20">
              AICTE ID: {institution.aicteId}
            </span>
          </div>
          <div className="text-xs text-ink-muted flex items-center gap-1.5 flex-wrap">
            <span>{institution.category}</span>
            <span>•</span>
            <span>{institution.city}, {institution.state} ({institution.region} Region)</span>
            <span>•</span>
            <span>Estd. {institution.establishmentYear}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-ink-border">
          <div className="p-3 bg-paper-100 border border-ink-border rounded-md text-right min-w-[120px]">
            <div className="text-[10px] font-mono text-ink-muted uppercase">Pledged Total</div>
            <div className="font-mono font-bold text-sm text-ink-primary tabular-nums">
              {formatIndianCurrency(fdrs.reduce((acc, curr) => acc + curr.amount, 0))}
            </div>
          </div>
          <div className="p-3 bg-paper-100 border border-ink-border rounded-md text-right min-w-[100px]">
            <div className="text-[10px] font-mono text-ink-muted uppercase">Active Deeds</div>
            <div className="font-mono font-bold text-sm text-botanical">
              {fdrs.length} FDRs
            </div>
          </div>
        </div>
      </div>

      {/* Critical Action Banner: Expiring/Matured Deposits */}
      {expiringSoon.length > 0 && (
        <div className="p-3.5 sm:p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 rounded-lg text-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200 font-serif">
            <Clock className="w-4 h-4 text-saffron shrink-0" />
            <span>Statutory Renewal Required ({expiringSoon.length} Deposit Matured / Expiring)</span>
          </div>
          <p className="text-[11px] text-ink-secondary leading-relaxed">
            As per AICTE Approval Process Handbook (APH 2026), institutions must maintain unbroken statutory security deposits in joint names with the Regional Officer. Please submit renewed 10-year term deposit receipts promptly.
          </p>

          <div className="space-y-2 pt-1">
            {expiringSoon.map((fdr) => (
              <div
                key={fdr.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-paper-100 border border-ink-border rounded-md gap-3"
              >
                <div>
                  <div className="font-mono font-bold text-xs text-ink-primary">
                    {fdr.fdrNumber} (Matures: {formatIndianDate(fdr.maturityDate)})
                  </div>
                  <div className="text-[11px] text-ink-secondary mt-0.5">
                    {fdr.bankName} • Pledged Sum: {formatIndianCurrency(fdr.amount)}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => openRenewalModal(fdr)}
                    className="px-3 py-2 sm:py-1.5 bg-saffron hover:bg-saffron-hover text-white rounded-md font-mono text-xs flex items-center gap-1 shadow-sm min-h-[40px] sm:min-h-0"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Upload 10-Yr Renewal</span>
                  </button>
                  <Link
                    href={`/repository/${fdr.id}`}
                    className="px-3 py-2 sm:py-1.5 border border-ink-border rounded-md bg-paper-100 hover:bg-paper-200 text-ink-primary font-mono text-xs min-h-[40px] sm:min-h-0 flex items-center"
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
        <div className="p-3.5 sm:p-4 bg-red-50 dark:bg-red-950/40 border border-red-300 rounded-lg text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-red-800 dark:text-red-200 font-serif">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>Compliance Observations Requiring Action</span>
          </div>
          <p className="text-[11px] text-ink-secondary">
            AICTE verification cell has flagged {withDiscrepancies.length} deposit record(s). Please inspect the observations and coordinate with your issuing bank branch to rectify the lien endorsement.
          </p>
        </div>
      )}

      {/* Active Portfolio Ledger Table */}
      <div className="liquid-glass-card rounded-[22px] shadow-xs overflow-hidden">
        <div className="px-4 sm:px-5 py-3.5 bg-paper-100 border-b border-ink-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <h3 className="font-serif font-bold text-sm text-ink-primary">
            Institutional Fixed Deposit Holdings
          </h3>
          <span className="font-mono text-xs text-ink-muted">
            Total Pledged: {formatIndianCurrency(fdrs.reduce((a, b) => a + b.amount, 0))}
          </span>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-paper-100 font-mono text-[10px] uppercase text-ink-muted border-b border-ink-border">
              <tr>
                <th className="py-2.5 px-4 font-semibold w-40">Validity</th>
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
                      <span className="text-ink-primary font-semibold whitespace-nowrap">
                        {formatIndianDate(fdr.maturityDate)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-ink-primary">{fdr.fdrNumber}</div>
                    <div className="text-[11px] text-ink-muted">{fdr.bankName}</div>
                  </td>
                  <td className="py-3 px-4 text-ink-primary font-bold whitespace-nowrap tabular-nums">
                    {formatIndianCurrency(fdr.amount)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {fdr.lienMarked ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Registered to AICTE</span>
                      </span>
                    ) : (
                      <span className="text-red-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Unpledged</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-paper-200 border border-ink-border text-ink-primary font-semibold text-[10px]">
                      {fdr.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <Link
                      href={`/repository/${fdr.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-ink-border bg-paper-100 hover:bg-paper-200 text-ink-primary transition-colors text-xs font-sans focus:ring-2 focus:ring-saffron"
                    >
                      <span>Manage</span>
                      <ArrowRight className="w-3 h-3 text-ink-muted" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Card View */}
        <div className="block md:hidden divide-y divide-ink-border p-2 sm:p-3 space-y-3 font-mono">
          {fdrs.map((fdr) => (
            <article
              key={fdr.id}
              className="bg-paper-100/70 border border-ink-border rounded-lg p-3.5 space-y-3 shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <CircularValidityRing maturityDate={fdr.maturityDate} size={42} strokeWidth={3.5} />
                  <div>
                    <div className="font-mono text-xs font-bold text-ink-primary">
                      {formatIndianDate(fdr.maturityDate)}
                    </div>
                    <div className="text-[10px] text-ink-muted">
                      {fdr.bankName}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono text-xs font-bold text-ink-primary tabular-nums">
                    {formatIndianCurrency(fdr.amount)}
                  </div>
                  <span className="mt-1 inline-block px-1.5 py-0.5 rounded bg-paper-200 border border-ink-border text-ink-primary font-semibold text-[9px]">
                    {fdr.status}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-ink-border/60 flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <div className="font-mono font-bold text-xs text-ink-primary">
                    {fdr.fdrNumber}
                  </div>
                  <div className="mt-0.5">
                    {fdr.lienMarked ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Registered to AICTE</span>
                      </span>
                    ) : (
                      <span className="text-red-600 font-bold text-[10px] flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Unpledged</span>
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  href={`/repository/${fdr.id}`}
                  className="inline-flex items-center justify-center gap-1 px-4 text-xs font-sans font-semibold rounded-md border border-ink-border bg-paper-50 hover:bg-paper-200 text-ink-primary min-h-[44px] transition-colors focus:ring-2 focus:ring-saffron"
                >
                  <span>Manage</span>
                  <ArrowRight className="w-3.5 h-3.5 text-ink-muted" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Renewal Submission Modal */}
      {renewalTargetFdr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-4">
          <div className="w-full max-w-md bg-paper-50 border border-ink-border rounded-lg shadow-ledger-elevated p-4 sm:p-5 space-y-4 max-h-[90dvh] overflow-y-auto">
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
                  className="w-full p-2 bg-paper-100 border border-ink-border rounded-md font-bold text-sm sm:text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-ink-muted uppercase">Bank & Branch</label>
                <input
                  type="text"
                  value={renewalForm.bankName}
                  onChange={(e) => setRenewalForm({ ...renewalForm, bankName: e.target.value })}
                  className="w-full p-2 bg-paper-100 border border-ink-border rounded-md text-sm sm:text-xs"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-ink-muted uppercase">Issue Date</label>
                  <input
                    type="date"
                    value={renewalForm.issueDate}
                    onChange={(e) => setRenewalForm({ ...renewalForm, issueDate: e.target.value })}
                    className="w-full p-2 bg-paper-100 border border-ink-border rounded-md text-sm sm:text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-ink-muted uppercase">Maturity Date (+10y)</label>
                  <input
                    type="date"
                    value={renewalForm.maturityDate}
                    onChange={(e) => setRenewalForm({ ...renewalForm, maturityDate: e.target.value })}
                    className="w-full p-2 bg-paper-100 border border-ink-border rounded-md text-sm sm:text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRenewalTargetFdr(null)}
                className="px-3 py-2 text-xs text-ink-secondary hover:text-ink-primary font-mono min-h-[44px] flex items-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteRenewal}
                disabled={isRenewing}
                className="px-4 py-2 text-xs bg-saffron hover:bg-saffron-hover text-white rounded-md font-medium shadow-sm min-h-[44px] flex items-center"
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
