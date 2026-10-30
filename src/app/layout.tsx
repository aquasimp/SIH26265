import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { SyntheticBanner } from "@/components/layout/SyntheticBanner";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { DemoScenarioPlayer } from "@/components/demo/DemoScenarioPlayer";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f7f4" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1917" },
  ],
};

export const metadata: Metadata = {
  title: "AICTE Security Deposit & FDR Regulatory Treasury (SIH26265)",
  description:
    "Smart India Hackathon 2026 — Streamline of Security Deposit / FDR Portal for AICTE Regulation Bureau",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-[100dvh] bg-paper-100 text-ink-primary font-sans antialiased selection:bg-saffron selection:text-white pb-16 md:pb-0">
        <AppProvider>
          <div className="flex flex-col min-h-[100dvh]">
            <SyntheticBanner />
            <Header />
            <div className="flex-1 flex min-w-0">
              <Sidebar />
              <main className="flex-1 min-w-0 overflow-y-auto pb-12">
                {children}
              </main>
            </div>
            <MobileNav />
            <CommandPalette />
            <DemoScenarioPlayer />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
