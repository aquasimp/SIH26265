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
    <div className="space-y-5 sm:space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="liquid-glass-card rounded-[22px] p-4.5 sm:p-5 shadow-xs">
        <h2 className="font-serif font-bold text-lg sm:text-xl text-ink-primary tracking-tight">
          OCR-Assisted Fixed Deposit Intake & Validation
        </h2>
        <p className="text-xs text-ink-muted mt-0.5">
          High-accuracy visual text extraction with confidence scoring and automated RBI IFSC routing verification
        </p>
      </div>

      {/* Template & Preset Selector */}
      <div className="p-4 sm:p-5 liquid-glass-card rounded-[20px] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-0.5">
          <div className="text-xs font-semibold text-ink-primary">
            Select Test Sample Certificate (SIH Demo Presets)
          </div>
          <div className="text-[11px] text-ink-muted">
            Simulate scanning of official bank deposit certificates
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            onClick={() => {
              setSelectedTemplate("STANDARD_SBI");
              handleRunOcr("STANDARD_SBI");
            }}
            className={`px-3 py-2 sm:py-1.5 text-xs font-mono font-medium rounded-md border transition-colors min-h-[40px] sm:min-h-0 ${selectedTemplate === "STANDARD_SBI"
                ? "bg-saffron text-white border-saffron shadow-sm"
                : "bg-paper-100 text-ink-primary border-ink-border hover:bg-paper-200"
              }`}
          >
            Sample 1: Authentic Canara Bank (Clean)
          </button>

          <button
            onClick={() => {
              setSelectedTemplate("MISMATCH_HDFC_IFSC");
              handleRunOcr("MISMATCH_HDFC_IFSC");
            }}
            className={`px-3 py-2 sm:py-1.5 text-xs font-mono font-medium rounded-md border transition-colors min-h-[40px] sm:min-h-0 ${selectedTemplate === "MISMATCH_HDFC_IFSC"
                ? "bg-red-700 text-white border-red-700 shadow-sm"
                : "bg-paper-100 text-ink-primary border-ink-border hover:bg-paper-200"
              }`}
          >
            Sample 2: SBI with HDFC IFSC (Discrepancy)
          </button>
        </div>
      </div>

      {/* Main OCR Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Simulated Document Viewer with Laser Scanner Animation */}
        <div className="lg:col-span-5 liquid-glass-card rounded-[22px] shadow-xs p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-ink-border pb-3 mb-4">
            <span className="font-serif font-bold text-xs text-ink-primary flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-saffron" />
              <span>Document Scan Surface</span>
            </span>
            {ocrPayload && (
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-botanical-subtle text-botanical font-bold">
                Overall Confidence: {ocrPayload.overallConfidence}%
              </span>
            )}
          </div>

          {/* Visual Certificate Simulation with Sweeping Scan Line */}
          <div className="relative w-full aspect-[3/4] bg-paper-200 border border-ink-border rounded overflow-hidden shadow-inner flex flex-col justify-between p-6">
            {/* Background Bank Seal Motif */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
              <span className="font-serif font-bold text-7xl uppercase">TERM DEPOSIT</span>
            </div>

            {/* Simulated Printed Certificate Content */}
            <div className="space-y-4 relative z-10 text-[11px] font-mono text-ink-secondary">
              <div className="border-b border-ink-border pb-2 flex justify-between items-start">
                <div>
                  <div className="font-bold text-ink-primary uppercase text-xs">
                    {formFields.bankName || "CANARA BANK"}
                  </div>
                  <div className="text-[10px] text-ink-muted">
                    {formFields.branchName || "Town Hall Branch"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-ink-muted">IFSC CODE</div>
                  <div className="font-bold text-ink-primary">{formFields.ifscCode || "CNRB0001092"}</div>
                </div>
              </div>

              <div className="pt-2 flex justify-between">
                <div>
                  <div className="text-[9px] text-ink-muted uppercase">Receipt No.</div>
                  <div className="font-bold text-ink-primary">{formFields.fdrNumber || "FDR-2024-CNRB-44910"}</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-ink-muted uppercase">Deposit Sum</div>
                  <div className="font-bold text-saffron text-sm">{formatIndianCurrency(formFields.amount)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 text-[10px]">
                <div>
                  <div className="text-ink-muted uppercase">Issue Date</div>
                  <div>{formFields.issueDate}</div>
                </div>
                <div>
                  <div className="text-ink-muted uppercase">Maturity Date</div>
                  <div>{formFields.maturityDate}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-ink-border">
                <div className="text-[9px] text-ink-muted uppercase">Joint Beneficiary & Lien Holder</div>
                <div className="font-semibold text-ink-primary text-[10px]">
                  {formFields.jointAccountHolder}
                </div>
                <div className="text-[9px] text-botanical font-bold mt-1">
                  ● LIEN ENDORSED IN CBS PERMITTED DISCHARGE UNDER AICTE NOC
                </div>
              </div>
            </div>

            {/* Animated Laser Sweep Line during Scanning */}
            {isScanning && (
              <div className="absolute inset-x-0 h-1 bg-saffron shadow-[0_0_12px_#B85300] animate-[bounce_2s_infinite] z-20" />
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
                    className="absolute border border-saffron bg-saffron/10 rounded-xs flex items-start justify-end p-0.5"
                  >
                    <span className="font-mono text-[8px] bg-saffron text-white px-0.5 rounded leading-none">
                      {field.confidence.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-ink-border pt-2 text-center text-[10px] text-ink-muted font-mono">
              SECURE TAMPER-EVIDENT TREASURY ARCHIVE
            </div>
          </div>

          <div className="pt-3">
            <button
              onClick={() => handleRunOcr()}
              disabled={isScanning}
              className="w-full py-2 bg-paper-200 hover:bg-paper-300 border border-ink-border text-ink-primary text-xs font-mono font-medium rounded flex items-center justify-center gap-2 transition-colors"
            >
              <ScanLine className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
              <span>{isScanning ? "Scanning & Parsing Document..." : "Re-Scan Physical Document"}</span>
            </button>
          </div>
        </div>

        {/* Right: Human-in-the-Loop Extraction Form & Discrepancy Gate */}
        <div className="lg:col-span-7 liquid-glass-card rounded-[22px] shadow-xs p-5 sm:p-6 space-y-5">
          <div className="border-b border-ink-border pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-sm text-ink-primary">
                Human-in-the-Loop Field Confirmation
              </h3>
              <p className="text-[11px] text-ink-muted">
                Inspect per-field OCR confidence and verify parameters prior to cryptographic ledger sealing
              </p>
            </div>
            {ocrPayload?.metadataAnalysis?.isAdvisoryOnly && (
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-mono font-semibold">
                Advisory Metadata Flags
              </span>
            )}
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            {/* FDR Number */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <label className="text-ink-muted font-semibold uppercase">FDR Number</label>
                {ocrPayload && (
                  <span className="text-botanical font-bold">
                    {ocrPayload.extractedFields.fdrNumber.confidence}% match
                  </span>
                )}
              </div>
              <input
                type="text"
                value={formFields.fdrNumber}
                onChange={(e) => setFormFields({ ...formFields, fdrNumber: e.target.value })}
                className="w-full p-2 bg-paper-100 border border-ink-border rounded text-ink-primary font-bold focus:outline-none"
              />
            </div>

            {/* Issuing Bank */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <label className="text-ink-muted font-semibold uppercase">Issuing Bank</label>
                {ocrPayload && (
                  <span className="text-botanical font-bold">
                    {ocrPayload.extractedFields.bankName.confidence}% match
                  </span>
                )}
              </div>
              <input
                type="text"
                value={formFields.bankName}
                onChange={(e) => setFormFields({ ...formFields, bankName: e.target.value })}
                className="w-full p-2 bg-paper-100 border border-ink-border rounded text-ink-primary font-semibold focus:outline-none"
              />
            </div>

            {/* IFSC Code */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <label className="text-ink-muted font-semibold uppercase">Branch IFSC Code</label>
                {ocrPayload && (
                  <span className="text-botanical font-bold">
                    {ocrPayload.extractedFields.ifscCode.confidence}% match
                  </span>
                )}
              </div>
              <input
                type="text"
                value={formFields.ifscCode}
                onChange={(e) => setFormFields({ ...formFields, ifscCode: e.target.value })}
                className="w-full p-2 bg-paper-100 border border-ink-border rounded text-ink-primary font-bold focus:outline-none"
              />
            </div>

            {/* Amount */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <label className="text-ink-muted font-semibold uppercase">Principal Amount (INR)</label>
                {ocrPayload && (
                  <span className="text-botanical font-bold">
                    {ocrPayload.extractedFields.amount.confidence}% match
                  </span>
                )}
              </div>
              <input
                type="number"
                value={formFields.amount}
                onChange={(e) => setFormFields({ ...formFields, amount: Number(e.target.value) })}
                className="w-full p-2 bg-paper-100 border border-ink-border rounded text-ink-primary font-bold focus:outline-none"
              />
            </div>

            {/* Issue Date */}
            <div className="space-y-1">
              <label className="text-ink-muted font-semibold uppercase text-[10px]">Issue Date (YYYY-MM-DD)</label>
              <input
                type="date"
                value={formFields.issueDate}
                onChange={(e) => setFormFields({ ...formFields, issueDate: e.target.value })}
                className="w-full p-2 bg-paper-100 border border-ink-border rounded text-ink-primary focus:outline-none"
              />
            </div>

            {/* Maturity Date */}
            <div className="space-y-1">
              <label className="text-ink-muted font-semibold uppercase text-[10px]">Maturity Date (YYYY-MM-DD)</label>
              <input
                type="date"
                value={formFields.maturityDate}
                onChange={(e) => setFormFields({ ...formFields, maturityDate: e.target.value })}
                className="w-full p-2 bg-paper-100 border border-ink-border rounded text-ink-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Joint Account & Lien Affirmation */}
          <div className="p-3 bg-paper-100 border border-ink-border rounded text-xs space-y-2">
            <div className="font-semibold text-ink-primary">
              AICTE Joint Holding & Lien Affirmation
            </div>
            <div className="text-[11px] text-ink-muted">
              Beneficiary Name: <span className="font-mono text-ink-primary">{formFields.jointAccountHolder}</span>
            </div>
            <label className="flex items-center gap-2 text-ink-primary cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={formFields.lienMarked}
                onChange={(e) => setFormFields({ ...formFields, lienMarked: e.target.checked })}
                className="rounded border-ink-border"
              />
              <span className="text-xs">
                I certify that the Core Banking CBS lien flag has been marked in favour of AICTE Regional Officer.
              </span>
            </label>
          </div>

          {/* Submission Success Box */}
          {submissionSuccess && (
            <div className="p-4 bg-botanical-subtle border border-botanical/30 rounded text-xs text-botanical space-y-2">
              <div className="font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Instrument Successfully Committed to Central Treasury</span>
              </div>
              <p className="font-mono text-[11px]">
                Ledger ID: {submissionSuccess}. Audit block hash sealed with SHA-256.
              </p>
              <button
                onClick={() => router.push(`/repository/${submissionSuccess}`)}
                className="px-3 py-1 bg-botanical text-white rounded font-mono text-xs hover:bg-botanical-hover"
              >
                Inspect New Instrument
              </button>
            </div>
          )}

          {/* Commit Action Button */}
          {!submissionSuccess && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-ink-muted font-mono">
                RBAC Role: {currentRole}
              </span>
              <button
                onClick={handleCommitLedger}
                disabled={isSubmitting || !formFields.fdrNumber}
                className="px-5 py-2.5 min-h-[44px] bg-saffron hover:bg-saffron-hover text-white text-xs font-semibold rounded shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <span>{isSubmitting ? "Committing to Ledger..." : "Commit Verified Record to Central Treasury"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

