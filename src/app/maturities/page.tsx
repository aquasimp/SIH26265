"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { FdrInstrument } from "@/types/fdr";
import { formatIndianCurrency, formatIndianDate, getDaysRemaining } from "@/lib/formatters";
import { useApp } from "@/context/AppContext";
import {
  Calendar,
  Clock,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  RotateCcw,
  Plus,
  X,
  Building2,
  CalendarDays,
} from "lucide-react";

export default function MaturitiesPage() {
  const { currentRole } = useApp();
  const [fdrs, setFdrs] = useState<FdrInstrument[]>([]);
  const [maturityLadder, setMaturityLadder] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterHorizon, setFilterHorizon] = useState<"ALL" | "7D" | "15D" | "30D" | "90D" | "OVERDUE">("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Renewal Modal State
  const [selectedFdrForRenewal, setSelectedFdrForRenewal] = useState<FdrInstrument | null>(null);
  const [renewalForm, setRenewalForm] = useState({
    fdrNumber: "",
    bankName: "",
    branchName: "",
    ifscCode: "",
    amount: 3500000,
    issueDate: "2026-10-30",
    maturityDate: "2036-10-30",
    tenureMonths: 120,
    lienMarked: true,
  });
  const [isSubmittingRenewal, setIsSubmittingRenewal] = useState(false);
  const [renewalMessage, setRenewalMessage] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/fdrs").then((r) => r.json()),
      fetch("/api/kpi").then((r) => r.json()),
    ])
      .then(([fdrsRes, kpiRes]) => {
        if (fdrsRes.success) setFdrs(fdrsRes.data || []);
        if (kpiRes.success) setMaturityLadder(kpiRes.maturityLadder || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter FDRs by maturity horizon
  const filteredList = useMemo(() => {
    return fdrs
      .filter((f) => {
        if (f.status === "RELEASED") return false;
        const days = getDaysRemaining(f.maturityDate);

        if (filterHorizon === "OVERDUE") return days < 0;
        if (filterHorizon === "7D") return days >= 0 && days <= 7;
        if (filterHorizon === "15D") return days >= 0 && days <= 15;
        if (filterHorizon === "30D") return days >= 0 && days <= 30;
        if (filterHorizon === "90D") return days >= 0 && days <= 90;

        return true;
      })
      .filter((f) => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
          f.fdrNumber.toLowerCase().includes(q) ||
          f.bankName.toLowerCase().includes(q) ||
          (f.institutionName && f.institutionName.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => getDaysRemaining(a.maturityDate) - getDaysRemaining(b.maturityDate));
  }, [fdrs, filterHorizon, searchTerm]);

  // Open renewal modal with pre-populated data
  const handleOpenRenewal = (fdr: FdrInstrument) => {
    setSelectedFdrForRenewal(fdr);
    setRenewalForm({
      fdrNumber: `FDR-${new Date().getFullYear()}-${fdr.ifscCode.substring(0, 4)}-${Math.floor(10000 + Math.random() * 90000)}`,
      bankName: fdr.bankName,
      branchName: fdr.branchName,
      ifscCode: fdr.ifscCode,
      amount: fdr.amount,
      issueDate: new Date().toISOString().split("T")[0],
      maturityDate: new Date(Date.now() + 10 * 365.25 * 24 * 3600 * 1000).toISOString().split("T")[0],
      tenureMonths: 120,
      lienMarked: true,
    });
    setRenewalMessage(null);
  };

  const handleCommitRenewal = async () => {
    if (!selectedFdrForRenewal) return;
    setIsSubmittingRenewal(true);
    setRenewalMessage(null);

    try {
      const res = await fetch(`/api/fdrs/${selectedFdrForRenewal.id}/renewal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": currentRole,
        },
        body: JSON.stringify(renewalForm),
      });
      const data = await res.json();
      if (data.success) {
        setRenewalMessage(`Renewal instrument ${renewalForm.fdrNumber} successfully registered and linked!`);
        setTimeout(() => {
          setSelectedFdrForRenewal(null);
          fetchData();
        }, 1500);
      } else {
        alert(data.error || "Renewal failed");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    } finally {
      setIsSubmittingRenewal(false);
    }
  };

  return (
    <div className="space-y-6 select-none animate-glass-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
            FDR MANAGEMENT · MATURITY SURVEILLANCE
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Maturities & Renewals
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Surveillance of 120-month statutory lock-in periods, upcoming maturities, and replacement instrument filings.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Horizon Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Horizon:
        </span>
        {[
          { code: "ALL", label: "All Active" },
          { code: "7D", label: "Within 7 Days" },
          { code: "15D", label: "Within 15 Days" },
          { code: "30D", label: "Within 30 Days" },
          { code: "90D", label: "Within 90 Days" },
          { code: "OVERDUE", label: "Matured / Overdue" },
        ].map((tab) => (
          <button
            key={tab.code}
            type="button"
            onClick={() => setFilterHorizon(tab.code as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterHorizon === tab.code
                ? "bg-[#2773E1] text-white shadow-2xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 flex items-center gap-2 max-w-md shadow-2xs">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by institution, FDR number or bank..."
          className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Table View */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-blue-600" />
            <span>Instruments Monitored ({filteredList.length})</span>
          </h2>
          <span className="text-[11px] text-slate-500 font-medium">
            AICTE Mandated 120-Month Statutory Escrow
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">FDR & Institution</th>
                <th className="py-3 px-3">Bank & Branch</th>
                <th className="py-3 px-3">Deposit Amount</th>
                <th className="py-3 px-3">Maturity Date</th>
                <th className="py-3 px-3">Days Left</th>
                <th className="py-3 px-3">Current Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredList.length > 0 ? (
                filteredList.map((fdr) => {
                  const days = getDaysRemaining(fdr.maturityDate);
                  const isMatured = days < 0;
                  const isUrgent = days >= 0 && days <= 15;

                  return (
                    <tr key={fdr.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <Link
                          href={`/repository/${fdr.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 transition-colors block truncate max-w-[260px]"
                        >
                          {fdr.institutionName || fdr.institutionId}
                        </Link>
                        <div className="font-mono text-[10.5px] text-slate-500 mt-0.5">
                          {fdr.fdrNumber}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{fdr.bankName}</div>
                        <div className="text-[10.5px] text-slate-400">{fdr.branchName}</div>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        ₹{(fdr.amount / 100000).toFixed(2)} Lakhs
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                        {formatIndianDate(fdr.maturityDate)}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap font-bold">
                        {isMatured ? (
                          <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-[11px]">
                            {Math.abs(days)}d Overdue
                          </span>
                        ) : isUrgent ? (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[11px]">
                            {days} days left
                          </span>
                        ) : (
                          <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-[11px]">
                            {days} days left
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${
                            fdr.status === "MATURED"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : fdr.status === "EXPIRING"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {fdr.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenRenewal(fdr)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                            Submit Renewal
                          </button>
                          <Link
                            href={`/repository/${fdr.id}`}
                            className="p-1 rounded text-slate-400 hover:text-slate-600"
                            title="View FDR Dossier"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No instruments matching the current maturity filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Renewal Submission Modal */}
      {selectedFdrForRenewal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">
                  File Renewal / Replacement FDR
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFdrForRenewal(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
              <div>
                <strong>Predecessor Instrument:</strong> {selectedFdrForRenewal.fdrNumber}
              </div>
              <div>
                <strong>Institution:</strong> {selectedFdrForRenewal.institutionName}
              </div>
              <div>
                <strong>Statutory Amount:</strong> ₹{(selectedFdrForRenewal.amount / 100000).toFixed(2)} Lakhs
              </div>
            </div>

            {renewalMessage ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{renewalMessage}</span>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    New Renewal FDR Number
                  </label>
                  <input
                    type="text"
                    value={renewalForm.fdrNumber}
                    onChange={(e) => setRenewalForm({ ...renewalForm, fdrNumber: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={renewalForm.bankName}
                      onChange={(e) => setRenewalForm({ ...renewalForm, bankName: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={renewalForm.ifscCode}
                      onChange={(e) => setRenewalForm({ ...renewalForm, ifscCode: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2 font-mono text-xs focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">New Maturity Date</label>
                    <input
                      type="date"
                      value={renewalForm.maturityDate}
                      onChange={(e) => setRenewalForm({ ...renewalForm, maturityDate: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Deposit Amount (₹)</label>
                    <input
                      type="number"
                      value={renewalForm.amount}
                      onChange={(e) => setRenewalForm({ ...renewalForm, amount: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedFdrForRenewal(null)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCommitRenewal}
                    disabled={isSubmittingRenewal}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2"
                  >
                    {isSubmittingRenewal && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Commit Replacement FDR</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

