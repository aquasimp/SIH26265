"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { UserRole } from "@/types/rbac";
import { AshokaEmblem } from "@/components/brand/AshokaEmblem";
import {
  Menu,
  Search,
  Sun,
  Moon,
  Sparkles,
  ChevronDown,
  UserCheck,
  ShieldCheck,
  Globe,
} from "lucide-react";

export interface FloatingTopHeaderProps {
  onOpenMobileMenu?: () => void;
}

export function FloatingTopHeader({ onOpenMobileMenu }: FloatingTopHeaderProps) {
  const pathname = usePathname();
  const {
    currentRole,
    currentUser,
    setRole,
    language,
    setLanguage,
    t,
    isDarkMode,
    toggleDarkMode,
    setIsCmdOpen,
    setIsDemoModalOpen,
  } = useApp();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const rolesList: { role: UserRole; label: string; dept: string }[] = [
    { role: "INSTITUTION_USER", label: "Institution Signatory", dept: "Aryavarta Institute" },
    { role: "SCRUTINY_OFFICER", label: "Scrutiny Officer", dept: "Verification Cell, HQ" },
    { role: "REGIONAL_OFFICER", label: "Regional Officer", dept: "Western Regional Office" },
    { role: "BUREAU_HEAD", label: "Bureau Head (Authority)", dept: "Regulation Bureau" },
    { role: "AUDITOR", label: "Statutory Auditor", dept: "CAG Compliance" },
  ];

  const getRouteLabel = () => {
    if (pathname === "/") return t("dashboard");
    if (pathname.startsWith("/repository")) return t("repository");
    if (pathname.startsWith("/intake")) return t("intake");
    if (pathname.startsWith("/institution")) return t("institutionPortal");
    if (pathname.startsWith("/release-workflow")) return t("releaseWorkflow");
    if (pathname.startsWith("/audit-trail")) return t("auditTrail");
    if (pathname.startsWith("/metrics")) return t("metrics");
    if (pathname.startsWith("/settings")) return t("settings");
    return "Treasury";
  };

  return (
    <header className="liquid-glass-card rounded-[20px] px-3.5 py-2.5 sm:px-5 sm:py-3 flex items-center justify-between gap-3 shadow-sm relative z-20 w-full select-none">
      {/* Left: Mobile Toggle + Emblem + Breadcrumb */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden glass-well h-9 w-9 rounded-xl flex items-center justify-center text-ink-primary hover:bg-black/5 dark:hover:bg-white/10 shrink-0 cursor-pointer transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-8 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <AshokaEmblem size={26} />
          </div>
          <div className="min-w-0 hidden sm:block">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold tracking-tight text-sm text-ink-primary font-serif">
                AICTE
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25">
                APH 2026
              </span>
            </div>
            <div className="text-[11px] font-medium text-ink-muted truncate mt-0.5">
              {getRouteLabel()}
            </div>
          </div>
        </Link>

        {/* Mobile Route Breadcrumb */}
        <div className="sm:hidden flex items-center text-xs font-semibold text-ink-primary truncate pl-1 border-l border-ink-border">
          {getRouteLabel()}
        </div>
      </div>

      {/* Center: Search Omnibar */}
      <div className="flex-1 max-w-md mx-2 hidden md:block">
        <button
          type="button"
          onClick={() => setIsCmdOpen(true)}
          className="w-full glass-well hover:border-amber-500/40 rounded-xl px-3 py-2 text-xs text-ink-muted hover:text-ink-primary flex items-center justify-between transition-all cursor-pointer shadow-inner"
          title="Search by FDR No, Bank, IFSC, College name... (Ctrl K)"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Search className="h-3.5 w-3.5 text-ink-muted shrink-0" />
            <span className="truncate text-[11.5px]">{t("searchPlaceholder")}</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-paper-50 dark:bg-slate-800 text-ink-secondary rounded border border-ink-border shadow-2xs shrink-0">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Role Switcher, Bilingual Toggle, Dark Mode, Guided Demo */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Guided Demo Launcher */}
        <button
          type="button"
          onClick={() => setIsDemoModalOpen(true)}
          className="btn-liquid-primary px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
          title="Play 3-minute hackathon jury evaluation demo scenario"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">{language === "hi" ? "डेमो" : "Pitch Demo"}</span>
        </button>

        {/* Role Switcher Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-medium glass-well hover:border-ink-secondary text-ink-primary transition-colors cursor-pointer"
            aria-expanded={isRoleDropdownOpen}
          >
            <UserCheck className="w-3.5 h-3.5 text-saffron shrink-0" />
            <span className="hidden xl:inline text-[11px] truncate max-w-[120px]">
              {currentUser.name}
            </span>
            <ChevronDown className="w-3 h-3 text-ink-muted" />
          </button>

          {isRoleDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsRoleDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-64 liquid-glass-card rounded-2xl shadow-xl z-40 py-1.5 overflow-hidden animate-glass-in">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-ink-muted border-b border-ink-border">
                  {t("roleSwitcher")}
                </div>
                {rolesList.map((r) => (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => {
                      setRole(r.role);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors flex flex-col cursor-pointer ${
                      currentRole === r.role
                        ? "bg-saffron text-white font-medium"
                        : "text-ink-primary hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <span>{r.label}</span>
                    <span
                      className={`text-[10px] font-mono ${
                        currentRole === r.role ? "text-white/80" : "text-ink-muted"
                      }`}
                    >
                      {r.dept}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bilingual Language Switcher */}
        <button
          type="button"
          onClick={() => setLanguage(language === "en" ? "hi" : "en")}
          className="glass-well hover:border-ink-secondary text-ink-primary h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          title={language === "en" ? "हिन्दी में बदलें" : "Switch to English"}
        >
          <Globe className="w-3.5 h-3.5 text-ink-muted" />
          <span>{language === "en" ? "HI" : "EN"}</span>
        </button>

        {/* Dark / Light Mode Switcher */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="glass-well hover:border-ink-secondary text-ink-primary h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
          title={isDarkMode ? "Switch to Warm Paper Mode" : "Switch to True Obsidian OLED Mode"}
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-400 rotate-0 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 rotate-0 transition-transform" />
          )}
        </button>
      </div>
    </header>
  );
}

export default FloatingTopHeader;

