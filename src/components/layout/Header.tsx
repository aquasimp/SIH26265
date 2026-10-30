"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { UserRole } from "@/types/rbac";
import {
  Sun,
  Moon,
  Search,
  Sparkles,
  UserCheck,
  ChevronDown,
  Menu,
} from "lucide-react";

export function Header() {
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
    setIsMobileNavOpen,
  } = useApp();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const rolesList: { role: UserRole; label: string; dept: string }[] = [
    { role: "INSTITUTION_USER", label: "Institution Signatory", dept: "Aryavarta Institute of Tech" },
    { role: "SCRUTINY_OFFICER", label: "Scrutiny Officer", dept: "Verification Cell, HQ" },
    { role: "REGIONAL_OFFICER", label: "Regional Officer", dept: "Western Regional Office" },
    { role: "BUREAU_HEAD", label: "Bureau Head (Competent Authority)", dept: "Regulation Bureau" },
    { role: "AUDITOR", label: "Statutory Auditor", dept: "CAG Compliance" },
  ];

  return (
    <header className="border-b border-ink-border bg-paper-50 sticky top-0 z-30 shadow-ledger">
      <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-2.5 max-w-full">
        {/* Left: Hamburger (Mobile) + AICTE Bureau Seal & Title */}
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          {/* Mobile Hamburger Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            className="md:hidden p-1.5 -ml-1 text-ink-secondary hover:text-ink-primary hover:bg-paper-200 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors focus:ring-2 focus:ring-saffron"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded bg-saffron text-white flex items-center justify-center font-serif font-bold text-sm sm:text-base shadow-sm shrink-0">
            AI
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-serif font-bold text-xs sm:text-sm tracking-wide text-ink-primary truncate">
                <span className="sm:hidden">AICTE Treasury</span>
                <span className="hidden sm:inline">{t("portalTitle")}</span>
              </h1>
              <span className="hidden lg:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-saffron-subtle text-saffron border border-saffron/20 shrink-0">
                SIH26265
              </span>
            </div>
            <p className="text-[11px] text-ink-muted hidden md:block truncate">
              {t("regulatoryBureau")}
            </p>
          </div>
        </div>

        {/* Right: Controls & Role Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Omni Search Button */}
          <button
            type="button"
            onClick={() => setIsCmdOpen(true)}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 text-xs text-ink-muted bg-paper-100 border border-ink-border rounded-md hover:border-ink-secondary transition-colors min-h-[40px] sm:min-h-0"
            title="Open command palette (Ctrl+K)"
            aria-label="Search and command palette"
          >
            <Search className="w-3.5 h-3.5 text-ink-muted" />
            <span className="hidden xl:inline">{t("searchPlaceholder")}</span>
            <kbd className="hidden lg:inline-block font-mono text-[10px] bg-paper-200 border border-ink-border px-1 rounded">
              ⌘K
            </kbd>
          </button>

          {/* Guided Demo Button */}
          <button
            type="button"
            onClick={() => setIsDemoModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-white bg-saffron hover:bg-saffron-hover rounded-md transition-colors shadow-sm min-h-[40px] sm:min-h-0"
            title="Run simulated demonstration scenario"
            aria-label="Run demo scenario"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Run Demo</span>
          </button>

          {/* Language Toggle (EN / HI) - Hidden on smallest phones since it is in mobile drawer */}
          <div className="hidden sm:flex items-center border border-ink-border rounded-md overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-2 py-1 font-mono transition-colors min-h-[36px] ${
                language === "en"
                  ? "bg-ink-primary text-paper-50 font-semibold"
                  : "bg-paper-50 text-ink-muted hover:bg-paper-200"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage("hi")}
              className={`px-2 py-1 font-mono transition-colors min-h-[36px] ${
                language === "hi"
                  ? "bg-ink-primary text-paper-50 font-semibold"
                  : "bg-paper-50 text-ink-muted hover:bg-paper-200"
              }`}
            >
              हि
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 sm:p-1.5 text-ink-muted hover:text-ink-primary border border-ink-border rounded-md hover:bg-paper-200 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Toggle color theme"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Role Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsRoleDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-2.5 pr-2 py-1 text-xs border border-ink-border rounded-md hover:bg-paper-200 transition-colors bg-paper-100 min-h-[40px] sm:min-h-0"
              aria-label={`Current Role: ${currentUser.role}. Click to switch role.`}
            >
              <UserCheck className="w-3.5 h-3.5 text-botanical shrink-0" />
              <div className="text-left hidden sm:block max-w-[130px] lg:max-w-none">
                <div className="font-semibold text-ink-primary leading-tight truncate">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-ink-muted truncate">
                  {currentUser.role.replace("_", " ")}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-ink-muted shrink-0" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-64 sm:w-72 bg-paper-50 border border-ink-border rounded-lg shadow-ledger-elevated py-1 z-50 animate-in fade-in-0 zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[11px] font-mono text-ink-muted border-b border-ink-border uppercase tracking-wider">
                  {t("roleSwitcher")} (RBAC Enforced)
                </div>
                {rolesList.map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => {
                      setRole(item.role);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-start gap-2.5 hover:bg-paper-200 transition-colors min-h-[44px] ${
                      currentRole === item.role ? "bg-saffron-subtle/50 font-semibold" : ""
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        currentRole === item.role ? "bg-saffron" : "bg-ink-border"
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-ink-primary truncate">{item.label}</div>
                      <div className="text-[10px] text-ink-muted truncate">{item.dept}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
