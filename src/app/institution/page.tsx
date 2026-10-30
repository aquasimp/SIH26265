"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FdrInstrument, Institution } from "@/types/fdr";
import { formatIndianCurrency, formatIndianDate, formatRemainingTenure } from "@/lib/formatters";
import { useApp } from "@/context/AppContext";
import {
  Building2,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  Clock,
  RotateCw,
  ExternalLink,
  MapPin,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  X,
  Phone,
  Mail,
  UserCheck,
} from "lucide-react";

interface InstitutionWithStats extends Institution {
  fdrCount: number;
  totalAmount: number;
  activeCount: number;
  maturingCount: number;
  discrepancyCount: number;
  fdrs: FdrInstrument[];
}

export default function InstitutionsPage() {
  const { currentRole } = useApp();
  const [institutions, setInstitutions] = useState<InstitutionWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("ALL");
  const [selectedInst, setSelectedInst] = useState<InstitutionWithStats | null>(null);

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

  const fetchInstitutions = useCallback(() => {
    fetch("/api/institutions")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setInstitutions(data.data);
          // Default selection if available
          if (data.data.length > 0 && !selectedInst) {
            setSelectedInst(data.data[0]);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [selectedInst]);

  useEffect(() => {
    fetchInstitutions();
  }, [fetchInstitutions]);

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
        fetchInstitutions();
      } else {
        alert(data.error || "Renewal failed");
      }
    } finally {
      setIsRenewing(false);
    }
  };

  const filtered = institutions.filter((inst) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      inst.name.toLowerCase().includes(q) ||
      inst.aicteId.toLowerCase().includes(q) ||
      inst.city.toLowerCase().includes(q) ||
      inst.state.toLowerCase().includes(q);
    const matchesRegion = selectedRegion === "ALL" || inst.region.toLowerCase() === selectedRegion.toLowerCase();
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="text-[11px] font-semibold text-blue-600 tracking-wider uppercase mb-1">
          REGULATION BUREAU · INSTITUTION DIRECTORY
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Institutions & Pledged Deposits
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Centralized registry of approved technical institutions, trust profiles, and active joint FDR holdings.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl font-medium shadow-2xs">
              Total: <strong className="text-slate-800">{institutions.length} Institutions</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by college name, AICTE ID, or state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
            <Filter className="h-3.5 w-3.5" />
            <span>Region:</span>
          </div>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">All Regions (Pan-India)</option>
            <option value="Northern">Northern Region</option>
            <option value="Southern">Southern Region</option>
            <option value="Western">Western Region</option>
            <option value="Eastern">Eastern Region</option>
            <option value="Central">Central Region</option>
            <option value="North-Western">North-Western Region</option>
          </select>
        </div>
      </div>

      {/* Two Column Layout: List on Left, Detail Dossier on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Institutions List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">
                Registered Institutions ({filtered.length})
              </span>
              <span className="text-[11px] text-slate-500">
                Select to view dossier
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[700px] overflow-y-auto">
              {filtered.map((inst) => {
                const isSelected = selectedInst?.id === inst.id;
                return (
                  <div
                    key={inst.id}
                    onClick={() => setSelectedInst(inst)}
                    className={`p-4 transition-colors cursor-pointer text-left ${
                      isSelected
                        ? "bg-blue-50/60 border-l-4 border-blue-600"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 truncate">
                          {inst.name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono">{inst.aicteId}</span>
                          <span>•</span>
                          <span>{inst.city}, {inst.state}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
                        {inst.fdrCount} FDRs
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-100/70">
                      <span className="text-slate-500">
                        Total Pledged: <strong className="text-slate-800 font-mono">{formatIndianCurrency(inst.totalAmount)}</strong>
                      </span>
                      {inst.maturingCount > 0 && (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                          {inst.maturingCount} Due
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400">
                  No institutions match the current search filters.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Institution View */}
        <div className="lg:col-span-7 space-y-5">
          {selectedInst ? (
            <>
              {/* Institution Profile Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">
                        {selectedInst.name}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-semibold text-[11px]">
                        AICTE ID: {selectedInst.aicteId}
                      </span>
                      <span>•</span>
                      <span>{selectedInst.category}</span>
                      <span>•</span>
                      <span>Estd. {selectedInst.establishmentYear}</span>
                    </div>
                  </div>

                  <div className="text-right sm:shrink-0 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Total Statutory Reserves</div>
                    <div className="text-base font-bold text-blue-600 font-mono mt-0.5">
                      {formatIndianCurrency(selectedInst.totalAmount)}
                    </div>
                  </div>
                </div>

                {/* Metadata Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
                    <div className="text-[10px] uppercase text-slate-400 font-semibold">Trust / Sponsoring Society</div>
                    <div className="font-semibold text-slate-800">{selectedInst.trustName}</div>
                  </div>

                  <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
                    <div className="text-[10px] uppercase text-slate-400 font-semibold">Authorized Signatory / Dean</div>
                    <div className="font-semibold text-slate-800">{selectedInst.authorizedSignatoryName}</div>
                  </div>

                  <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
                    <div className="text-[10px] uppercase text-slate-400 font-semibold">Jurisdiction & Regional Office</div>
                    <div className="font-semibold text-slate-800">{selectedInst.region} Regional Office ({selectedInst.state})</div>
                  </div>

                  <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
                    <div className="text-[10px] uppercase text-slate-400 font-semibold">Official Contact</div>
                    <div className="font-semibold text-slate-800 truncate">{selectedInst.contactEmail}</div>
                  </div>
                </div>
              </div>

              {/* Related Fixed Deposit Instruments */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-xs text-slate-900">
                    Pledged FDR Instruments ({selectedInst.fdrs?.length || 0})
                  </h3>
                  <Link
                    href="/intake"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>+ Add New FDR</span>
                  </Link>
                </div>

                <div className="divide-y divide-slate-100">
                  {selectedInst.fdrs && selectedInst.fdrs.length > 0 ? (
                    selectedInst.fdrs.map((fdr) => (
                      <div
                        key={fdr.id}
                        className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-slate-900">
                              {fdr.fdrNumber}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              fdr.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : fdr.status === "EXPIRING"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-slate-100 text-slate-700"
                            }`}>
                              {fdr.status}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500">
                            {fdr.bankName} • {fdr.branchName} ({fdr.ifscCode})
                          </div>

                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span>Maturity: <strong className="text-slate-700 font-mono">{formatIndianDate(fdr.maturityDate)}</strong></span>
                            <span>•</span>
                            <span>{formatRemainingTenure(fdr.maturityDate).label}</span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                          <div className="font-mono font-bold text-sm text-slate-900">
                            {formatIndianCurrency(fdr.amount)}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openRenewalModal(fdr)}
                              className="px-2.5 py-1 text-[11px] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <RotateCw className="h-3 w-3" />
                              <span>Renew</span>
                            </button>
                            <Link
                              href={`/repository/${fdr.id}`}
                              className="px-2.5 py-1 text-[11px] bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                            >
                              <span>Dossier</span>
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No fixed deposit records registered for this institution.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              Select an institution from the directory to view its profile and instruments.
            </div>
          )}
        </div>
      </div>

      {/* 10-Year Statutory Renewal Modal */}
      {renewalTargetFdr && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <RotateCw className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-sm text-slate-900">
                  10-Year Statutory Deposit Renewal Wizard
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setRenewalTargetFdr(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Renewing term deposit for <strong>{selectedInst?.name}</strong>. In accordance with AICTE APH norms, statutory deposits are extended for another 10-year term with tripartite joint lien.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-600">New FDR Reference Number</label>
                <input
                  type="text"
                  value={renewalForm.fdrNumber}
                  onChange={(e) => setRenewalForm({ ...renewalForm, fdrNumber: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">Bank Name</label>
                  <input
                    type="text"
                    value={renewalForm.bankName}
                    onChange={(e) => setRenewalForm({ ...renewalForm, bankName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">Branch IFSC</label>
                  <input
                    type="text"
                    value={renewalForm.ifscCode}
                    onChange={(e) => setRenewalForm({ ...renewalForm, ifscCode: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">Deposit Amount (₹)</label>
                  <input
                    type="number"
                    value={renewalForm.amount}
                    onChange={(e) => setRenewalForm({ ...renewalForm, amount: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">New Maturity Date</label>
                  <input
                    type="date"
                    value={renewalForm.maturityDate}
                    onChange={(e) => setRenewalForm({ ...renewalForm, maturityDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRenewalTargetFdr(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteRenewal}
                disabled={isRenewing}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer shadow-xs"
              >
                {isRenewing ? "Committing Renewal..." : "Submit 10-Year Renewal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
