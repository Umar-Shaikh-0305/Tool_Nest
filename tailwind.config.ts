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
        ink: "#0B0F15",
        paper: "#F8F7F4",
        blueprint: {
          DEFAULT: "#173354",
          50: "#EDF3FA",
          100: "#D6E4F5",
          200: "#ADC7EB",
          300: "#7AA4DE",
          400: "#497FD0",
          500: "#173354",
          600: "#122842",
          700: "#0D1E32",
          800: "#091421",
          900: "#050B13",
        },
        signal: {
          DEFAULT: "#D97706",
          hover: "#B45309",
          light: "#FEF3C7",
          dark: "#92400E",
        },
        graphite: {
          DEFAULT: "#1E2530",
          light: "#334155",
          dark: "#0F172A",
          border: "#94A3B8",
          darkborder: "#334155",
        },
        wire: {
          DEFAULT: "#0D9488",
          dark: "#115E59",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "graph-paper-light": "radial-gradient(#4A5160 0.75px, transparent 0.75px), radial-gradient(#4A5160 0.75px, #F6F5F1 0.75px)",
        "graph-paper-dark": "radial-gradient(#4A5160 0.75px, transparent 0.75px), radial-gradient(#4A5160 0.75px, #14181F 0.75px)",
      },
      backgroundSize: {
        "graph-8": "8px 8px",
        "graph-16": "16px 16px",
      },
    },
  },
  plugins: [],
};
export default config;
