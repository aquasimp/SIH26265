"use client";

import React, { useState } from "react";
import { LeftGlassRail } from "./LeftGlassRail";
import { FloatingTopHeader } from "./FloatingTopHeader";
import { SyntheticBanner } from "./SyntheticBanner";
import { CommandPalette } from "./CommandPalette";
import { DemoScenarioPlayer } from "@/components/demo/DemoScenarioPlayer";

export function AppShellClient({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden selection:bg-amber-500/20 selection:text-amber-800 dark:selection:text-amber-300">
      {/* 1. Detached VisionOS Left Glass Rail */}
      <LeftGlassRail
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* 2. Main Content Canvas with Detached Left Margin on Desktop */}
      <div className="relative z-10 lg:pl-[304px] lg:pr-5 lg:pt-4 lg:pb-6 min-h-screen flex flex-col gap-4 p-3 sm:p-4 w-full">
        {/* Synthetic Data Regulatory Notice Banner */}
        <SyntheticBanner />

        {/* VisionOS Detached Floating Top Header */}
        <FloatingTopHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Page Content Viewport */}
        <main className="flex-1 w-full min-w-0 animate-glass-in pb-16 lg:pb-4">
          {children}
        </main>
      </div>

      {/* Global Modals */}
      <CommandPalette />
      <DemoScenarioPlayer />
    </div>
  );
}

export default AppShellClient;

