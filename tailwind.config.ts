import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#7C3AED",
          hover: "#6D28D9",
          light: "#EDE9FE",
          dark: "#5B21B6",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          alt: "#F8FAFC",
          hover: "#F1F5F9",
        },
        muted: {
          DEFAULT: "#64748B",
          light: "#94A3B8",
        },
        border: {
          DEFAULT: "#E2E8F0",
          strong: "#CBD5E1",
        },
        text: {
          DEFAULT: "#0F172A",
          secondary: "#475569",
          muted: "#94A3B8",
        },
        // Backwards compatibility color tokens mapped to clean light theme
        ink: "#0F172A",
        paper: "#FFFFFF",
        "card-bg": "#FFFFFF",
        blueprint: {
          DEFAULT: "#7C3AED",
          50: "#EDE9FE",
          100: "#DDD6FE",
          200: "#C4B5FD",
          300: "#A78BFA",
          400: "#8B5CF6",
          500: "#7C3AED",
          600: "#6D28D9",
          700: "#5B21B6",
          800: "#4C1D95",
          900: "#2E1065",
        },
        signal: {
          DEFAULT: "#7C3AED",
          hover: "#6D28D9",
          light: "#EDE9FE",
          dark: "#5B21B6",
        },
        graphite: {
          DEFAULT: "#475569",
          light: "#64748B",
          dark: "#1E293B",
          border: "#E2E8F0",
          darkborder: "#CBD5E1",
        },
        wire: {
          DEFAULT: "#10B981",
          dark: "#059669",
        },
        // Category colors
        cat: {
          image: "#0EA5E9",
          pdf: "#EF4444",
          calc: "#10B981",
          convert: "#F59E0B",
          gen: "#8B5CF6",
          text: "#EC4899",
          fun: "#F97316",
          writing: "#06B6D4",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
