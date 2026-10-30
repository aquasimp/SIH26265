"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ScanLine,
  Compass,
  Menu,
} from "lucide-react";

export interface MobileBottomBarProps {
  onOpenMenu: () => void;
}

export function MobileBottomBar({ onOpenMenu }: MobileBottomBarProps) {
  const pathname = usePathname();

  const tabs = [
    {
      label: "Treasury",
      href: "/",
      icon: LayoutDashboard,
      isActive: pathname === "/" || pathname === "/dashboard",
    },
    {
      label: "Dossiers",
      href: "/repository",
      icon: FileText,
      isActive: pathname.startsWith("/repository"),
    },
    {
      label: "Scrutiny",
      href: "/intake",
      icon: ScanLine,
      isActive: pathname.startsWith("/intake"),
    },
    {
      label: "Blueprint",
      href: "/blueprint-analysis",
      icon: Compass,
      isActive: pathname.startsWith("/blueprint-analysis"),
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-2.5 left-3 right-3 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl p-1.5 shadow-xl flex items-center justify-around select-none safe-pb"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition-all ${
              tab.isActive
                ? "text-sky-600 dark:text-sky-400 font-bold bg-sky-50/80 dark:bg-sky-950/40"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 active:scale-95"
            }`}
          >
            <Icon className="w-4 h-4 mb-0.5" />
            <span className="truncate max-w-[56px]">{tab.label}</span>
          </Link>
        );
      })}

      {/* Menu / Drawer Toggle */}
      <button
        type="button"
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 active:scale-95 cursor-pointer"
        aria-label="Open all navigation options"
      >
        <Menu className="w-4 h-4 mb-0.5" />
        <span>Menu</span>
      </button>
    </nav>
  );
}

export default MobileBottomBar;

