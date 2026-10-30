"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { OcrExtractionPayload } from "@/app/api/ocr-extract/route";
import { formatIndianCurrency } from "@/lib/formatters";
import {
  ScanLine,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Building2,
  HelpCircle,
} from "lucide-react";

export default function OcrIntakePage() {
  const router = useRouter();
  const { currentRole } = useApp();

  const [selectedTemplate, setSelectedTemplate] = useState<"STANDARD_SBI" | "MISMATCH_HDFC_IFSC">("STANDARD_SBI");
  const [isScanning, setIsScanning] = useState(false);
  const [ocrPayload, setOcrPayload] = useState<OcrExtractionPayload | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  // Editable confirmed fields
  const [formFields, setFormFields] = useState({
    fdrNumber: "",
    bankName: "",
    branchName: "",
    ifscCode: "",
    amount: 3500000,
    issueDate: "2024-04-10",
    maturityDate: "2034-04-10",
    tenureMonths: 120,
    jointAccountHolder: "Regional Officer, AICTE Northern Region",
    lienMarked: true,
  });

  const handleRunOcr = async (tpl = selectedTemplate) => {
    setIsScanning(true);
    setOcrPayload(null);
    setSubmissionSuccess(null);

    try {
      const res = await fetch("/api/ocr-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateType: tpl }),
      });
      const data = await res.json();
      if (data.success) {
        setOcrPayload(data.data);
        const f = data.data.extractedFields;
        setFormFields({
          fdrNumber: String(f.fdrNumber.value),
          bankName: String(f.bankName.value),
          branchName: String(f.branchName.value),
          ifscCode: String(f.ifscCode.value),
          amount: Number(f.amount.value),
          issueDate: String(f.issueDate.value),
          maturityDate: String(f.maturityDate.value),
          tenureMonths: Number(f.tenureMonths.value),
          jointAccountHolder: String(f.jointAccountHolder.value),
          lienMarked: Boolean(f.lienMarked.value),
        });
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleCommitLedger = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/fdrs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": currentRole,
        },
        body: JSON.stringify({
          ...formFields,
          institutionId: "inst-001",
          documents: [
            {
              id: `doc-${Date.now()}`,
              name: ocrPayload?.fileName || "Uploaded_FDR_Receipt.pdf",
              type: "FDR_RECEIPT",
              version: 1,
              uploadedAt: new Date().toISOString(),
              uploadedBy: "Institution User (OCR Ingest)",
              fileSizeKb: ocrPayload?.fileSizeKb || 850,
              mimeType: "application/pdf",
              downloadUrl: "/sample-fdr.pdf",
              ocrConfidence: ocrPayload?.overallConfidence || 95,
              metadataAnalysis: ocrPayload?.metadataAnalysis,
            },
          ],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmissionSuccess(data.data.id);
      } else {
        alert(data.error || "Submission failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="text-[11px] font-semibold text-blue-600 tracking-wider uppercase mb-1">
          REGULATION BUREAU · DIGITAL FDR INTAKE
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Submit New Fixed Deposit
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Upload physical deposit receipt for automated OCR extraction, discrepancy detection, and central register onboarding.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Test Scenarios */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-slate-900">
            Select Test Sample Certificate (SIH Demo Presets)
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Demonstrate OCR scanning with authentic vs discrepancy-injected synthetic receipts
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedTemplate("STANDARD_SBI");
              handleRunOcr("STANDARD_SBI");
            }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
              selectedTemplate === "STANDARD_SBI"
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            Sample 1: Authentic Canara Bank (Clean)
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedTemplate("MISMATCH_HDFC_IFSC");
              handleRunOcr("MISMATCH_HDFC_IFSC");
            }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
              selectedTemplate === "MISMATCH_HDFC_IFSC"
                ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            Sample 2: SBI with HDFC IFSC (Discrepancy)
          </button>
        </div>
      </div>

      {/* Main OCR Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Document Scan Surface */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Document Scan Surface</span>
              </span>
              {ocrPayload && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  OCR Confidence: {ocrPayload.overallConfidence}%
                </span>
              )}
            </div>

            {/* Visual Certificate Simulation */}
            <div className="relative w-full aspect-[3/4] bg-slate-50/80 border border-slate-200 rounded-xl overflow-hidden shadow-inner flex flex-col justify-between p-6">
              {/* Background Bank Seal Motif */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                <span className="font-bold text-5xl tracking-widest uppercase text-slate-900">FIXED DEPOSIT</span>
              </div>

              {/* Simulated Printed Certificate Content */}
              <div className="space-y-4 relative z-10 text-[11px] text-slate-700 font-sans">
                <div className="border-b border-slate-200 pb-2.5 flex justify-between items-start">
                  <div>
                    <div className="font-bold text-slate-900 uppercase text-xs">
                      {formFields.bankName || "CANARA BANK"}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {formFields.branchName || "Town Hall Branch"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">IFSC CODE</div>
                    <div className="font-mono font-bold text-slate-800">{formFields.ifscCode || "CNRB0001092"}</div>
                  </div>
                </div>

                <div className="pt-1 flex justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Receipt Number</div>
                    <div className="font-mono font-bold text-slate-900">{formFields.fdrNumber || "FDR-2024-CNRB-44910"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Principal Sum</div>
                    <div className="font-bold text-blue-600 text-sm">{formatIndianCurrency(formFields.amount)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
                  <div>
                    <div className="text-slate-400 uppercase font-semibold">Issue Date</div>
                    <div className="font-medium text-slate-800 mt-0.5">{formFields.issueDate}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 uppercase font-semibold">Maturity Date</div>
                    <div className="font-medium text-slate-800 mt-0.5">{formFields.maturityDate}</div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-200">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Joint Beneficiary & Lien Holder</div>
                  <div className="font-semibold text-slate-900 text-[11px] mt-0.5">
                    {formFields.jointAccountHolder}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-1 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>LIEN ENDORSED IN FAVOUR OF AICTE REGIONAL OFFICER</span>
                  </div>
                </div>
              </div>

              {/* Animated Laser Sweep Line during Scanning */}
              {isScanning && (
                <div className="absolute inset-x-0 h-1 bg-blue-500 shadow-[0_0_12px_#3B82F6] animate-[bounce_2s_infinite] z-20" />
              )}

              {/* Bounding Box Highlights after Extraction */}
              {ocrPayload && !isScanning && (
                <div className="absolute inset-0 pointer-events-none z-15">
                  {Object.entries(ocrPayload.extractedFields).map(([key, field]) => (
                    <div
                      key={key}
                      style={{
                        left: `${field.boundingBox.x}%`,
                        top: `${field.boundingBox.y}%`,
                        width: `${field.boundingBox.width}%`,
                        height: `${field.boundingBox.height}%`,
                      }}
                      className="absolute border border-blue-500 bg-blue-500/10 rounded flex items-start justify-end p-0.5"
                    >
                      <span className="font-mono text-[8px] bg-blue-600 text-white px-1 py-0.2 rounded font-semibold leading-none">
                        {field.confidence.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-slate-200 pt-2 text-center text-[10px] text-slate-400 font-mono">
                SECURE TAMPER-EVIDENT TREASURY ARCHIVE
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={() => handleRunOcr()}
              disabled={isScanning}
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ScanLine className={`w-4 h-4 ${isScanning ? "animate-spin text-blue-600" : "text-slate-500"}`} />
              <span>{isScanning ? "Scanning & Parsing Document..." : "Re-Scan Physical Document"}</span>
            </button>
          </div>
        </div>

        {/* Right: Human-in-the-Loop Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Human-in-the-Loop Field Confirmation
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Inspect per-field OCR confidence and verify parameters prior to cryptographic ledger sealing.
              </p>
            </div>
            {ocrPayload?.metadataAnalysis?.isAdvisoryOnly && (
              <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold">
                Advisory Flags Present
              </span>
            )}
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* FDR Number */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <label className="text-slate-600 font-semibold">FDR Number</label>
                {ocrPayload && (
                  <span className="text-emerald-600 font-semibold text-[10px]">
                    {ocrPayload.extractedFields.fdrNumber.confidence}% match
                  </span>
                )}
              </div>
              <input
                type="text"
                value={formFields.fdrNumber}
                onChange={(e) => setFormFields({ ...formFields, fdrNumber: e.target.value })}
                className="w-full p-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Issuing Bank */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <label className="text-slate-600 font-semibold">Issuing Bank</label>
                {ocrPayload && (
                  <span className="text-emerald-600 font-semibold text-[10px]">
                    {ocrPayload.extractedFields.bankName.confidence}% match
                  </span>
                )}
              </div>
              <input
                type="text"
                value={formFields.bankName}
                onChange={(e) => setFormFields({ ...formFields, bankName: e.target.value })}
                className="w-full p-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* IFSC Code */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <label className="text-slate-600 font-semibold">Branch IFSC Code</label>
                {ocrPayload && (
                  <span className="text-emerald-600 font-semibold text-[10px]">
                    {ocrPayload.extractedFields.ifscCode.confidence}% match
                  </span>
                )}
              </div>
              <input
                type="text"
                value={formFields.ifscCode}
                onChange={(e) => setFormFields({ ...formFields, ifscCode: e.target.value })}
                className="w-full p-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Amount */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <label className="text-slate-600 font-semibold">Principal Amount (₹)</label>
                {ocrPayload && (
                  <span className="text-emerald-600 font-semibold text-[10px]">
                    {ocrPayload.extractedFields.amount.confidence}% match
                  </span>
                )}
              </div>
              <input
                type="number"
                value={formFields.amount}
                onChange={(e) => setFormFields({ ...formFields, amount: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Issue Date */}
            <div className="space-y-1">
              <label className="text-slate-600 font-semibold text-[11px]">Issue Date</label>
              <input
                type="date"
                value={formFields.issueDate}
                onChange={(e) => setFormFields({ ...formFields, issueDate: e.target.value })}
                className="w-full p-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Maturity Date */}
            <div className="space-y-1">
              <label className="text-slate-600 font-semibold text-[11px]">Maturity Date</label>
              <input
                type="date"
                value={formFields.maturityDate}
                onChange={(e) => setFormFields({ ...formFields, maturityDate: e.target.value })}
                className="w-full p-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Joint Account & Lien Affirmation */}
          <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs space-y-2">
            <div className="font-bold text-slate-800">
              AICTE Joint Holding & Lien Affirmation
            </div>
            <div className="text-[11px] text-slate-500">
              Beneficiary Name: <span className="font-semibold text-slate-800">{formFields.jointAccountHolder}</span>
            </div>
            <label className="flex items-center gap-2.5 text-slate-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={formFields.lienMarked}
                onChange={(e) => setFormFields({ ...formFields, lienMarked: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="text-xs">
                I certify that the Core Banking CBS lien flag has been marked in favour of AICTE Regional Officer.
              </span>
            </label>
          </div>

          {/* Submission Success Box */}
          {submissionSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-2">
              <div className="font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Instrument Successfully Committed to Central Register</span>
              </div>
              <p className="font-mono text-[11px] text-emerald-700">
                Ledger ID: {submissionSuccess}. Block sealed with SHA-256 linear hash chain.
              </p>
              <button
                type="button"
                onClick={() => router.push(`/repository/${submissionSuccess}`)}
                className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
              >
                Inspect New Instrument
              </button>
            </div>
          )}

          {/* Commit Action Button */}
          {!submissionSuccess && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 font-mono">
                Active User: {currentRole}
              </span>
              <button
                type="button"
                onClick={handleCommitLedger}
                disabled={isSubmitting || !formFields.fdrNumber}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <span>{isSubmitting ? "Committing to Ledger..." : "Commit Verified Record to Central Treasury"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
