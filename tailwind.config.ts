import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: "var(--paper-50)",
          100: "var(--paper-100)",
          200: "var(--paper-200)",
          300: "var(--paper-300)",
          400: "var(--paper-400)",
        },
        ink: {
          primary: "var(--ink-primary)",
          secondary: "var(--ink-secondary)",
          muted: "var(--ink-muted)",
          border: "var(--ink-border)",
          subtle: "var(--ink-subtle)",
        },
        saffron: {
          DEFAULT: "var(--saffron-primary)",
          hover: "var(--saffron-hover)",
          subtle: "var(--saffron-subtle)",
        },
        botanical: {
          DEFAULT: "var(--botanical-primary)",
          hover: "var(--botanical-hover)",
          subtle: "var(--botanical-subtle)",
        },
        status: {
          verified: "var(--status-verified)",
          "verified-bg": "var(--status-verified-bg)",
          pending: "var(--status-pending)",
          "pending-bg": "var(--status-pending-bg)",
          warning: "var(--status-warning)",
          "warning-bg": "var(--status-warning-bg)",
          danger: "var(--status-danger)",
          "danger-bg": "var(--status-danger-bg)",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "Courier New", "monospace"],
      },
      boxShadow: {
        ledger: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)",
        "ledger-elevated": "0 4px 12px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;

