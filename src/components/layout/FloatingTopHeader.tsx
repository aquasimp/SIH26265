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
  ChevronDown,
  Bell,
  Check,
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
    isDarkMode,
    toggleDarkMode,
    setIsCmdOpen,
  } = useApp();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const rolesList: { role: UserRole; label: string; dept: string }[] = [
    { role: "REGIONAL_OFFICER", label: "Shri R.K. Verma (RO - 04)", dept: "Regional Scrutiny Officer" },
    { role: "SCRUTINY_OFFICER", label: "Pooja Deshmukh", dept: "Verification Cell, HQ" },
    { role: "INSTITUTION_USER", label: "Dr. K. S. Ramanujan", dept: "Apex Institute Signatory" },
    { role: "BUREAU_HEAD", label: "Prof. Ananya Sengupta", dept: "Regulation Bureau (Authority)" },
    { role: "AUDITOR", label: "Vikramaditya Nair", dept: "Statutory Auditor (CAG)" },
  ];

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl px-3.5 py-2 sm:px-5 sm:py-2.5 flex items-center justify-between gap-3 shadow-xs relative z-20 w-full select-none">
      {/* Left: Mobile Toggle + Emblem + Brand + APH Badge */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 cursor-pointer transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-8 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <AshokaEmblem size={26} />
          </div>
          <div className="min-w-0 hidden sm:block">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold tracking-tight text-sm text-slate-900 dark:text-white font-sans">
                AICTE
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0369A1] dark:text-sky-300 border border-[#BAE6FD] dark:border-sky-800/80">
                APH 2024–27
              </span>
            </div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
              Regulatory Treasury & Scrutiny Workstation
            </div>
          </div>
        </Link>
      </div>

      {/* Center: Search Omnibar */}
      <div className="flex-1 max-w-md mx-2 hidden md:block">
        <button
          type="button"
          onClick={() => setIsCmdOpen(true)}
          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl px-3.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-between transition-all cursor-pointer shadow-inner"
          title="Search by FDR No, Bank, IFSC, College name, PID... (Ctrl K)"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate text-[11.5px]">
              Search by FDR No, Bank, IFSC, College name, PID...
            </span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-600 shadow-2xs shrink-0">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Notifications, Bilingual Toggle, Dark Mode, Profile */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Notification Bell with indicator dot */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative"
            title="Regulatory deficiency and inspection alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {notificationsOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setNotificationsOpen(false)} />
              <div className="absolute right-0 mt-1.5 w-72 sm:w-80 max-w-[calc(100vw-24px)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-40 py-2 animate-glass-in">
                <div className="px-3.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span>Deficiency Alerts (2 Active)</span>
                  <span className="text-rose-600 font-bold">APH Clause 7.8</span>
                </div>
                <div className="p-2 space-y-1.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60">
                    <div className="font-bold text-amber-900 dark:text-amber-200">
                      Spatial Deficit: Apex Inst. of Tech
                    </div>
                    <div className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                      Shortfall of 1,982.5 m² in required built-up area for proposed intake.
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      Cadastral Contiguity Cleared
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Plot 1 & 2 separation measured at 1.24 km (Limit: ≤ 2.0 km).
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bilingual Language Switcher (EN | हिन्दी) */}
        <button
          type="button"
          onClick={() => setLanguage(language === "en" ? "hi" : "en")}
          className="border border-slate-200/90 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-1"
          title={language === "en" ? "हिन्दी में बदलें" : "Switch to English"}
        >
          <span className={language === "en" ? "font-bold text-sky-700 dark:text-sky-400" : "text-slate-500"}>
            EN
          </span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className={language === "hi" ? "font-bold text-sky-700 dark:text-sky-400" : "text-slate-500"}>
            हिन्दी
          </span>
        </button>

        {/* Dark / Light Mode Switcher */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-400 rotate-0 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 rotate-0 transition-transform" />
          )}
        </button>

        {/* User Profile Badge (Shri R.K. Verma - RO - 04) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors cursor-pointer"
            aria-expanded={isRoleDropdownOpen}
          >
            {/* Blue Avatar circle with RV */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              RV
            </div>

            <div className="hidden sm:block text-left leading-tight min-w-0">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {currentUser.designation}
              </div>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isRoleDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsRoleDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-64 max-w-[calc(100vw-24px)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-40 py-1.5 overflow-hidden animate-glass-in">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 font-bold">
                  Active Signatory & Role Switcher
                </div>
                {rolesList.map((r) => {
                  const isSelected = currentRole === r.role;
                  return (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => {
                        setRole(r.role);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer ${isSelected
                          ? "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-semibold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                    >
                      <div>
                        <div className="font-bold">{r.label}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {r.dept}
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default FloatingTopHeader;
