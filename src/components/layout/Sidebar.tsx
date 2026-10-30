"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  LayoutDashboard,
  Layers,
  ScanLine,
  Building,
  KeyRound,
  ShieldCheck,
  TrendingUp,
  Sliders,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useApp();

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

  return (
    <aside className="hidden md:flex w-56 shrink-0 border-r border-ink-border bg-paper-50 min-h-[calc(100vh-68px)] p-3 flex-col justify-between">
      <div className="space-y-1">
        <div className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-ink-muted">
          Navigation
        </div>
        <nav className="space-y-0.5">
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
                className={`flex items-center gap-2.5 px-3 py-2 text-xs rounded transition-colors ${
                  isActive
                    ? "bg-saffron text-white font-medium shadow-sm"
                    : "text-ink-secondary hover:text-ink-primary hover:bg-paper-200"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-ink-muted"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Regulatory Badge Footer */}
      <div className="p-3 bg-paper-100 border border-ink-border rounded text-[11px] space-y-1 text-ink-muted">
        <div className="font-semibold text-ink-primary font-serif">Regulation Bureau</div>
        <div>APH 2026 Compliant</div>
        <div className="font-mono text-[10px] text-botanical font-medium">● LEDGER SYNCHRONIZED</div>
      </div>
    </aside>
  );
}

