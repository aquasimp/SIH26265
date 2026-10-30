import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { SyntheticBanner } from "@/components/layout/SyntheticBanner";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { DemoScenarioPlayer } from "@/components/demo/DemoScenarioPlayer";

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
      <body className="min-h-screen bg-paper-100 text-ink-primary font-sans antialiased selection:bg-saffron selection:text-white">
        <AppProvider>
          <div className="flex flex-col min-h-screen">
            <SyntheticBanner />
            <Header />
            <div className="flex-1 flex">
              <Sidebar />
              <main className="flex-1 overflow-y-auto pb-12">
                {children}
              </main>
            </div>
            <CommandPalette />
            <DemoScenarioPlayer />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}

