"use client";

import React from "react";
import { SpatialDossier, SimulationResult } from "@/types/blueprint";

interface BlueprintKpiCardsProps {
  dossier: SpatialDossier;
  simulation: SimulationResult;
}

export function BlueprintKpiCards({ dossier, simulation }: BlueprintKpiCardsProps) {
  // Format numbers nicely
  const availableBuiltUpFormatted = dossier.availableBuiltUpAreaM2.toLocaleString("en-IN");
  const requiredBuiltUpFormatted = simulation.totalRequiredBuiltUpM2.toLocaleString("en-IN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const isDeficit = simulation.builtUpDeficitM2 < 0;
  const absDeficitFormatted = Math.abs(simulation.builtUpDeficitM2).toLocaleString("en-IN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const isLandDeficit = simulation.landDeficitAcres < 0;
  const absLandDeficitFormatted = Math.abs(simulation.landDeficitAcres).toFixed(2);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
      {/* =========================================================================
          CARD 1: TOTAL BUILT-UP AREA (AMBER TOP ACCENT)
          ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs border-t-[3.5px] border-t-amber-400 flex flex-col justify-between transition-all hover:shadow-md">
        <div>
          <div className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            TOTAL BUILT-UP AREA
          </div>

          <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl sm:text-[28px] font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {availableBuiltUpFormatted}
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-400">
              / {requiredBuiltUpFormatted} m²
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-1">
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              INA + ADA + AMA + ACA
            </span>
            {isDeficit ? (
              <span className="bg-amber-100/90 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                DEFICIT -{absDeficitFormatted} m²
              </span>
            ) : (
              <span className="bg-emerald-100/90 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                SURPLUS +{absDeficitFormatted} m²
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          Carpet: {dossier.carpetAreaM2.toLocaleString("en-IN")} m² • Circulation: {dossier.circulationAreaM2.toLocaleString("en-IN")} m²
        </div>
      </div>

      {/* =========================================================================
          CARD 2: MUNICIPAL FSI / FAR & LAND (ROSE TOP ACCENT)
          ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs border-t-[3.5px] border-t-rose-500 flex flex-col justify-between transition-all hover:shadow-md">
        <div>
          <div className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            MUNICIPAL FSI / FAR & LAND
          </div>

          <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl sm:text-[28px] font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {dossier.availableLandAcres.toFixed(2)}
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-400">
              / {simulation.requiredLandAcres.toFixed(2)} Acres
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-1">
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              FSI = {dossier.municipalFsi.toFixed(1)}
            </span>
            {isLandDeficit ? (
              <span className="bg-rose-100/90 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                DEFICIT -{absLandDeficitFormatted} Ac
              </span>
            ) : (
              <span className="bg-emerald-100/90 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                COMPLIANT
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          Zone: {dossier.zoneType}
        </div>
      </div>

      {/* =========================================================================
          CARD 3: ARCHITECTURAL WALL CONTINUITY (INDIGO TOP ACCENT)
          ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs border-t-[3.5px] border-t-indigo-500 flex flex-col justify-between transition-all hover:shadow-md">
        <div>
          <div className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            ARCHITECTURAL WALL CONTINUITY
          </div>

          <div className="mt-1 flex items-center gap-2">
            <span className="text-2xl sm:text-[28px] font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {dossier.wallContinuityAccuracy.toFixed(1)}%
            </span>
            <span className="bg-purple-100/90 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Vector Accuracy
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            <span>Clean Wall Segments</span>
            <span className="text-slate-400 font-normal">•</span>
            <span>Precision Calibrated</span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          Automated Room Segmentation
        </div>
      </div>

      {/* =========================================================================
          CARD 4: MULTI-PLOT LAND CONTIGUITY (EMERALD TOP ACCENT)
          ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs border-t-[3.5px] border-t-emerald-500 flex flex-col justify-between transition-all hover:shadow-md">
        <div>
          <div className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            MULTI-PLOT LAND CONTIGUITY
          </div>

          <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl sm:text-[28px] font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {dossier.interPlotDistanceKm > 0
                ? `${dossier.interPlotDistanceKm.toFixed(2)} km`
                : "Single Plot"}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              (Plots: {dossier.plotCount} / ≤ {dossier.maxAllowedPlots})
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-1">
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              Limit: ≤ {dossier.maxAllowedDistanceKm.toFixed(1)} km
            </span>
            <span className="bg-emerald-100/90 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0">
              COMPLIANT
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          APH 2024–27 Chapter I Clause 1.4 Norm
        </div>
      </div>
    </div>
  );
}

export default BlueprintKpiCards;

