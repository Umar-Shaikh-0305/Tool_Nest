"use client";
import React from "react";
import { ToolItem } from "@/lib/tools-data";
import {
  FileImage, Sparkles, Calculator, HardDrive, Layers,
  FileDown, Minimize2, Scissors, QrCode, FileText,
  Scale, Percent, Activity, Calendar, KeyRound, Palette,
  Code2, Binary, ArrowRight, Cpu, Hash, Type, Shuffle,
  Receipt, Timer, PiggyBank, Wand2, AlignLeft,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  FileImage, Sparkles, Calculator, HardDrive, Layers,
  FileDown, Minimize2, Scissors, QrCode, FileText,
  Scale, Percent, Activity, Calendar, KeyRound, Palette,
  Code2, Binary, Hash, Type, Shuffle, Receipt, Timer,
  PiggyBank, Wand2, AlignLeft,
};

const CATEGORY_STYLES: Record<string, { badge: string; icon: string; bg: string; border: string }> = {
  "Image Tools":   { badge: "badge-image",   icon: "text-sky-500",    bg: "bg-sky-50",    border: "border-sky-200" },
  "PDF Tools":     { badge: "badge-pdf",     icon: "text-red-500",    bg: "bg-red-50",    border: "border-red-200" },
  "Calculators":   { badge: "badge-calc",    icon: "text-emerald-600",bg: "bg-emerald-50",border: "border-emerald-200" },
  "Converters":    { badge: "badge-convert", icon: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200" },
  "Generators":    { badge: "badge-gen",     icon: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
  "Text Tools":    { badge: "badge-text",    icon: "text-pink-500",   bg: "bg-pink-50",   border: "border-pink-200" },
  "Writing Tools": { badge: "badge-writing", icon: "text-cyan-600",   bg: "bg-cyan-50",   border: "border-cyan-200" },
  "Fun Tools":     { badge: "badge-fun",     icon: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200" },
};

interface ToolCardProps {
  tool: ToolItem;
}

import Link from "next/link";

export default function ToolCard({ tool }: ToolCardProps) {
  const IconComponent = ICON_MAP[tool.icon] || Cpu;
  const style = CATEGORY_STYLES[tool.category] ?? {
    badge: "badge-gen", icon: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200"
  };

  const toolUrl = `/tools/${tool.slug}`;

  return (
    <Link
      href={toolUrl}
      className="tool-card group flex flex-col h-full p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-violet-300 hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer block text-left"
    >
      {/* Top row: Icon & Badge */}
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl ${style.bg} ${style.border} border flex items-center justify-center flex-shrink-0`}>
          <IconComponent className={`w-5 h-5 ${style.icon}`} />
        </div>
        <span className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full ${style.badge}`}>
          {tool.category}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-bold text-base text-slate-900 group-hover:text-violet-600 transition-colors leading-snug mb-1.5">
        {tool.name}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 flex-1 mb-4">
        {tool.shortDescription}
      </p>

      {/* Explicit "Use Tool" Button Link - Instant 1-Click Launch */}
      <div className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 group-hover:bg-violet-700 active:bg-violet-800 text-white font-semibold text-sm transition-all shadow-sm">
        <span>Use Tool</span>
        <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  );
}
