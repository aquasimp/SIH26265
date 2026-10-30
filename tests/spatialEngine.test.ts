import { describe, it, expect } from "vitest";
import { calculateSpatialSimulation } from "@/lib/blueprint/spatialEngine";
import { SPATIAL_DOSSIERS } from "@/lib/blueprint/spatialData";
import { SimulationParams } from "@/types/blueprint";

describe("AICTE APH Chapter VII Spatial Simulation Engine", () => {
  const defaultDossier = SPATIAL_DOSSIERS["AICTE-2026-NW-0842"];

  it("should calculate exact baseline parameters matching official AICTE norms", () => {
    const params: SimulationParams = {
      ugIntake: 360,
      pgIntake: 90,
      labSharing: 15,
      municipalFsi: 2.0,
      scalePixelsFor10m: 240,
    };

    const result = calculateSpatialSimulation(defaultDossier, params);

    // Cohorts
    expect(result.totalUgCohort).toBe(1440); // 360 * 4
    expect(result.totalPgCohort).toBe(180);  // 90 * 2
    expect(result.totalStudents).toBe(1620); // 1440 + 180

    // Built-up requirements
    expect(result.totalRequiredBuiltUpM2).toBe(10512.5);
    expect(result.availableBuiltUpM2).toBe(8530);
    expect(result.builtUpDeficitM2).toBe(-1982.5);
    expect(result.isBuiltUpCompliant).toBe(false);

    // Land requirements
    expect(result.requiredLandAcres).toBe(2.5);
    expect(result.availableLandAcres).toBe(2.15);
    expect(result.landDeficitAcres).toBe(-0.35);
    expect(result.isLandCompliant).toBe(false);

    // Scale factor
    expect(result.scaleFactorMPerPx).toBe(0.04167);
  });

  it("should show surplus when intake is lowered within available capacity", () => {
    const lowIntakeParams: SimulationParams = {
      ugIntake: 180,
      pgIntake: 30,
      labSharing: 20,
      municipalFsi: 2.0,
      scalePixelsFor10m: 240,
    };

    const result = calculateSpatialSimulation(defaultDossier, lowIntakeParams);
    expect(result.totalStudents).toBe(780);
    expect(result.totalRequiredBuiltUpM2).toBeLessThan(8530);
    expect(result.builtUpDeficitM2).toBeGreaterThan(0);
    expect(result.isBuiltUpCompliant).toBe(true);
  });

  it("should verify multi-plot distance norm under Chapter I Clause 1.4", () => {
    expect(defaultDossier.interPlotDistanceKm).toBe(1.24);
    expect(defaultDossier.maxAllowedDistanceKm).toBe(2.0);
    expect(defaultDossier.interPlotDistanceKm).toBeLessThanOrEqual(defaultDossier.maxAllowedDistanceKm);
    expect(defaultDossier.plotCount).toBeLessThanOrEqual(defaultDossier.maxAllowedPlots);
    expect(defaultDossier.contiguityCompliant).toBe(true);
  });
});

