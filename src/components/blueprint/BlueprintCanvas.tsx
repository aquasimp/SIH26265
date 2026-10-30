"use client";

import React, { useState, useRef } from "react";
import {
  SpatialDossier,
  RoomPolygon,
  SimulationParams,
  SimulationResult,
} from "@/types/blueprint";
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sliders,
  Layers,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Compass,
  FileCheck2,
  X,
} from "lucide-react";

interface BlueprintCanvasProps {
  dossier: SpatialDossier;
  simulation: SimulationResult;
  params: SimulationParams;
  onUpdateParams: (newParams: Partial<SimulationParams>) => void;
  onResetParams: () => void;
}

export function BlueprintCanvas({
  dossier,
  simulation,
  params,
  onUpdateParams,
  onResetParams,
}: BlueprintCanvasProps) {
  // Layer toggles
  const [showRoomPolygons, setShowRoomPolygons] = useState(true);
  const [showStructuralWalls, setShowStructuralWalls] = useState(true);
  const [showCorridorGuides, setShowCorridorGuides] = useState(true);
  const [showCornerHandles, setShowCornerHandles] = useState(true);
  const [viewMode, setViewMode] = useState<"blueprint" | "cadastral">("blueprint");

  // Zoom level state
  const [zoomLevel, setZoomLevel] = useState(100);

  // Hovered room state for interactive precision HUD tooltip
  const [hoveredRoom, setHoveredRoom] = useState<RoomPolygon | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Selected room for detailed inspector drawer/modal
  const [selectedRoom, setSelectedRoom] = useState<RoomPolygon | null>(null);

  // SVG ref
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const resetView = () => {
    setZoomLevel(100);
    onUpdateParams({ scalePixelsFor10m: 240 });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3.5 select-none">
      {/* =========================================================================
          SECTION HEADER & VERIFICATION BADGE
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
            ARCHITECTURAL VECTORIZATION & SPATIAL COMPLIANCE
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Interactive Blueprint Vectorizer & Space Simulator
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg">
            APH Chapter VII Verified Geometry
          </span>
        </div>
      </div>

      {/* =========================================================================
          TOOLBAR 1: LAYER TOGGLES & ZOOM CONTROLS
          ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Layer selector buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            LAYERS:
          </span>

          {/* 1. Room Polygons */}
          <button
            type="button"
            onClick={() => setShowRoomPolygons(!showRoomPolygons)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              showRoomPolygons
                ? "bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700 shadow-2xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-transparent hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Room Polygons
          </button>

          {/* 2. Structural Walls */}
          <button
            type="button"
            onClick={() => setShowStructuralWalls(!showStructuralWalls)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              showStructuralWalls
                ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 shadow-2xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-transparent hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Structural Walls
          </button>

          {/* 3. Corridor Guides */}
          <button
            type="button"
            onClick={() => setShowCorridorGuides(!showCorridorGuides)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              showCorridorGuides
                ? "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700 shadow-2xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-transparent hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Corridor Guides
          </button>

          {/* 4. Corner Handles */}
          <button
            type="button"
            onClick={() => setShowCornerHandles(!showCornerHandles)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              showCornerHandles
                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-2xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-transparent hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Corner Handles
          </button>
        </div>

        {/* View Controls: Reset & Zoom */}
        <div className="flex items-center gap-2">
          {/* Cadastral Land Plot Mode Toggle */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === "blueprint" ? "cadastral" : "blueprint")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === "cadastral"
                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-2xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
            title="Toggle between Architectural CAD Floor Plan and Cadastral Multi-Plot Map"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{viewMode === "cadastral" ? "Floor Plan View" : "Plot View"}</span>
          </button>
          <button
            type="button"
            onClick={resetView}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            title="Reset canvas transform and calibration"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200/80 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(z - 15, 60))}
              className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(z + 15, 180))}
              className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TOOLBAR 2: SCALE CALIBRATION BAR
          ========================================================================= */}
      <div className="bg-sky-50/70 dark:bg-sky-950/20 border border-sky-200/80 dark:border-sky-900/40 rounded-xl px-3.5 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
            📐 Scale Calibration:
          </span>
          <span className="font-mono text-sky-700 dark:text-sky-300 font-semibold bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
            s = {simulation.scaleFactorMPerPx} m/px (10m = {params.scalePixelsFor10m}px)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              Adjust (px):
            </span>
            <input
              type="range"
              min={180}
              max={300}
              step={5}
              value={params.scalePixelsFor10m}
              onChange={(e) =>
                onUpdateParams({ scalePixelsFor10m: Number(e.target.value) })
              }
              className="w-28 sm:w-36 h-1.5 bg-sky-200 dark:bg-sky-800 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
          </div>

          <button
            type="button"
            onClick={() => onUpdateParams({ scalePixelsFor10m: 240 })}
            className="text-[11px] font-semibold text-sky-700 dark:text-sky-300 hover:underline cursor-pointer"
          >
            Reset (10m = 240px)
          </button>
        </div>
      </div>

      {/* =========================================================================
          MAIN CAD VECTOR BLUEPRINT CANVAS (OR CADASTRAL MAP VIEW)
          ========================================================================= */}
      <div className="relative w-full h-[400px] sm:h-[450px] bg-[#0A1120] rounded-xl overflow-hidden border border-slate-800 shadow-inner">
        {/* Subtle coordinate grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle, #38bdf8 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* View mode 1: Architectural Blueprint CAD Floor Plan */}
        {viewMode === "blueprint" ? (
          <div
            className="w-full h-full overflow-auto flex items-center justify-center p-4 transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "center center" }}
          >
            <svg
              ref={svgRef}
              viewBox="0 0 740 410"
              className="w-full max-w-[740px] h-auto drop-shadow-2xl cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoveredRoom(null)}
            >
              {/* Engineering Blueprint Grid */}
              <defs>
                <pattern id="cadGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1e293b" strokeWidth="0.6" />
                </pattern>
                <pattern id="structuralHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="8" stroke="#475569" strokeWidth="1.2" />
                </pattern>
              </defs>

              <rect width="740" height="410" fill="url(#cadGrid)" />

              {/* Title Block in bottom right */}
              <g transform="translate(480, 365)" opacity="0.8">
                <rect width="240" height="36" fill="#0f172a" stroke="#334155" strokeWidth="1" rx="4" />
                <text x="10" y="15" fill="#94a3b8" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                  PROJECT: {dossier.dossierId}
                </text>
                <text x="10" y="27" fill="#38bdf8" fontSize="8.5" fontFamily="monospace">
                  SCALE: 1:250 • VERIFIED APH CH. VII
                </text>
              </g>

              {/* LAYER: Structural Walls */}
              {showStructuralWalls && (
                <g id="layer-walls">
                  {dossier.walls.map((w) => (
                    <line
                      key={w.id}
                      x1={w.x1}
                      y1={w.y1}
                      x2={w.x2}
                      y2={w.y2}
                      stroke={w.type === "EXTERNAL_SHEAR" ? "#cbd5e1" : "#94a3b8"}
                      strokeWidth={w.type === "EXTERNAL_SHEAR" ? "6" : "3.5"}
                      strokeLinecap="square"
                    />
                  ))}
                  {/* Structural Columns on grid intersections */}
                  {[
                    [30, 30], [195, 30], [355, 30], [465, 30], [690, 30],
                    [30, 145], [195, 145], [355, 145], [465, 145], [690, 145],
                    [30, 195], [165, 195], [355, 195], [690, 195],
                    [30, 370], [165, 370], [355, 370], [690, 370],
                  ].map(([cx, cy], idx) => (
                    <rect
                      key={`col-${idx}`}
                      x={cx - 5}
                      y={cy - 5}
                      width="10"
                      height="10"
                      fill="#e2e8f0"
                      stroke="#0f172a"
                      strokeWidth="1.5"
                    />
                  ))}
                </g>
              )}

              {/* LAYER: Corridor Clearance Guides */}
              {showCorridorGuides && (
                <g id="layer-corridors">
                  {dossier.corridors.map((cg) => (
                    <g key={cg.id}>
                      <line
                        x1={cg.x1}
                        y1={cg.y1}
                        x2={cg.x2}
                        y2={cg.y2}
                        stroke="#a855f7"
                        strokeWidth="1.8"
                        strokeDasharray="4 4"
                      />
                      <rect
                        x={(cg.x1 + cg.x2) / 2 - 80}
                        y={cg.y1 - 10}
                        width="160"
                        height="16"
                        fill="#581c87"
                        rx="3"
                        stroke="#a855f7"
                        strokeWidth="0.8"
                      />
                      <text
                        x={(cg.x1 + cg.x2) / 2}
                        y={cg.y1 + 1}
                        fill="#f3e8ff"
                        fontSize="8.5"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {cg.label}
                      </text>
                    </g>
                  ))}
                </g>
              )}

              {/* LAYER: Room Polygons */}
              {showRoomPolygons && (
                <g id="layer-rooms">
                  {dossier.rooms.map((room) => {
                    const isHovered = hoveredRoom?.id === room.id;
                    const isSelected = selectedRoom?.id === room.id;

                    return (
                      <g
                        key={room.id}
                        onMouseEnter={() => setHoveredRoom(room)}
                        onClick={() => setSelectedRoom(room)}
                        className="cursor-pointer transition-all"
                      >
                        <rect
                          x={room.x}
                          y={room.y}
                          width={room.width}
                          height={room.height}
                          fill={isHovered ? room.colorScheme.fill : room.colorScheme.bg}
                          stroke={isHovered || isSelected ? "#38bdf8" : room.colorScheme.stroke}
                          strokeWidth={isHovered || isSelected ? "2.5" : "1.2"}
                          strokeDasharray={room.category === "ACA" ? "6 3" : undefined}
                          rx="4"
                        />
                        {/* Room ID Tag */}
                        <text
                          x={room.x + 8}
                          y={room.y + 16}
                          fill={room.colorScheme.text}
                          fontSize="10"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {room.id}
                        </text>
                        {/* Room Name */}
                        <text
                          x={room.x + 8}
                          y={room.y + 28}
                          fill="#f8fafc"
                          fontSize="9"
                          fontWeight="600"
                        >
                          {room.name.length > 22 ? room.name.slice(0, 20) + "…" : room.name}
                        </text>
                        {/* Carpet Area */}
                        <text
                          x={room.x + 8}
                          y={room.y + 40}
                          fill="#94a3b8"
                          fontSize="8.5"
                          fontFamily="monospace"
                        >
                          {room.carpetAreaM2} m² • {room.capacity} cap
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* LAYER: Corner Handles */}
              {showCornerHandles && (
                <g id="layer-corners">
                  {dossier.corners.map((corner) => (
                    <g key={corner.id}>
                      <circle
                        cx={corner.x}
                        cy={corner.y}
                        r="4"
                        fill="#f59e0b"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        className="hover:scale-150 transition-transform cursor-pointer"
                      />
                    </g>
                  ))}
                </g>
              )}
            </svg>
          </div>
        ) : (
          /* View mode 2: Cadastral Land & Inter-Plot Contiguity Telemetry Map */
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-white">
            <svg viewBox="0 0 740 380" className="w-full max-w-[740px] h-auto">
              <defs>
                <pattern id="landGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="740" height="380" fill="url(#landGrid)" />

              {/* Plot A: Main Campus */}
              <g transform="translate(60, 80)">
                <rect
                  width="220"
                  height="180"
                  fill="rgba(14, 165, 233, 0.2)"
                  stroke="#0284c7"
                  strokeWidth="2"
                  rx="8"
                />
                <text x="15" y="30" fill="#38bdf8" fontSize="13" fontWeight="bold">
                  Plot 1: Main Academic Complex
                </text>
                <text x="15" y="48" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                  Survey No. 142/1 • 1.45 Acres
                </text>
                <text x="15" y="68" fill="#e2e8f0" fontSize="9.5">
                  Instructional Blocks, Admin, Library
                </text>
                <rect x="15" y="80" width="190" height="80" fill="#0369a1" fillOpacity="0.3" rx="4" stroke="#38bdf8" strokeDasharray="3 3" />
                <text x="110" y="125" fill="#bae6fd" fontSize="10" textAnchor="middle" fontWeight="bold">
                  8,530 m² Built-Up Footprint
                </text>
              </g>

              {/* Connecting Public Roadway */}
              <path
                d="M 280 170 C 340 170, 380 200, 440 200"
                fill="none"
                stroke="#64748b"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <path
                d="M 280 170 C 340 170, 380 200, 440 200"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="6 6"
              />

              {/* Telemetry Distance Arc Line */}
              <path
                d="M 280 140 Q 360 80, 440 150"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeDasharray="5 3"
              />

              {/* Distance Callout Badge */}
              <g transform="translate(310, 80)">
                <rect width="130" height="34" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" rx="17" />
                <text x="65" y="17" fill="#6ee7b7" fontSize="11" fontWeight="bold" textAnchor="middle">
                  1.24 km Distance
                </text>
                <text x="65" y="28" fill="#a7f3d0" fontSize="8" textAnchor="middle">
                  Limit: ≤ 2.0 km (Compliant)
                </text>
              </g>

              {/* Plot B: Hostels & Sports Ground */}
              <g transform="translate(440, 110)">
                <rect
                  width="220"
                  height="160"
                  fill="rgba(16, 185, 129, 0.2)"
                  stroke="#059669"
                  strokeWidth="2"
                  rx="8"
                />
                <text x="15" y="30" fill="#34d399" fontSize="13" fontWeight="bold">
                  Plot 2: Student Hostels & Athletic Ground
                </text>
                <text x="15" y="48" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                  Survey No. 144/3 • 0.70 Acres
                </text>
                <text x="15" y="68" fill="#e2e8f0" fontSize="9.5">
                  Hostel Block, Sports Field, Solar Plant
                </text>
                <rect x="15" y="80" width="190" height="60" fill="#047857" fillOpacity="0.3" rx="4" stroke="#34d399" strokeDasharray="3 3" />
                <text x="110" y="115" fill="#a7f3d0" fontSize="10" textAnchor="middle" fontWeight="bold">
                  Residential & Athletic Zone
                </text>
              </g>

              {/* Bottom Norm Reference */}
              <g transform="translate(60, 310)">
                <rect width="600" height="42" fill="#0f172a" stroke="#334155" strokeWidth="1" rx="6" />
                <text x="20" y="20" fill="#e2e8f0" fontSize="10" fontWeight="bold">
                  AICTE APH 2024–27 Chapter I Clause 1.4 Cadastral Land Norm:
                </text>
                <text x="20" y="34" fill="#94a3b8" fontSize="9.5">
                  &ldquo;Institutional land may be in maximum 3 plots separated by no more than 2.0 km walking/road distance.&rdquo;
                </text>
              </g>
            </svg>
          </div>
        )}

        {/* =========================================================================
            FLOATING INTERACTIVE HUD TOOLTIP ON HOVER
            ========================================================================= */}
        {hoveredRoom && viewMode === "blueprint" && (
          <div
            className="absolute z-30 pointer-events-none bg-slate-900/95 backdrop-blur-md text-white border border-sky-400/60 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 transition-all w-60"
            style={{
              left: Math.min(mousePos.x + 15, 470),
              top: Math.min(mousePos.y + 15, 270),
            }}
          >
            <div className="flex items-center justify-between pb-1 border-b border-slate-700">
              <span className="font-mono font-bold text-sky-400">{hoveredRoom.id}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                COMPLIANT
              </span>
            </div>
            <div className="font-bold text-white text-[12px] leading-tight">
              {hoveredRoom.name}
            </div>
            <div className="text-[10px] text-slate-400">
              Category: <span className="text-slate-200">{hoveredRoom.categoryLabel}</span>
            </div>
            <div className="grid grid-cols-2 gap-1 pt-1 font-mono text-[10.5px]">
              <div>
                <span className="text-slate-400">Area: </span>
                <span className="text-sky-300 font-bold">{hoveredRoom.carpetAreaM2} m²</span>
              </div>
              <div>
                <span className="text-slate-400">Dim: </span>
                <span className="text-slate-200">{hoveredRoom.widthM}m × {hoveredRoom.lengthM}m</span>
              </div>
              <div>
                <span className="text-slate-400">Height: </span>
                <span className="text-slate-200">{hoveredRoom.heightM}m</span>
              </div>
              <div>
                <span className="text-slate-400">Seats: </span>
                <span className="text-slate-200">{hoveredRoom.capacity}</span>
              </div>
            </div>
            <div className="text-[9.5px] text-slate-400 italic pt-0.5 border-t border-slate-800">
              Ref: {hoveredRoom.clauseRef}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          SELECTED ROOM INSPECTION MODAL / DRAWER
          ========================================================================= */}
      {selectedRoom && (
        <div className="bg-slate-50 dark:bg-slate-800/80 border border-sky-300 dark:border-sky-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-glass-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-950 px-2 py-0.5 rounded">
                {selectedRoom.id}
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {selectedRoom.name}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Clause Verified
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Measured Area: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedRoom.carpetAreaM2} m²</span> (Norm: ≥ {selectedRoom.normAreaM2} m²) • Ceiling: {selectedRoom.heightM}m • Fire Egress: Compliant (≤ 25m)
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedRoom(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BlueprintCanvas;
