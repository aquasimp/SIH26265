"use client";

import React, { useState } from "react";
import {
  SpatialDossier,
  SimulationParams,
  SimulationResult,
} from "@/types/blueprint";
import {
  SlidersHorizontal,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  ShieldCheck,
  Send,
  Building,
} from "lucide-react";

interface WhatIfIntakeEngineProps {
  dossier: SpatialDossier;
  simulation: SimulationResult;
  params: SimulationParams;
  onUpdateParams: (newParams: Partial<SimulationParams>) => void;
  onResetParams: () => void;
}

export function WhatIfIntakeEngine({
  dossier,
  simulation,
  params,
  onUpdateParams,
  onResetParams,
}: WhatIfIntakeEngineProps) {
  const [noticeSent, setNoticeSent] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const isDeficit = simulation.builtUpDeficitM2 < 0;
  const absDeficit = Math.abs(simulation.builtUpDeficitM2).toLocaleString("en-IN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const handleExportPdf = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      window.print();
    }, 400);
  };

  const handleSendNotice = () => {
    setNoticeSent(true);
    setTimeout(() => setNoticeSent(false), 4000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between select-none">
      <div className="space-y-4">
        {/* =========================================================================
            HEADER ROW WITH TITLE & RESET
            ========================================================================= */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-wide uppercase">
              APH Chapter VII &ldquo;What-If&rdquo; FSI / Intake Engine
            </h3>
          </div>

          <button
            type="button"
            onClick={onResetParams}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer"
            title="Reset intake sliders to baseline"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* =========================================================================
            INTAKE SLIDERS
            ========================================================================= */}
        <div className="space-y-3.5">
          {/* 1. UG Annual Intake */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                UG Annual Intake:
              </span>
              <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                {params.ugIntake} st/yr
              </span>
            </div>
            <input
              type="range"
              min={120}
              max={960}
              step={60}
              value={params.ugIntake}
              onChange={(e) => onUpdateParams({ ugIntake: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>120</span>
              <span className="text-slate-500 font-semibold">Total UG: {simulation.totalUgCohort}</span>
              <span>960</span>
            </div>
          </div>

          {/* 2. PG Annual Intake */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                PG Annual Intake:
              </span>
              <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                {params.pgIntake} st/yr
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={240}
              step={30}
              value={params.pgIntake}
              onChange={(e) => onUpdateParams({ pgIntake: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>0</span>
              <span className="text-slate-500 font-semibold">Total PG: {simulation.totalPgCohort}</span>
              <span>240</span>
            </div>
          </div>

          {/* 3. Lab Sharing & Municipal FSI Row */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Lab Sharing */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Lab Sharing:
                </span>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                  {params.labSharing}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={25}
                step={5}
                value={params.labSharing}
                onChange={(e) => onUpdateParams({ labSharing: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="text-[9.5px] text-slate-400 truncate">
                max 25% (Clause 7.3)
              </div>
            </div>

            {/* Municipal FSI / FAR */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Municipal FSI:
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {params.municipalFsi.toFixed(1)}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[1.5, 2.0, 2.5, 3.0].map((fsi) => (
                  <button
                    key={fsi}
                    type="button"
                    onClick={() => onUpdateParams({ municipalFsi: fsi })}
                    className={`py-1 text-[10px] font-bold rounded cursor-pointer transition-colors ${
                      params.municipalFsi === fsi
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {fsi.toFixed(1)}
                  </button>
                ))}
              </div>
              <div className="text-[9.5px] text-slate-400 truncate">
                Zone: Urban Mandate
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            CALCULATED STATUTORY REQUIREMENT BREAKDOWN
            ========================================================================= */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Mandatory Area Allocation (APH Table 7.1)
          </div>

          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Instructional Area (INA):</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-white">
              {simulation.requiredInaM2.toLocaleString("en-IN")} m²
            </span>
          </div>

          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Administrative Area (ADA):</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-white">
              {simulation.requiredAdaM2.toLocaleString("en-IN")} m²
            </span>
          </div>

          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Amenities Area (AMA):</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-white">
              {simulation.requiredAmaM2.toLocaleString("en-IN")} m²
            </span>
          </div>

          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Circulation & Access (ACA - 25%):</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-white">
              {simulation.requiredAcaM2.toLocaleString("en-IN")} m²
            </span>
          </div>

          <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-slate-900 dark:text-white">
            <span>Total Statutory Requirement:</span>
            <span className="font-mono text-sky-600 dark:text-sky-400">
              {simulation.totalRequiredBuiltUpM2.toLocaleString("en-IN")} m²
            </span>
          </div>
        </div>

        {/* =========================================================================
            DEFICIT / SURPLUS STATUS BANNER
            ========================================================================= */}
        {isDeficit ? (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>DEFICIT DETECTED: -{absDeficit} m² Shortfall</span>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-tight">
              Institution does not satisfy APH Chapter VII minimum floor area for {simulation.totalStudents} total students.
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>SPATIAL COMPLIANCE SATISFIED</span>
            </div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-tight">
              Built-up area meets or exceeds AICTE norms (+{absDeficit} m² surplus available).
            </p>
          </div>
        )}
      </div>

      {/* =========================================================================
          ACTIONS & REGULATORY WORKFLOW BUTTONS
          ========================================================================= */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
        {noticeSent && (
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold text-center animate-glass-in">
            ✓ Spatial Deficiency Notice dispatched to Institution Signatory
          </div>
        )}

        <button
          type="button"
          onClick={handleSendNotice}
          className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Draft Spatial Audit Deficiency Notice</span>
        </button>

        <button
          type="button"
          onClick={handleExportPdf}
          disabled={isExporting}
          className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-200/90 dark:border-slate-700"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>{isExporting ? "Exporting Telemetry..." : "Export Geo-Vector CAD (.PDF)"}</span>
        </button>
      </div>
    </div>
  );
}

export default WhatIfIntakeEngine;

