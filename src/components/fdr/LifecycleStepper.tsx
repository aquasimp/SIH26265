"use client";

import React from "react";
import { FdrStatus } from "@/types/fdr";
import { Check, Clock, AlertTriangle } from "lucide-react";

interface LifecycleStepperProps {
  status: FdrStatus;
  releaseRequested?: boolean;
}

export function LifecycleStepper({ status }: LifecycleStepperProps) {
  const steps = [
    { key: "SUBMITTED", label: "Submitted" },
    { key: "PENDING_VERIFICATION", label: "Scrutiny" },
    { key: "ACTIVE", label: "Bank Active" },
    { key: "EXPIRING_OR_MATURED", label: "Maturity" },
    { key: "RELEASED", label: "Discharged" },
  ];

  const getStepIndex = (st: FdrStatus): number => {
    switch (st) {
      case "DRAFT":
      case "SUBMITTED":
        return 0;
      case "PENDING_VERIFICATION":
      case "DEFICIENT":
        return 1;
      case "ACTIVE":
        return 2;
      case "EXPIRING":
      case "MATURED":
      case "RENEWAL_SUBMITTED":
      case "RENEWED":
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
    <div className="w-full py-4 px-3 sm:px-6 liquid-glass-card rounded-[22px] overflow-hidden shadow-xs">
      <div className="flex items-center justify-between relative max-w-full">
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
              className="relative z-10 flex flex-col items-center group max-w-[64px] sm:max-w-none text-center"
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-mono text-xs transition-colors shrink-0 ${
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
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : isDeficient ? (
                  <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : isCurrent ? (
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span
                className={`text-[9px] sm:text-[11px] font-sans mt-1.5 leading-tight sm:whitespace-nowrap ${
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
