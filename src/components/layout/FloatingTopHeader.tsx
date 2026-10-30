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
  Bell,
  Check,
  ChevronDown,
  Sun,
  Moon,
  AlertTriangle,
  Clock,
  ShieldCheck,
  X,
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
    { role: "REGIONAL_OFFICER", label: "R. K. Verma", dept: "Regional Officer" },
    { role: "SCRUTINY_OFFICER", label: "Pooja Deshmukh", dept: "Scrutiny Officer" },
    { role: "INSTITUTION_USER", label: "Dr. K. S. Ramanujan", dept: "Institution Principal" },
    { role: "BUREAU_HEAD", label: "Prof. Ananya Sengupta", dept: "Bureau Head (Regulation)" },
    { role: "AUDITOR", label: "Vikramaditya Nair", dept: "Statutory Auditor" },
  ];

  const currentRoleObj = rolesList.find((r) => r.role === currentRole) || rolesList[0];

  const sampleNotifications = [
    {
      id: "notif-1",
      title: "2 discrepancy notices need review",
      time: "10 mins ago",
      type: "discrepancy",
      link: "/deficiency-notices",
    },
    {
      id: "notif-2",
      title: "7 matured FDRs need follow-up",
      time: "1 hour ago",
      type: "maturity",
      link: "/maturities",
    },
    {
      id: "notif-3",
      title: "Renewal documents awaiting review",
      time: "3 hours ago",
      type: "renewal",
      link: "/maturities",
    },
  ];

  return (
    <header className="sticky top-0 z-20 w-full bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 shadow-2xs select-none transition-colors">
      {/* Left: Mobile Toggle + Emblem + Portal Title */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 shrink-0 cursor-pointer transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-7 flex items-center justify-center shrink-0">
            <AshokaEmblem size={26} />
          </div>
          <div className="min-w-0 flex items-center gap-2">
            <span className="font-bold text-[15px] sm:text-[16px] text-slate-900 font-sans tracking-tight">
              AICTE FDR Management Portal
            </span>
            <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 uppercase">
              FDRVault
            </span>
          </div>
        </Link>
      </div>

      {/* Center: Search Omnibar */}
      <div className="flex-1 max-w-md mx-2 hidden sm:block">
        <button
          type="button"
          onClick={() => setIsCmdOpen(true)}
          className="w-full bg-[#F5F8FC] dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-full px-4 py-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center justify-between transition-all cursor-pointer"
          title="Search institution, FDR number or bank... (Ctrl K)"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="truncate text-[12.5px] text-slate-500">
              Search institution, FDR number or bank...
            </span>
          </div>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-white rounded border border-slate-200 shadow-2xs shrink-0">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right: Notifications, Language Toggle, User Profile */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9.5px] font-bold text-white">
              3
            </span>
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setNotificationsOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-24px)] bg-white border border-slate-200 rounded-2xl shadow-xl z-40 py-2">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Notifications</span>
                  <span className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-full">
                    3 Pending Actions
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {sampleNotifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.link}
                      onClick={() => setNotificationsOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0 mt-0.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800 leading-snug">
                          {n.title}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {n.time}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bilingual Switch (EN | हिन्दी) */}
        <div className="flex items-center text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-lg px-2 py-1">
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`px-1 cursor-pointer transition-colors ${
              language === "en" ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            EN
          </button>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <button
            type="button"
            onClick={() => setLanguage("hi")}
            className={`px-1 cursor-pointer transition-colors ${
              language === "hi" ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            हिन्दी
          </button>
        </div>

        {/* Dark Mode Toggle Button */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer"
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? (
            <Sun className="h-[18px] w-[18px] text-amber-400 animate-in spin-in-180 duration-300" />
          ) : (
            <Moon className="h-[18px] w-[18px] text-slate-600 hover:text-blue-600 transition-colors" />
          )}
        </button>

        {/* User Profile & Role Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-left"
          >
            {/* Avatar Pill */}
            <div className="h-8 w-8 rounded-full bg-[#2773E1] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              RV
            </div>

            {/* User Name & Role */}
            <div className="hidden sm:block min-w-0 pr-1">
              <div className="text-[13px] font-bold text-slate-900 leading-tight truncate">
                {currentRoleObj.label}
              </div>
              <div className="text-[11px] font-medium text-slate-500 leading-none mt-0.5 truncate">
                {currentRoleObj.dept}
              </div>
            </div>

            <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          </button>

          {/* Role Switcher Menu */}
          {isRoleDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsRoleDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 py-2">
                <div className="px-3.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100">
                  Switch Active Role (Demo)
                </div>

                {rolesList.map((r) => (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => {
                      setRole(r.role);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs transition-colors flex items-center justify-between cursor-pointer hover:bg-slate-50 ${
                      currentRole === r.role
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-slate-700"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-[12.5px]">{r.label}</div>
                      <div className="text-[10.5px] text-slate-500">{r.dept}</div>
                    </div>
                    {currentRole === r.role && (
                      <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default FloatingTopHeader;
