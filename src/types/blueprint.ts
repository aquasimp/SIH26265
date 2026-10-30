export type AphSpaceCategory = 'INA' | 'ADA' | 'AMA' | 'ACA';

export interface RoomPolygon {
  id: string;
  name: string;
  category: AphSpaceCategory;
  categoryLabel: string;
  carpetAreaM2: number;
  normAreaM2: number;
  widthM: number;
  lengthM: number;
  heightM: number;
  capacity: number;
  isCompliant: boolean;
  clauseRef: string;
  // Canvas coordinate geometry (in px at 10m = 240px calibration)
  x: number;
  y: number;
  width: number;
  height: number;
  colorScheme: {
    bg: string;
    stroke: string;
    fill: string;
    text: string;
    badge: string;
  };
}

export interface WallSegment {
  id: string;
  type: 'EXTERNAL_SHEAR' | 'INTERNAL_PARTITION' | 'COLUMN';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thicknessMm: number;
}

export interface CorridorGuide {
  id: string;
  label: string;
  measuredWidthM: number;
  minRequiredWidthM: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isCompliant: boolean;
}

export interface CornerHandle {
  id: string;
  x: number;
  y: number;
  realXm: number;
  realYm: number;
}

export interface CadastralPlot {
  plotId: string;
  surveyNo: string;
  title: string;
  areaAcres: number;
  currentUse: string;
  distanceKmToMain: number;
  isWithinNorm: boolean;
  coordinates: { x: number; y: number; width: number; height: number };
}

export interface SpatialDossier {
  dossierId: string;
  institutionName: string;
  shortName: string;
  region: string;
  regionCode: string;
  pid: string;
  aisheCode: string;
  address: string;
  
  // Total Built-up Area
  availableBuiltUpAreaM2: number;
  baselineRequiredBuiltUpAreaM2: number;
  carpetAreaM2: number;
  circulationAreaM2: number;
  
  // Municipal Land & FSI
  availableLandAcres: number;
  requiredLandAcres: number;
  municipalFsi: number;
  zoneType: string;
  
  // Wall Continuity
  wallContinuityAccuracy: number;
  cleanWallSegments: number;
  totalWallSegments: number;
  
  // Multi-Plot Contiguity
  plotCount: number;
  maxAllowedPlots: number;
  interPlotDistanceKm: number;
  maxAllowedDistanceKm: number;
  contiguityCompliant: boolean;
  
  // Baseline Intake
  defaultUgIntake: number;
  defaultPgIntake: number;
  defaultLabSharing: number;
  
  // Geometric elements
  rooms: RoomPolygon[];
  walls: WallSegment[];
  corridors: CorridorGuide[];
  corners: CornerHandle[];
  plots: CadastralPlot[];
}

export interface SimulationParams {
  ugIntake: number;
  pgIntake: number;
  labSharing: number;
  municipalFsi: number;
  scalePixelsFor10m: number;
}

export interface SimulationResult {
  totalUgCohort: number;
  totalPgCohort: number;
  totalStudents: number;
  
  requiredInaM2: number;
  requiredAdaM2: number;
  requiredAmaM2: number;
  requiredAcaM2: number;
  totalRequiredBuiltUpM2: number;
  
  availableBuiltUpM2: number;
  builtUpDeficitM2: number;
  isBuiltUpCompliant: boolean;
  
  requiredLandAcres: number;
  availableLandAcres: number;
  landDeficitAcres: number;
  isLandCompliant: boolean;
  
  fsiUtilizationPct: number;
  scaleFactorMPerPx: number;
}

