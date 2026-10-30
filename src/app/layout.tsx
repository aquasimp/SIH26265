import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { AppShellClient } from "@/components/layout/AppShellClient";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F6FA" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0F17" },
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
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen text-ink-primary font-sans antialiased selection:bg-amber-500/20 selection:text-amber-800 dark:selection:text-amber-300">
        <AppProvider>
          <AppShellClient>{children}</AppShellClient>
        </AppProvider>
      </body>
    </html>
  );
}
