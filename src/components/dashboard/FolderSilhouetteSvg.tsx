"use client";

import React from "react";

/**
 * Shared SVG defs declaring the folder back silhouette and front glass panel silhouette
 * using clipPathUnits="objectBoundingBox" (normalized coordinates 0 to 1).
 * This ensures the folder silhouette scales responsively at any aspect ratio
 * while enabling hardware-accelerated backdrop-filter and clipping.
 */
export function FolderSilhouetteSvg() {
  return (
    <svg
      width="0"
      height="0"
      className="absolute pointer-events-none opacity-0 select-none overflow-hidden"
      aria-hidden="true"
    >
      <defs>
        {/* Back folder panel: lower left edge (y=0.15), smooth S-curve up to right tab (y=0.0) */}
        <clipPath id="folder-back-clip" clipPathUnits="objectBoundingBox">
          <path
            d="
              M 0, 0.24
              C 0, 0.18 0.03, 0.15 0.08, 0.15
              L 0.44, 0.15
              C 0.52, 0.15 0.55, 0.0 0.64, 0.0
              L 0.92, 0.0
              C 0.97, 0.0 1.0, 0.03 1.0, 0.08
              L 1.0, 0.92
              C 1.0, 0.97 0.97, 1.0 0.92, 1.0
              L 0.08, 1.0
              C 0.03, 1.0 0, 0.97 0, 0.92
              Z
            "
          />
        </clipPath>

        {/* Front glass panel: covers lower ~65% of the card; top edge S-curves down towards right */}
        <clipPath id="folder-front-clip" clipPathUnits="objectBoundingBox">
          <path
            d="
              M 0, 0.12
              C 0, 0.04 0.03, 0.0 0.08, 0.0
              L 0.42, 0.0
              C 0.49, 0.0 0.53, 0.18 0.60, 0.18
              L 0.92, 0.18
              C 0.97, 0.18 1.0, 0.22 1.0, 0.28
              L 1.0, 0.88
              C 1.0, 0.95 0.96, 1.0 0.90, 1.0
              L 0.10, 1.0
              C 0.04, 1.0 0, 0.95 0, 0.88
              Z
            "
          />
        </clipPath>
      </defs>
    </svg>
  );
}

