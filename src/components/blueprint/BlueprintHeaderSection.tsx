"use client";

import React, { useState } from "react";
import { SpatialDossier } from "@/types/blueprint";
import { SPATIAL_DOSSIERS } from "@/lib/blueprint/spatialData";
import { ChevronDown, Check, Building2, MapPin } from "lucide-react";

interface BlueprintHeaderSectionProps {
  currentDossier: SpatialDossier;
  onSelectDossier: (dossier: SpatialDossier) => void;
}

export function BlueprintHeaderSection({
  currentDossier,
  onSelectDossier,
}: BlueprintHeaderSectionProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-1 pb-1">
      {/* Left: Section eyebrow, title and description */}
      <div className="space-y-1">
        <div className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
          AICTE SPATIAL COMPLIANCE & CAMPUS VERIFICATION
        </div>
        <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Architectural Blueprint &{" "}
          <span className="text-sky-600 dark:text-sky-400">Campus Telemetry Studio</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
          Automated architectural space audit, room boundary extraction, and cadastral land contiguity compliance under APH 2024–27.
        </p>
      </div>

      {/* Right: Selected Dossier Dropdown */}
      <div className="relative shrink-0 flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Selected Dossier:
        </span>

        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 shadow-xs hover:border-sky-400 dark:hover:border-sky-500 transition-colors cursor-pointer select-none"
        >
          <span className="truncate max-w-[280px] sm:max-w-[340px]">
            {currentDossier.dossierId} • {currentDossier.shortName} ({currentDossier.regionCode})
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute right-0 top-full mt-1.5 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-40 py-2 animate-glass-in">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 font-bold">
                Registered Institutional Dossiers
              </div>
              <div className="max-h-72 overflow-y-auto py-1">
                {Object.values(SPATIAL_DOSSIERS).map((dossier) => {
                  const isSelected = dossier.dossierId === currentDossier.dossierId;
                  return (
                    <button
                      key={dossier.dossierId}
                      type="button"
                      onClick={() => {
                        onSelectDossier(dossier);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs transition-colors flex items-start justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer ${
                        isSelected ? "bg-sky-50/70 dark:bg-sky-950/30" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 truncate">
                          <Building2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span className="truncate">{dossier.institutionName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {dossier.dossierId}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{dossier.address}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-sky-600 shrink-0 mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default BlueprintHeaderSection;

