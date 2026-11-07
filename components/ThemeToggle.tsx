"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"paper" | "ink">("paper");

  useEffect(() => {
    // Check initial preference from localStorage or system media query
    const savedTheme = localStorage.getItem("toolnest-theme") as "paper" | "ink" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "ink");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = prefersDark ? "ink" : "paper";
      setTheme(initial);
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "paper" ? "ink" : "paper";
    setTheme(nextTheme);
    localStorage.setItem("toolnest-theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "ink");
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle technical theme"
      className="flex items-center gap-2 px-2.5 py-1 text-xs font-mono font-medium rounded border border-graphite/40 bg-graphite/10 hover:border-signal hover:text-signal transition-colors focus:outline-none focus:ring-2 focus:ring-signal"
      title={`Current: ${theme === "paper" ? "PAPER (Light)" : "INK (Dark)"}`}
    >
      {theme === "paper" ? (
        <>
          <Sun className="w-3.5 h-3.5 text-signal" />
          <span className="hidden sm:inline">PAPER</span>
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-wire" />
          <span className="hidden sm:inline">INK</span>
        </>
      )}
    </button>
  );
}
