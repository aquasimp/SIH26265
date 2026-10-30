"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole, UserSession, DEMO_USERS } from "@/types/rbac";

export type Language = "en" | "hi";

interface AppContextType {
  currentRole: UserRole;
  currentUser: UserSession;
  setRole: (role: UserRole) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isCmdOpen: boolean;
  setIsCmdOpen: (open: boolean) => void;
  isDemoModalOpen: boolean;
  setIsDemoModalOpen: (open: boolean) => void;
}

const DICTIONARY: Record<string, Record<Language, string>> = {
  // Navigation & Core Labels
  portalTitle: {
    en: "AICTE Security Deposit & FDR Regulatory Treasury",
    hi: "एआईसीटीई सुरक्षा जमा एवं एफडीआर विनियामक राजकोष",
  },
  regulatoryBureau: {
    en: "Regulation Bureau — Statutory Deposit Governance System",
    hi: "विनियमन ब्यूरो — सांविधिक जमा अभिशासन प्रणाली",
  },
  dashboard: { en: "Treasury Console", hi: "राजकोष कंसोल" },
  repository: { en: "Central Repository", hi: "केंद्रीय भंडार" },
  intake: { en: "OCR Intake & Scan", hi: "ओसीआर अंतर्ग्रहण एवं स्कैन" },
  institutionPortal: { en: "Institution Desk", hi: "संस्थान डेस्क" },
  releaseWorkflow: { en: "Release & Refund", hi: "मुक्ति एवं वापसी" },
  auditTrail: { en: "Cryptographic Audit", hi: "क्रिप्टोग्राफ़िक ऑडिट" },
  metrics: { en: "Simulated Impact", hi: "अनुकूलित प्रभाव" },
  settings: { en: "Policy Config", hi: "नीति विन्यास" },

  // Role Switcher
  roleSwitcher: { en: "Switch Role", hi: "भूमिका बदलें" },
  activeRole: { en: "Active Signatory", hi: "सक्रिय हस्ताक्षरकर्ता" },

  // Actions & Indicators
  syntheticBanner: {
    en: "SYNTHETIC REGULATORY DATASET — Deterministic Seed for SIH26265 Evaluation",
    hi: "कृत्रिम विनियामक डेटासेट — एसआईएच26265 मूल्यांकन हेतु नियतात्मक बीज",
  },
  searchPlaceholder: {
    en: "Search by FDR No, Bank, IFSC, College name (Ctrl+K)...",
    hi: "एफडीआर संख्या, बैंक, आईएफएससी, कॉलेज नाम खोजें (Ctrl+K)...",
  },
  verifyBank: { en: "Query Core Banking (MOCK)", hi: "कोर बैंकिंग पूछताछ (मॉक)" },
  resolveFlag: { en: "Resolve Discrepancy", hi: "विसंगति का समाधान करें" },
  exportCsv: { en: "Export CSV", hi: "सीएसवी निर्यात" },
  exportPdf: { en: "Print Ledger", hi: "खाता प्रिंट करें" },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>("SCRUTINY_OFFICER");
  const [language, setLanguage] = useState<Language>("en");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isCmdOpen, setIsCmdOpen] = useState<boolean>(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);

  // Sync dark mode class on document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const setRole = (role: UserRole) => {
    setCurrentRole(role);
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const t = (key: string): string => {
    if (DICTIONARY[key] && DICTIONARY[key][language]) {
      return DICTIONARY[key][language];
    }
    return key;
  };

  const currentUser = DEMO_USERS[currentRole];

  return (
    <AppContext.Provider
      value={{
        currentRole,
        currentUser,
        setRole,
        language,
        setLanguage,
        t,
        isDarkMode,
        toggleDarkMode,
        isCmdOpen,
        setIsCmdOpen,
        isDemoModalOpen,
        setIsDemoModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
