"use client";

import React, { useState } from "react";
import { LeftGlassRail } from "./LeftGlassRail";
import { FloatingTopHeader } from "./FloatingTopHeader";
import { CommandPalette } from "./CommandPalette";
import { DemoScenarioPlayer } from "@/components/demo/DemoScenarioPlayer";

export function AppShellClient({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#F5F8FC] dark:bg-[#0B0F17] text-[#162033] dark:text-[#F8FAFC] font-sans antialiased transition-colors duration-200">
      {/* 1. Left Fixed Enterprise Navigation Sidebar */}
      <LeftGlassRail
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* 2. Main Content Canvas with Left Offset on Desktop */}
      <div className="lg:pl-[260px] min-h-screen flex flex-col w-full">
        {/* Horizontal Header */}
        <FloatingTopHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Page Content Viewport */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
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
