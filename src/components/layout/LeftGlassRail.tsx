"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { AshokaEmblem } from "@/components/brand/AshokaEmblem";
import {
  LayoutDashboard,
  Layers,
  ScanLine,
  Building,
  KeyRound,
  ShieldCheck,
  TrendingUp,
  Sliders,
  X,
  Sparkles,
} from "lucide-react";

export interface LeftGlassRailProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function LeftGlassRail({ mobileOpen = false, onCloseMobile }: LeftGlassRailProps) {
  const pathname = usePathname();
  const { t, language, setIsDemoModalOpen } = useApp();

  const navItems = [
    {
      label: t("dashboard"),
      href: "/",
      icon: LayoutDashboard,
      badge: null,
      badgeClass: "",
    },
    {
      label: t("repository"),
      href: "/repository",
      icon: Layers,
      badge: "140",
      badgeClass: "glass-well text-ink-secondary font-mono font-semibold px-2 py-0.5 rounded text-[10px]",
    },
    {
      label: t("intake"),
      href: "/intake",
      icon: ScanLine,
      badge: "OCR",
      badgeClass: "bg-saffron/15 text-saffron border border-saffron/25 font-mono font-bold px-1.5 py-0.5 rounded text-[10px]",
    },
    {
      label: t("institutionPortal"),
      href: "/institution",
      icon: Building,
      badge: "60",
      badgeClass: "glass-well text-ink-muted font-mono px-2 py-0.5 rounded text-[10px]",
    },
    {
      label: t("releaseWorkflow"),
      href: "/release-workflow",
      icon: KeyRound,
      badge: "HARD GATE",
      badgeClass: "bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/25 font-bold px-1.5 py-0.5 rounded text-[9.5px]",
    },
    {
      label: t("auditTrail"),
      href: "/audit-trail",
      icon: ShieldCheck,
      badge: "SHA-256",
      badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 font-mono font-bold px-1.5 py-0.5 rounded text-[9.5px]",
    },
    {
      label: t("metrics"),
      href: "/metrics",
      icon: TrendingUp,
      badge: null,
      badgeClass: "",
    },
    {
      label: t("settings"),
      href: "/settings",
      icon: Sliders,
      badge: null,
      badgeClass: "",
    },
  ];

  const content = (
    <div className="flex flex-col justify-between h-full w-full select-none">
      {/* Brand & Seal Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3.5 border-b border-ink-border">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-9 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <AshokaEmblem size={28} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold tracking-tight text-sm text-ink-primary font-serif">
                  AICTE
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-saffron/15 text-saffron border border-saffron/25">
                  SIH26265
                </span>
              </div>
              <div className="text-[11px] font-medium text-ink-muted truncate mt-1">
                Central Treasury Portal
              </div>
            </div>
          </Link>

          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg glass-well text-ink-muted hover:text-ink-primary"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Section Label */}
        <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-ink-muted font-bold">
          {language === "hi" ? "विनियामक मॉड्यूल" : "Treasury Navigation"}
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
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-white font-semibold shadow-xs"
                    : "text-ink-secondary hover:text-ink-primary hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-amber-400" : "text-ink-muted"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`shrink-0 ${item.badgeClass}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Guided Pitch Trigger & Statutory Custody Card */}
      <div className="space-y-2.5 pt-4 border-t border-ink-border">
        <button
          type="button"
          onClick={() => {
            setIsDemoModalOpen(true);
            onCloseMobile?.();
          }}
          className="w-full btn-liquid-primary py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>{language === "hi" ? "लाइव डेमो परिदृश्य" : "Live Demo Scenario"}</span>
        </button>

        <div className="p-3 glass-well rounded-xl text-[11px] space-y-1 text-ink-muted">
          <div className="font-semibold text-ink-primary font-serif flex items-center justify-between">
            <span>Regulation Bureau</span>
            <span className="text-[9.5px] font-mono px-1 rounded bg-black/5 dark:bg-white/10">HQ Delhi</span>
          </div>
          <div>APH Statutory Deposit Norms</div>
          <div className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 pt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>LEDGER SYNCHRONIZED</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Floating Liquid Glass Rail */}
      <aside className="hidden lg:flex fixed top-4 bottom-4 left-4 w-[280px] z-40 liquid-glass-card rounded-[24px] p-4.5 overflow-y-auto no-scrollbar shadow-md">
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
          <div className="relative w-80 max-w-[85vw] h-full liquid-glass-card p-4.5 flex flex-col z-10 shadow-2xl overflow-y-auto">
            {content}
          </div>
        </div>
      )}
    </>
  );
}

export default LeftGlassRail;

