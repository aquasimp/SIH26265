"use client";

import React, { useState } from "react";
import { useApp, Language } from "@/context/AppContext";
import { UserRole, DEMO_USERS } from "@/types/rbac";
import {
  Sun,
  Moon,
  Search,
  Sparkles,
  UserCheck,
  ChevronDown,
  Building2,
  FileCheck,
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
      <div className="flex items-center justify-between px-6 py-2.5">
        {/* Left: AICTE Bureau Seal & Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded bg-saffron text-white flex items-center justify-center font-serif font-bold text-base shadow-sm">
            AI
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-sm tracking-wide text-ink-primary">
                {t("portalTitle")}
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-saffron-subtle text-saffron border border-saffron/20">
                SIH26265
              </span>
            </div>
            <p className="text-[11px] text-ink-muted hidden md:block">
              {t("regulatoryBureau")}
            </p>
          </div>
        </div>

        {/* Right: Controls & Role Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Omni Search Button */}
          <button
            onClick={() => setIsCmdOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-ink-muted bg-paper-100 border border-ink-border rounded hover:border-ink-secondary transition-colors"
            title="Open command palette (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-ink-muted" />
            <span className="hidden lg:inline">{t("searchPlaceholder")}</span>
            <kbd className="hidden lg:inline-block font-mono text-[10px] bg-paper-200 border border-ink-border px-1 rounded">
              ⌘K
            </kbd>
          </button>

          {/* Guided Demo Button */}
          <button
            onClick={() => setIsDemoModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-saffron hover:bg-saffron-hover rounded transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Run Demo Scenario</span>
          </button>

          {/* Language Toggle (EN / HI) */}
          <div className="flex items-center border border-ink-border rounded overflow-hidden text-xs">
            <button
              onClick={() => setLanguage("en")}
              className={`px-2 py-1 font-mono transition-colors ${
                language === "en"
                  ? "bg-ink-primary text-paper-50 font-semibold"
                  : "bg-paper-50 text-ink-muted hover:bg-paper-200"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("hi")}
              className={`px-2 py-1 font-mono transition-colors ${
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
            onClick={toggleDarkMode}
            className="p-1.5 text-ink-muted hover:text-ink-primary border border-ink-border rounded hover:bg-paper-200 transition-colors"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 pl-2.5 pr-2 py-1 text-xs border border-ink-border rounded hover:bg-paper-200 transition-colors bg-paper-100"
            >
              <UserCheck className="w-3.5 h-3.5 text-botanical" />
              <div className="text-left hidden sm:block">
                <div className="font-semibold text-ink-primary leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-ink-muted">
                  {currentUser.role.replace("_", " ")}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-ink-muted ml-0.5" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-72 bg-paper-50 border border-ink-border rounded shadow-ledger-elevated py-1 z-50">
                <div className="px-3 py-1.5 text-[11px] font-mono text-ink-muted border-b border-ink-border uppercase tracking-wider">
                  {t("roleSwitcher")} (RBAC Enforced)
                </div>
                {rolesList.map((item) => (
                  <button
                    key={item.role}
                    onClick={() => {
                      setRole(item.role);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-start gap-2.5 hover:bg-paper-200 transition-colors ${
                      currentRole === item.role ? "bg-saffron-subtle/50 font-semibold" : ""
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        currentRole === item.role ? "bg-saffron" : "bg-ink-border"
                      }`}
                    />
                    <div>
                      <div className="text-ink-primary">{item.label}</div>
                      <div className="text-[10px] text-ink-muted">{item.dept}</div>
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

