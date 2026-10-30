"use client";

import React, { useState, useMemo, useRef } from "react";
import { FdrInstrument } from "@/types/fdr";
import { GlassFolderCard, FolderVariant } from "./GlassFolderCard";
import { GlassFolderDetailModal } from "./GlassFolderDetailModal";
import { FolderSilhouetteSvg } from "./FolderSilhouetteSvg";

export interface GlassFolderGridProps {
  instruments?: FdrInstrument[];
  className?: string;
}

export function GlassFolderGrid({
  instruments = [],
  className = "",
}: GlassFolderGridProps) {
  const [activeVariant, setActiveVariant] = useState<FolderVariant | null>(null);

  // Store refs to the 3 card buttons so focus can return properly after modal closes
  const criticalCardRef = useRef<HTMLButtonElement>(null);
  const pendingCardRef = useRef<HTMLButtonElement>(null);
  const approvedCardRef = useRef<HTMLButtonElement>(null);

  const cardRefMap: Record<FolderVariant, React.RefObject<HTMLButtonElement>> = {
    critical: criticalCardRef,
    pending: pendingCardRef,
    approved: approvedCardRef,
  };

  // Partition real FDR instruments into the three regulatory tiers
  const { criticalItems, pendingItems, approvedItems } = useMemo(() => {
    const critical: FdrInstrument[] = [];
    const pending: FdrInstrument[] = [];
    const approved: FdrInstrument[] = [];

    instruments.forEach((fdr) => {
      // 1. Critical Tier: Deficient instruments, verification mismatches, or critical flags
      const hasCriticalFlag = (fdr.discrepancies || []).some(
        (d) => !d.resolved && d.severity === "CRITICAL"
      );
      if (fdr.status === "DEFICIENT" || fdr.verificationStatus === "MISMATCH" || hasCriticalFlag) {
        critical.push(fdr);
        return;
      }

      // 2. Pending Tier: Intake, awaiting CBS verification, overdue/expiring, or pending release scrutiny
      if (
        fdr.status === "PENDING_VERIFICATION" ||
        fdr.status === "SUBMITTED" ||
        fdr.status === "EXPIRING" ||
        fdr.status === "MATURED" ||
        fdr.status === "RENEWAL_SUBMITTED" ||
        fdr.status === "RELEASE_REQUESTED"
      ) {
        pending.push(fdr);
        return;
      }

      // 3. Approved Tier: Active compliant, bank confirmed, or released/recommended
      approved.push(fdr);
    });

    return {
      criticalItems: critical,
      pendingItems: pending,
      approvedItems: approved,
    };
  }, [instruments]);

  const cardsData: Array<{
    variant: FolderVariant;
    title: string;
    subtitle: string;
    count: number;
    items: FdrInstrument[];
  }> = [
    {
      variant: "critical",
      title: "Fatal Forgeries",
      subtitle: `${criticalItems.length} Critical Dossiers`,
      count: criticalItems.length,
      items: criticalItems,
    },
    {
      variant: "pending",
      title: "EVC Shortfalls",
      subtitle: `${pendingItems.length} Pending Filings`,
      count: pendingItems.length,
      items: pendingItems,
    },
    {
      variant: "approved",
      title: "Approved 3-Yr EoA",
      subtitle: `${approvedItems.length} Verified Deeds`,
      count: approvedItems.length,
      items: approvedItems,
    },
  ];

  const currentModalData = cardsData.find((c) => c.variant === activeVariant);

  return (
    <section
      aria-label="Sovereign Regulatory Dossiers"
      className={`relative w-full rounded-[24px] liquid-glass-card p-4 sm:p-6 shadow-xs ${className}`}
    >
      {/* Shared SVG clip-path definitions in objectBoundingBox coordinates */}
      <FolderSilhouetteSvg />

      {/* Grid container: 3 columns on desktop, 1 on mobile, separated by thin vertical hairlines */}
      <div className="flex flex-col lg:flex-row items-stretch justify-between divide-y lg:divide-y-0 lg:divide-x divide-ink-border/70">
        {cardsData.map((card, idx) => (
          <div
            key={card.variant}
            className="flex-1 p-3 sm:p-4 lg:p-6 flex justify-center items-center"
          >
            <GlassFolderCard
              ref={cardRefMap[card.variant] as any}
              index={idx}
              title={card.title}
              subtitle={card.subtitle}
              count={card.count}
              variant={card.variant}
              items={card.items}
              isOpen={activeVariant === card.variant}
              onOpen={(v) => setActiveVariant(v)}
            />
          </div>
        ))}
      </div>

      {/* Detail morphing modal */}
      {currentModalData && (
        <GlassFolderDetailModal
          isOpen={activeVariant !== null}
          variant={activeVariant}
          title={currentModalData.title}
          subtitle={currentModalData.subtitle}
          count={currentModalData.count}
          items={currentModalData.items}
          onClose={() => setActiveVariant(null)}
          triggerButtonRef={activeVariant ? cardRefMap[activeVariant] : undefined}
        />
      )}
    </section>
  );
}

