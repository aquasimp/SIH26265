"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { FdrInstrument } from "@/types/fdr";
import { FolderVariant } from "./GlassFolderCard";
import { X, Search, ExternalLink, AlertTriangle, ShieldCheck, Clock, Landmark } from "lucide-react";
import Link from "next/link";

interface GlassFolderDetailModalProps {
  isOpen: boolean;
  variant: FolderVariant | null;
  title: string;
  subtitle: string;
  count: number;
  items: FdrInstrument[];
  onClose: () => void;
  triggerButtonRef?: React.RefObject<HTMLButtonElement>;
}

const TEXTURE_MAP: Record<FolderVariant, string> = {
  critical: "/textures/marble-critical.webp",
  pending: "/textures/marble-pending.webp",
  approved: "/textures/marble-approved.webp",
};

export function GlassFolderDetailModal({
  isOpen,
  variant,
  title,
  subtitle,
  count,
  items,
  onClose,
  triggerButtonRef,
}: GlassFolderDetailModalProps) {
  const shouldReduceMotion = useReducedMotion();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Trap focus and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        triggerButtonRef?.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Focus the close button when opened
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose, triggerButtonRef]);

  // Return focus on close
  const handleClose = () => {
    onClose();
    setTimeout(() => {
      triggerButtonRef?.current?.focus();
    }, 50);
  };

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.fdrNumber.toLowerCase().includes(q) ||
        item.bankName.toLowerCase().includes(q) ||
        item.branchName.toLowerCase().includes(q) ||
        item.ifscCode.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  if (!variant) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="folder-modal-title"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 md:p-8"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.1 : 0.25 }}
            onClick={handleClose}
            className="fixed inset-0 bg-ink-primary/60 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Morphing Detail Container */}
          <motion.div
            ref={modalRef}
            layoutId={`folder-container-${variant}`}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 28,
            }}
            className="relative w-full max-w-4xl max-h-[92dvh] sm:max-h-[88vh] bg-paper-100 border border-ink-border rounded-t-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10"
          >
            {/* Header: Marbled Fluid Texture Banner */}
            <div className="relative h-36 sm:h-44 overflow-hidden flex-shrink-0">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${TEXTURE_MAP[variant]})`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Header Content */}
              <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono font-medium tracking-wide bg-white/20 text-white backdrop-blur-md border border-white/30 uppercase">
                    Regulatory Dossier Index · {variant}
                  </span>

                  {/* Close Button */}
                  <button
                    ref={closeButtonRef}
                    onClick={handleClose}
                    type="button"
                    aria-label="Close dossier view"
                    className="w-11 h-11 rounded-xl bg-white/25 hover:bg-white/40 active:scale-95 text-white flex items-center justify-center backdrop-blur-md border border-white/40 transition-all outline-none focus-visible:ring-2 focus-visible:ring-white shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <h2
                      id="folder-modal-title"
                      className="text-xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-md"
                    >
                      {title}
                    </h2>
                    <p className="text-white/80 font-mono text-xs sm:text-sm mt-0.5 sm:mt-1">
                      {count} total records registered under sovereign custody
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Bar: Search & Quick Filter */}
            <div className="p-3 sm:p-4 border-b border-ink-border bg-paper-50 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  type="text"
                  placeholder="Filter by FDR number, issuing bank, branch or IFSC..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm sm:text-xs font-mono rounded-lg bg-paper-100 border border-ink-border text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-saffron"
                />
              </div>
              <span className="text-xs font-mono text-ink-muted hidden sm:inline">
                Showing {filteredItems.length} of {items.length} items
              </span>
            </div>

            {/* Dossiers List (High-Density Regulatory Ledger Cards) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              {filteredItems.length === 0 ? (
                <div className="text-center py-12 text-ink-muted text-sm font-mono">
                  No dossiers matched your search query.
                </div>
              ) : (
                filteredItems.map((fdr) => (
                  <div
                    key={fdr.id}
                    className="p-4 rounded-xl bg-paper-50 border border-ink-border hover:border-ink-secondary/30 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-ink-primary bg-paper-200 px-2 py-0.5 rounded border border-ink-border">
                          {fdr.fdrNumber}
                        </span>
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                            fdr.status === "DEFICIENT"
                              ? "bg-status-danger-bg text-status-danger"
                              : fdr.status === "EXPIRING" || fdr.status === "MATURED"
                              ? "bg-status-warning-bg text-status-warning"
                              : fdr.status === "ACTIVE"
                              ? "bg-status-verified-bg text-status-verified"
                              : "bg-status-pending-bg text-status-pending"
                          }`}
                        >
                          {fdr.status.replace(/_/g, " ")}
                        </span>
                        {fdr.verificationStatus === "BANK_CONFIRMED" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-botanical font-medium">
                            <ShieldCheck className="w-3 h-3" /> CBS Confirmed
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-ink-secondary">
                        <Landmark className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                        <span className="font-medium text-ink-primary">{fdr.bankName}</span>
                        <span className="text-ink-muted truncate">({fdr.branchName} · {fdr.ifscCode})</span>
                      </div>

                      <div className="flex items-center gap-4 text-[11px] font-mono text-ink-muted">
                        <span>Issued: {fdr.issueDate}</span>
                        <span>Maturity: {fdr.maturityDate}</span>
                        <span>Tenure: {fdr.tenureMonths} mos</span>
                      </div>

                      {fdr.discrepancies && fdr.discrepancies.length > 0 && (
                        <div className="mt-1 flex items-start gap-1.5 text-[11px] text-red-700 bg-red-50 p-1.5 rounded border border-red-200">
                          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span>{fdr.discrepancies[0].title}: {fdr.discrepancies[0].reason}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-ink-border">
                      <div className="font-mono font-bold text-sm sm:text-base text-ink-primary">
                        ₹{(fdr.amount).toLocaleString("en-IN")}
                      </div>
                      <Link
                        href={`/repository/${fdr.id}`}
                        onClick={handleClose}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-paper-200 hover:bg-paper-300 text-ink-primary border border-ink-border transition-colors"
                      >
                        <span>Inspect</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-paper-200 border-t border-ink-border flex items-center justify-between text-xs font-mono text-ink-muted">
              <span>Press [ESC] to return to dashboard</span>
              <button
                onClick={handleClose}
                className="px-3 py-1 rounded bg-paper-100 border border-ink-border hover:bg-paper-50 text-ink-primary"
              >
                Close View
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

