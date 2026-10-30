"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { UserRole } from "@/types/rbac";
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
  UserCheck,
  Sparkles,
  Menu,
} from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const {
    t,
    currentRole,
    currentUser,
    setRole,
    language,
    setLanguage,
    isMobileNavOpen,
    setIsMobileNavOpen,
    setIsDemoModalOpen,
  } = useApp();

  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer on route change
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname, setIsMobileNavOpen]);

  // Handle Escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileNavOpen) {
        setIsMobileNavOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileNavOpen, setIsMobileNavOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileNavOpen]);

  const navItems = [
    { label: t("dashboard"), href: "/", icon: LayoutDashboard },
    { label: t("repository"), href: "/repository", icon: Layers },
    { label: t("intake"), href: "/intake", icon: ScanLine },
    { label: t("institutionPortal"), href: "/institution", icon: Building },
    { label: t("releaseWorkflow"), href: "/release-workflow", icon: KeyRound },
    { label: t("auditTrail"), href: "/audit-trail", icon: ShieldCheck },
    { label: t("metrics"), href: "/metrics", icon: TrendingUp },
    { label: t("settings"), href: "/settings", icon: Sliders },
  ];

  const rolesList: { role: UserRole; label: string; dept: string }[] = [
    { role: "INSTITUTION_USER", label: "Institution Signatory", dept: "Aryavarta Institute" },
    { role: "SCRUTINY_OFFICER", label: "Scrutiny Officer", dept: "Verification Cell, HQ" },
    { role: "REGIONAL_OFFICER", label: "Regional Officer", dept: "Western Regional Office" },
    { role: "BUREAU_HEAD", label: "Bureau Head", dept: "Regulation Bureau" },
    { role: "AUDITOR", label: "Statutory Auditor", dept: "CAG Compliance" },
  ];

  return (
    <>
      {/* --------------------------------------------------------------------- */}
      {/* 1. SLIDING MOBILE DRAWER SHEET (< 768px)                              */}
      {/* --------------------------------------------------------------------- */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileNavOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
            className="relative w-4/5 max-w-xs bg-paper-50 dark:bg-stone-900 border-r border-ink-border h-[100dvh] flex flex-col justify-between shadow-2xl z-10 overflow-y-auto"
          >
            {/* Top: Emblem, Title & Close Button */}
            <div className="p-4 border-b border-ink-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-saffron text-white flex items-center justify-center font-serif font-bold text-sm shadow-sm">
                  AI
                </div>
                <div>
                  <h2 className="font-serif font-bold text-xs text-ink-primary">
                    AICTE Treasury
                  </h2>
                  <p className="text-[10px] text-ink-muted">Regulation Bureau</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="p-2 -mr-2 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-paper-200 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors focus:ring-2 focus:ring-saffron"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Middle: Navigation Links */}
            <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
              <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-ink-muted">
                Institutional Portals
              </div>
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
                    className={`flex items-center gap-3 px-3 py-2.5 text-xs rounded-md transition-colors min-h-[44px] ${
                      isActive
                        ? "bg-saffron text-white font-semibold shadow-sm"
                        : "text-ink-secondary hover:text-ink-primary hover:bg-paper-200"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-ink-muted"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Demo Scenario Trigger */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileNavOpen(false);
                    setIsDemoModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs rounded-md bg-saffron/10 border border-saffron/30 text-saffron font-semibold min-h-[44px] hover:bg-saffron/20 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-saffron shrink-0" />
                  <span>Run Demo Scenario</span>
                </button>
              </div>

              {/* Language Switcher */}
              <div className="pt-2 border-t border-ink-border mt-3">
                <div className="text-[10px] font-mono text-ink-muted px-3 py-1 uppercase">
                  Language / भाषा
                </div>
                <div className="grid grid-cols-2 gap-1 px-2">
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    className={`py-2 text-xs font-mono rounded min-h-[44px] transition-colors ${
                      language === "en"
                        ? "bg-ink-primary text-paper-50 font-bold"
                        : "bg-paper-200 text-ink-secondary hover:bg-paper-300"
                    }`}
                  >
                    English (EN)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("hi")}
                    className={`py-2 text-xs font-mono rounded min-h-[44px] transition-colors ${
                      language === "hi"
                        ? "bg-ink-primary text-paper-50 font-bold"
                        : "bg-paper-200 text-ink-secondary hover:bg-paper-300"
                    }`}
                  >
                    हिन्दी (HI)
                  </button>
                </div>
              </div>

              {/* Role Switcher in Drawer */}
              <div className="pt-3 border-t border-ink-border mt-3">
                <div className="text-[10px] font-mono text-ink-muted px-3 py-1 uppercase">
                  Active Officer Role
                </div>
                <div className="space-y-1">
                  {rolesList.map((item) => (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => setRole(item.role)}
                      className={`w-full text-left px-3 py-2 text-xs rounded-md flex items-center justify-between min-h-[44px] transition-colors ${
                        currentRole === item.role
                          ? "bg-paper-200 font-bold text-ink-primary border border-ink-border"
                          : "text-ink-secondary hover:bg-paper-100"
                      }`}
                    >
                      <div>
                        <div>{item.label}</div>
                        <div className="text-[10px] text-ink-muted">{item.dept}</div>
                      </div>
                      {currentRole === item.role && (
                        <div className="w-2 h-2 rounded-full bg-saffron shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </nav>

            {/* Bottom Footer in Drawer */}
            <div className="p-3 bg-paper-100 border-t border-ink-border text-[10px] text-ink-muted font-mono">
              <div className="font-semibold text-ink-primary font-serif">Regulation Bureau</div>
              <div>SIH26265 • APH 2026 Compliant</div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 2. FIXED MOBILE BOTTOM NAVIGATION BAR (< 768px)                       */}
      {/* --------------------------------------------------------------------- */}
      <nav
        aria-label="Mobile Quick Navigation"
        className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-paper-50/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-ink-border shadow-ledger-elevated pb-[calc(env(safe-area-inset-bottom)+0.25rem)]"
      >
        <div className="grid grid-cols-5 items-center justify-around h-14">
          {/* 1. Console */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center h-full min-h-[44px] text-[10px] font-medium transition-colors ${
              pathname === "/" ? "text-saffron font-bold" : "text-ink-muted hover:text-ink-primary"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mb-0.5 shrink-0" />
            <span>Console</span>
          </Link>

          {/* 2. Repository */}
          <Link
            href="/repository"
            className={`flex flex-col items-center justify-center h-full min-h-[44px] text-[10px] font-medium transition-colors ${
              pathname.startsWith("/repository")
                ? "text-saffron font-bold"
                : "text-ink-muted hover:text-ink-primary"
            }`}
          >
            <Layers className="w-4 h-4 mb-0.5 shrink-0" />
            <span>Repo</span>
          </Link>

          {/* 3. OCR Intake */}
          <Link
            href="/intake"
            className={`flex flex-col items-center justify-center h-full min-h-[44px] text-[10px] font-medium transition-colors ${
              pathname.startsWith("/intake")
                ? "text-saffron font-bold"
                : "text-ink-muted hover:text-ink-primary"
            }`}
          >
            <ScanLine className="w-4 h-4 mb-0.5 shrink-0" />
            <span>Intake</span>
          </Link>

          {/* 4. Release */}
          <Link
            href="/release-workflow"
            className={`flex flex-col items-center justify-center h-full min-h-[44px] text-[10px] font-medium transition-colors ${
              pathname.startsWith("/release-workflow")
                ? "text-saffron font-bold"
                : "text-ink-muted hover:text-ink-primary"
            }`}
          >
            <KeyRound className="w-4 h-4 mb-0.5 shrink-0" />
            <span>Release</span>
          </Link>

          {/* 5. Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            className="flex flex-col items-center justify-center h-full min-h-[44px] text-[10px] font-medium text-ink-muted hover:text-ink-primary transition-colors"
            aria-label="Open full navigation drawer"
          >
            <Menu className="w-4 h-4 mb-0.5 shrink-0" />
            <span>Menu</span>
          </button>
        </div>
      </nav>
    </>
  );
}

