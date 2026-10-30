"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { AshokaEmblem } from "@/components/brand/AshokaEmblem";
import {
  LayoutDashboard,
  Building2,
  FileSpreadsheet,
  Plus,
  Calendar,
  LogOut,
  FileCheck,
  AlertTriangle,
  Landmark,
  BarChart3,
  History,
  Settings,
  Users,
  Info,
  X,
  ExternalLink,
} from "lucide-react";

export interface LeftGlassRailProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function LeftGlassRail({ mobileOpen = false, onCloseMobile }: LeftGlassRailProps) {
  const pathname = usePathname();
  const { language } = useApp();
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Grouped Navigation Architecture according to SIH PS 26265 Specification
  const navGroups = [
    {
      group: "OVERVIEW",
      items: [
        {
          label: "Dashboard",
          href: "/",
          icon: LayoutDashboard,
          badge: null,
          badgeClass: "",
        },
      ],
    },
    {
      group: "FDR MANAGEMENT",
      items: [
        {
          label: "Institutions",
          href: "/institution",
          icon: Building2,
          badge: null,
          badgeClass: "",
        },
        {
          label: "FDR Register",
          href: "/repository",
          icon: FileSpreadsheet,
          badge: null,
          badgeClass: "",
        },
        {
          label: "Submit New FDR",
          href: "/intake",
          icon: Plus,
          badge: null,
          badgeClass: "",
        },
        {
          label: "Maturities & Renewals",
          href: "/maturities",
          icon: Calendar,
          badge: null,
          badgeClass: "",
        },
        {
          label: "Release / Refund Requests",
          href: "/release-workflow",
          icon: LogOut,
          badge: null,
          badgeClass: "",
        },
      ],
    },
    {
      group: "REVIEW & COMPLIANCE",
      items: [
        {
          label: "Document Verification",
          href: "/verification",
          icon: FileCheck,
          badge: null,
          badgeClass: "",
        },
        {
          label: "Discrepancies & Notices",
          href: "/deficiency-notices",
          icon: AlertTriangle,
          badge: "2",
          badgeClass: "bg-red-50 text-red-600 font-bold px-1.5 py-0.5 rounded-full text-[10.5px]",
        },
        {
          label: "Bank Verification",
          href: "/bank-verification",
          icon: Landmark,
          badge: "Demo",
          badgeClass: "bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-md text-[10.5px]",
        },
      ],
    },
    {
      group: "REPORTING",
      items: [
        {
          label: "Reports",
          href: "/metrics",
          icon: BarChart3,
          badge: null,
          badgeClass: "",
        },
        {
          label: "Audit History",
          href: "/audit-trail",
          icon: History,
          badge: null,
          badgeClass: "",
        },
      ],
    },
    {
      group: "ADMINISTRATION",
      items: [
        {
          label: "Rules & Settings",
          href: "/settings",
          icon: Settings,
          badge: null,
          badgeClass: "",
        },
        {
          label: "User & Role Management",
          href: "/users",
          icon: Users,
          badge: null,
          badgeClass: "",
        },
      ],
    },
  ];

  const content = (
    <div className="flex flex-col justify-between h-full w-full select-none bg-white">
      {/* Brand & Seal Header */}
      <div>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-8 flex items-center justify-center shrink-0">
              <AshokaEmblem size={28} />
            </div>
            <div className="min-w-0">
              <div className="font-bold tracking-tight text-[13px] text-slate-900 uppercase font-sans leading-tight">
                AICTE | FDR MANAGEMENT
              </div>
              <div className="text-[11px] font-medium text-slate-500 truncate">
                Regulation Bureau
              </div>
            </div>
          </Link>

          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Scrollable Grouped Navigation */}
        <nav
          className="px-3 py-3 overflow-y-auto space-y-4 max-h-[calc(100vh-140px)]"
          aria-label="Sidebar Navigation"
        >
          {navGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              <div className="px-3 pt-2 pb-1 text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                {group.group}
              </div>
              {group.items.map((item) => {
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
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-[13px] transition-all group ${
                      isActive
                        ? "bg-blue-50 text-blue-600 font-semibold shadow-2xs"
                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-normal"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                          isActive
                            ? "text-blue-600"
                            : "text-slate-400 group-hover:text-slate-600"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`shrink-0 ml-1.5 ${item.badgeClass}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <button
          type="button"
          onClick={() => setShowStatusModal(true)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-100/80 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="min-w-0">
              <div className="text-[11.5px] font-bold text-slate-800 leading-none">
                System Status
              </div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">
                Prototype mode · Sample data
              </div>
            </div>
          </div>
          <Info className="h-3.5 w-3.5 text-slate-400 shrink-0 hover:text-slate-600" />
        </button>
      </div>

      {/* Prototype Info Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 max-w-md w-full shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                <h4 className="font-bold text-sm text-slate-900">
                  FDRVault · Prototype Transparency
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              This system operates in <strong>Demonstration Prototype Mode</strong> for Smart India Hackathon 2026 (PS 26265). All data consists of a deterministic synthetic dataset spanning 60 technical institutions and 140 FDR instruments.
            </p>
            <div className="text-[11px] text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <div>• <strong>OCR Processing:</strong> Simulated pipeline with realistic field coordinate bounding boxes.</div>
              <div>• <strong>Bank Verification:</strong> Simulated Core Banking (CBS) gateway adapter with deterministic test branches.</div>
              <div>• <strong>Audit Ledger:</strong> Operational SHA-256 linear cryptographic chain.</div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside
        className="hidden lg:block fixed left-0 top-0 bottom-0 w-[260px] bg-white border-r border-slate-200 z-30 overflow-hidden shadow-xs"
        aria-label="Desktop Sidebar Navigation"
      >
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative flex-1 flex flex-col max-w-[280px] w-full bg-white shadow-2xl z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
}

export default LeftGlassRail;
