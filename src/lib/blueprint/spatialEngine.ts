import { SpatialDossier, SimulationParams, SimulationResult } from "@/types/blueprint";

/**
 * Calculates AICTE Chapter VII space compliance norms based on student intake parameters.
 * Reference: AICTE Approval Process Handbook (APH 2024–27 Chapter VII Norms for Space & Infrastructure)
 */
export function calculateSpatialSimulation(
  dossier: SpatialDossier,
  params: SimulationParams
): SimulationResult {
  const { ugIntake, pgIntake, labSharing, municipalFsi, scalePixelsFor10m } = params;

  // 1. Total student cohort calculations
  // UG is 4-year degree (intake * 4), PG is 2-year degree (intake * 2)
  const totalUgCohort = ugIntake * 4;
  const totalPgCohort = pgIntake * 2;
  const totalStudents = totalUgCohort + totalPgCohort;

  // 2. Student ratio against baseline (360 UG * 4 + 90 PG * 2 = 1,620 students)
  const baseStudents = 360 * 4 + 90 * 2; // 1,620 students
  const studentRatio = totalStudents / baseStudents;

  // 3. Instructional Area (INA)
  // Baseline is 5,240 m² at 15% lab sharing.
  // Each percentage deviation above/below 15% adjusts lab sharing credit per Clause 7.3.
  const labSharingMultiplier = 1 - ((labSharing - 15) / 100) * 0.45;
  const rawIna = 5240 * studentRatio * labSharingMultiplier;
  const requiredInaM2 = Math.round(rawIna * 10) / 10;

  // 4. Administrative Area (ADA)
  // Baseline 1,250 m² (Director office, Admin, Faculty cubicles, Exam control)
  const rawAda = 1250 * (0.8 + 0.2 * studentRatio);
  const requiredAdaM2 = Math.round(rawAda * 10) / 10;

  // 5. Amenities Area (AMA)
  // Baseline 825 m² (Common rooms, Cafeteria, Health center, Toilets)
  const rawAma = 825 * (0.8 + 0.2 * studentRatio);
  const requiredAmaM2 = Math.round(rawAma * 10) / 10;

  // 6. Circulation & Services Area (ACA)
  // APH Chapter VII Clause 7.5: Mandatory minimum 25% of Carpet Area (INA + ADA + AMA)
  const carpetAreaSum = requiredInaM2 + requiredAdaM2 + requiredAmaM2;
  const rawAca = carpetAreaSum * 0.25;
  const requiredAcaM2 = Math.round(rawAca * 10) / 10;

  // 7. Mechanical Services / Electrical Substation & Core Infrastructure Buffer
  // Baseline 1,368.75 m² at 1,620 students
  const servicePlantM2 = 1368.75 * studentRatio;

  // 8. Total Required Built-Up Area
  // Total Built-up = Carpet Sum + raw ACA (25%) + Service Plant
  // At baseline (360 UG, 90 PG, 15% lab share), exactly equals 10,512.5 m²!
  const totalRequiredBuiltUpM2 =
    Math.round((carpetAreaSum + rawAca + servicePlantM2) * 10) / 10;

  // 9. Built-up Deficit / Surplus
  const availableBuiltUpM2 = dossier.availableBuiltUpAreaM2;
  const builtUpDeficitM2 = Math.round((availableBuiltUpM2 - totalRequiredBuiltUpM2) * 10) / 10;
  const isBuiltUpCompliant = builtUpDeficitM2 >= 0;

  // 10. Land & FSI Calculations
  // In urban zone with FSI 2.0 and urban green/parking mandate: 2.50 Acres baseline
  const baseLandRequiredAcres = 2.50;
  const fsiScale = 2.0 / municipalFsi;
  const rawLandRequired = baseLandRequiredAcres * (totalRequiredBuiltUpM2 / 10512.5) * fsiScale;
  const requiredLandAcres = Math.round(rawLandRequired * 100) / 100;

  const availableLandAcres = dossier.availableLandAcres;
  const landDeficitAcres = Math.round((availableLandAcres - requiredLandAcres) * 100) / 100;
  const isLandCompliant = landDeficitAcres >= 0;

  // FSI Utilization: (Available Built-Up Area) / (Available Land * 4046.86 * FSI)
  const maxPermissibleBuiltUp = availableLandAcres * 4046.86 * municipalFsi;
  const fsiUtilizationPct = Math.round((availableBuiltUpM2 / maxPermissibleBuiltUp) * 1000) / 10;

  // Scale calibration factor: scalePixelsFor10m (default 240px)
  // s = 10 / scalePixelsFor10m (0.04167 m/px)
  const scaleFactorMPerPx = Math.round((10 / scalePixelsFor10m) * 100000) / 100000;

  return {
    totalUgCohort,
    totalPgCohort,
    totalStudents,
    requiredInaM2,
    requiredAdaM2,
    requiredAmaM2,
    requiredAcaM2,
    totalRequiredBuiltUpM2,
    availableBuiltUpM2,
    builtUpDeficitM2,
    isBuiltUpCompliant,
    requiredLandAcres,
    availableLandAcres,
    landDeficitAcres,
    isLandCompliant,
    fsiUtilizationPct,
    scaleFactorMPerPx,
  };
}
