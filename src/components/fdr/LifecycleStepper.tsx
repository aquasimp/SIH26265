"use client";

import React from "react";
import { FdrStatus } from "@/types/fdr";
import { Check, Clock, AlertTriangle, KeyRound } from "lucide-react";

interface LifecycleStepperProps {
  status: FdrStatus;
  releaseRequested?: boolean;
}

export function LifecycleStepper({ status, releaseRequested }: LifecycleStepperProps) {
  const steps = [
    { key: "SUBMITTED", label: "Submitted" },
    { key: "PENDING_VERIFICATION", label: "Scrutiny" },
    { key: "ACTIVE", label: "Bank Verified & Active" },
    { key: "EXPIRING_OR_MATURED", label: "Maturity / Renewal" },
    { key: "RELEASED", label: "Discharged / Released" },
  ];

  const getStepIndex = (st: FdrStatus): number => {
    switch (st) {
      case "DRAFT":
      case "SUBMITTED":
        return 0;
      case "PENDING_VERIFICATION":
        return 1;
      case "DEFICIENT":
        return 1;
      case "ACTIVE":
        return 2;
      case "EXPIRING":
      case "MATURED":
      case "RENEWAL_SUBMITTED":
      case "RENEWED":
        return 3;
      case "RELEASE_REQUESTED":
      case "RELEASE_RECOMMENDED":
        return 3;
      case "RELEASED":
        return 4;
      default:
        return 1;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="w-full py-3 px-4 bg-paper-100 border border-ink-border rounded">
      <div className="flex items-center justify-between relative">
        {/* Background Connecting Line */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-ink-border z-0" />
        
        {/* Active Progress Line */}
        <div
          className="absolute left-4 top-1/2 -translate-y-1/2 h-0.5 bg-botanical transition-all duration-500 z-0"
          style={{
            width: `${(currentIndex / (steps.length - 1)) * 92}%`,
          }}
        />

        {steps.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isDeficient = status === "DEFICIENT" && isCurrent;

          return (
            <div
              key={step.key}
              className="relative z-10 flex flex-col items-center group"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs transition-colors ${
                  isDeficient
                    ? "bg-red-600 text-white ring-4 ring-red-100 dark:ring-red-950"
                    : isDone
                    ? "bg-botanical text-white"
                    : isCurrent
                    ? "bg-saffron text-white ring-4 ring-saffron/20 font-bold"
                    : "bg-paper-50 border border-ink-border text-ink-muted"
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5" />
                ) : isDeficient ? (
                  <AlertTriangle className="w-3.5 h-3.5" />
                ) : isCurrent ? (
                  <Clock className="w-3.5 h-3.5" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span
                className={`text-[11px] font-sans mt-1.5 whitespace-nowrap ${
                  isCurrent
                    ? "font-semibold text-ink-primary"
                    : isDone
                    ? "text-ink-secondary"
                    : "text-ink-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
