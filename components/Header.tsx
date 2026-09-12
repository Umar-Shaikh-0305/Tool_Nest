"use client";

import React from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { Wrench, Shield, User, Terminal } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-graphite/30 bg-paper/95 dark:bg-ink/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Technical Metadata */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-signal rounded px-1"
          >
            <div className="w-8 h-8 rounded bg-blueprint flex items-center justify-center border border-signal/60 shadow-sm transition-transform group-hover:scale-105">
              <Wrench className="w-4 h-4 text-signal" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-lg tracking-tight text-ink dark:text-paper group-hover:text-signal transition-colors">
                  TOOLNEST
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blueprint/15 text-blueprint dark:bg-blueprint/40 dark:text-wire font-semibold">
                  v1.0
                </span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold">
                Technical Workbench · Free Tier Hub
              </span>
            </div>
          </Link>
        </div>

        {/* Live System Diagnostics / Spec Bar */}
        <div className="hidden md:flex items-center gap-3 text-xs font-mono border-x border-graphite/30 px-4 py-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-wire animate-pulse inline-block" />
            <span className="text-slate-800 dark:text-slate-200 font-bold">INFRA: ZERO-COST</span>
          </div>
          <span className="text-graphite/50">|</span>
          <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold">
            <Terminal className="w-3.5 h-3.5 text-signal" />
            <span>EXEC: CLIENT-SIDE</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Link
            href="/account"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded border border-graphite/50 hover:border-signal text-slate-900 dark:text-slate-100 hover:text-signal transition-colors focus:outline-none focus:ring-2 focus:ring-signal bg-card-bg shadow-sm"
            title="Account & Usage History"
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ACCOUNT</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
