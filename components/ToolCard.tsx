"use client";

import React from "react";
import Link from "next/link";
import { ToolItem } from "@/lib/tools-data";
import {
  FileImage,
  Sparkles,
  Calculator,
  HardDrive,
  Layers,
  FileDown,
  Minimize2,
  Scissors,
  QrCode,
  FileText,
  Scale,
  Percent,
  Activity,
  Calendar,
  KeyRound,
  Palette,
  Code2,
  Binary,
  ArrowRight,
  Cpu,
} from "lucide-react";

// Icon mapping dictionary
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  FileImage,
  Sparkles,
  Calculator,
  HardDrive,
  Layers,
  FileDown,
  Minimize2,
  Scissors,
  QrCode,
  FileText,
  Scale,
  Percent,
  Activity,
  Calendar,
  KeyRound,
  Palette,
  Code2,
  Binary,
};

interface ToolCardProps {
  tool: ToolItem;
}

export default function ToolCard({ tool }: ToolCardProps) {
  const IconComponent = ICON_MAP[tool.icon] || Cpu;

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group register-mark-card relative block h-full p-5 rounded-lg border border-graphite/30 bg-card-bg bg-graph-grid hover:bg-graph-grid-dense transition-all duration-200 hover:-translate-y-1 hover:border-signal hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-signal"
    >
      {/* Top Header Row: Icon + Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded bg-blueprint/10 dark:bg-blueprint/30 border border-blueprint/20 flex items-center justify-center text-blueprint dark:text-wire group-hover:border-signal/50 group-hover:bg-signal/10 transition-colors">
          <div className="blueprint-icon-svg">
            <IconComponent className="w-6 h-6 stroke-[1.8]" />
          </div>
        </div>
        {tool.badge && (
          <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-graphite/40 text-slate-800 dark:text-slate-200 bg-slate-100/80 dark:bg-slate-800 font-bold">
            {tool.badge}
          </span>
        )}
      </div>

      {/* Tool Title & Category */}
      <div className="mb-2">
        <div className="text-[11px] font-mono font-bold uppercase text-slate-700 dark:text-slate-300 mb-1 tracking-wide">
          {tool.category}
        </div>
        <h3 className="font-display font-bold text-base text-slate-900 dark:text-slate-50 group-hover:text-signal transition-colors line-clamp-1">
          {tool.name}
        </h3>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed mb-4 line-clamp-2">
        {tool.shortDescription}
      </p>

      {/* Bottom Technical Spec Footer */}
      <div className="pt-3 border-t border-graphite/30 flex items-center justify-between text-[11px] font-mono font-semibold text-slate-800 dark:text-slate-200">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-wire inline-block" />
          {tool.executionType}
        </span>
        <div className="flex items-center gap-1 font-bold group-hover:text-signal group-hover:translate-x-0.5 transition-all text-blueprint dark:text-wire">
          <span>LAUNCH</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
}
