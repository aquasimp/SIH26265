"use client";

import React, { useState, useMemo } from "react";
import { SpatialDossier, SimulationParams } from "@/types/blueprint";
import { SPATIAL_DOSSIERS } from "@/lib/blueprint/spatialData";
import { calculateSpatialSimulation } from "@/lib/blueprint/spatialEngine";
import { BlueprintHeaderSection } from "./BlueprintHeaderSection";
import { BlueprintKpiCards } from "./BlueprintKpiCards";
import { BlueprintCanvas } from "./BlueprintCanvas";
import { WhatIfIntakeEngine } from "./WhatIfIntakeEngine";

export function BlueprintAnalysisStudio() {
  // Default to Apex Institute of Technology & Management (matches screenshot!)
  const [currentDossier, setCurrentDossier] = useState<SpatialDossier>(
    SPATIAL_DOSSIERS["AICTE-2026-NW-0842"]
  );

  // Simulation parameters controlled by the "What-If" engine
  const [params, setParams] = useState<SimulationParams>({
    ugIntake: currentDossier.defaultUgIntake,
    pgIntake: currentDossier.defaultPgIntake,
    labSharing: currentDossier.defaultLabSharing,
    municipalFsi: currentDossier.municipalFsi,
    scalePixelsFor10m: 240, // 10m = 240px -> s = 0.04167 m/px
  });

  // Calculate live simulation results
  const simulation = useMemo(() => {
    return calculateSpatialSimulation(currentDossier, params);
  }, [currentDossier, params]);

  const handleUpdateParams = (newParams: Partial<SimulationParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  const handleResetParams = () => {
    setParams({
      ugIntake: currentDossier.defaultUgIntake,
      pgIntake: currentDossier.defaultPgIntake,
      labSharing: currentDossier.defaultLabSharing,
      municipalFsi: currentDossier.municipalFsi,
      scalePixelsFor10m: 240,
    });
  };

  const handleSelectDossier = (dossier: SpatialDossier) => {
    setCurrentDossier(dossier);
    setParams({
      ugIntake: dossier.defaultUgIntake,
      pgIntake: dossier.defaultPgIntake,
      labSharing: dossier.defaultLabSharing,
      municipalFsi: dossier.municipalFsi,
      scalePixelsFor10m: 240,
    });
  };

  return (
    <div className="space-y-4 sm:space-y-5 max-w-full">
      {/* 1. Header Section with Title, Subtitle, and Dossier Selector */}
      <BlueprintHeaderSection
        currentDossier={currentDossier}
        onSelectDossier={handleSelectDossier}
      />

      {/* 2. Top 4 KPI Summary Cards */}
      <BlueprintKpiCards dossier={currentDossier} simulation={simulation} />

      {/* 3. Main Architectural Vectorizer & What-If Intake Simulation Engine Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column (approx 65% width on desktop): Blueprint Vector Canvas */}
        <div className="lg:col-span-8">
          <BlueprintCanvas
            dossier={currentDossier}
            simulation={simulation}
            params={params}
            onUpdateParams={handleUpdateParams}
            onResetParams={handleResetParams}
          />
        </div>

        {/* Right Column (approx 35% width on desktop): What-If Intake & FSI Engine */}
        <div className="lg:col-span-4">
          <WhatIfIntakeEngine
            dossier={currentDossier}
            simulation={simulation}
            params={params}
            onUpdateParams={handleUpdateParams}
            onResetParams={handleResetParams}
          />
        </div>
      </div>
    </div>
  );
}

export default BlueprintAnalysisStudio;

