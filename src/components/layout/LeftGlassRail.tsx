"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { AshokaEmblem } from "@/components/brand/AshokaEmblem";
import {
  LayoutDashboard,
  FileText,
  ScanLine,
  Fingerprint,
  Compass,
  UserCheck,
  GitMerge,
  AlertTriangle,
  Binary,
  BarChart2,
  X,
} from "lucide-react";

export interface LeftGlassRailProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function LeftGlassRail({ mobileOpen = false, onCloseMobile }: LeftGlassRailProps) {
  const pathname = usePathname();
  const { language } = useApp();

  const navItems = [
    {
      label: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      badge: null,
      badgeClass: "",
    },
    {
      label: "Institutional Dossiers",
      href: "/repository",
      icon: FileText,
      badge: "4,820",
      badgeClass: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono font-semibold px-2 py-0.5 rounded-full text-[10.5px]",
    },
    {
      label: "Scrutiny Workbench",
      href: "/intake",
      icon: ScanLine,
      badge: "LIVE",
      badgeClass: "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold px-2 py-0.5 rounded-full text-[9.5px]",
      hasPulseDot: true,
    },
    {
      label: "Forensic Analysis",
      href: "/audit-trail",
      icon: Fingerprint,
      badge: null,
      badgeClass: "",
    },
    {
      label: "Blueprint Analysis",
      href: "/blueprint-analysis",
      icon: Compass,
      badge: null,
      badgeClass: "",
    },
    {
      label: "Faculty Verification",
      href: "/institution",
      icon: UserCheck,
      badge: null,
      badgeClass: "",
    },
    {
      label: "Authority Bridge",
      href: "/release-workflow",
      icon: GitMerge,
      badge: null,
      badgeClass: "",
    },
    {
      label: "Deficiency Notices",
      href: "/deficiency-notices",
      icon: AlertTriangle,
      badge: "2",
      badgeClass: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full text-[10.5px]",
    },
    {
      label: "Audit Ledger",
      href: "/audit-trail",
      icon: Binary,
      badge: null,
      badgeClass: "",
    },
    {
      label: "Reports & Analytics",
      href: "/metrics",
      icon: BarChart2,
      badge: null,
      badgeClass: "",
    },
  ];

  const content = (
    <div className="flex flex-col justify-between h-full w-full select-none">
      {/* Brand & Seal Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-9 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <AshokaEmblem size={28} />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold tracking-tight text-sm text-slate-900 dark:text-white uppercase font-sans leading-none">
                AICTE SCRUTINY
              </div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">
                REGULATION BUREAU • APH - 26
              </div>
            </div>
          </Link>

          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${isActive
                    ? "bg-[#EEF5FF] dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-300 font-semibold border border-[#BFDBFE] dark:border-blue-800/70 shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/50"
                  }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${isActive ? "text-[#2563EB] dark:text-blue-400" : "text-slate-400 dark:text-slate-500"
                      }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`shrink-0 flex items-center gap-1 ${item.badgeClass}`}>
                    {item.hasPulseDot && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    )}
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System Status Card (DPI Bridge Simulated, 6/6 Connected) */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="rounded-2xl p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-800 text-[11px] space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
            <span>SYSTEM STATUS</span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold normal-case">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>
          <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
            DPI Bridge (Simulated)
          </div>
          <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
            6/6 Connected
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
            <span>Last Sync 2 mins ago</span>
            <span className="font-mono">v4.2.0</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Floating Rail */}
      <aside className="hidden lg:flex fixed top-4 bottom-4 left-4 w-[280px] z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4.5 overflow-y-auto no-scrollbar shadow-sm">
        {content}
      </aside>

      {/* Mobile Sliding Drawer (< 1024px) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity duration-300"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative w-80 max-w-[85vw] h-full bg-white dark:bg-slate-900 p-4.5 flex flex-col z-10 shadow-2xl overflow-y-auto">
            {content}
          </div>
        </div>
      )}
    </>
  );
}

export default LeftGlassRail;
