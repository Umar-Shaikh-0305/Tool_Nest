"use client";

import React, { useState, useMemo } from "react";
import ToolCard from "@/components/ToolCard";
import { TOOLS_REGISTRY, TOOLS_CATEGORIES } from "@/lib/tools-data";
import {
  Search,
  SlidersHorizontal,
  Cpu,
  ShieldCheck,
  Zap,
  HardDrive,
  FileCheck,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Filter tools based on search and category
  const filteredTools = useMemo(() => {
    return TOOLS_REGISTRY.filter((tool) => {
      const matchesCategory =
        selectedCategory === "All" || tool.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.shortDescription.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Blueprint Hero Section */}
      <section className="space-y-4 text-center sm:text-left border-b border-graphite/40 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blueprint/15 dark:bg-blueprint/40 border border-blueprint/40 text-slate-900 dark:text-wire font-mono text-xs font-extrabold">
          <Cpu className="w-4 h-4 text-signal" />
          <span>ZERO-COST ENGINEER&apos;S WORKBENCH · 100% PRIVATE CLIENT COMPUTATION</span>
        </div>

        <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-paper tracking-tight">
          ToolNest · Precision Multi-Tool Utility Hub
        </h1>

        <p className="font-sans text-base sm:text-lg text-slate-900 dark:text-slate-100 max-w-4xl leading-relaxed font-semibold">
          A high-performance technical toolbox engineered for developers, designers, and creators.
          Every tool runs at zero cost with instant in-browser execution, full privacy guarantees,
          and timestamped spec sheet exports that let you save records with the exact execution date.
        </p>
      </section>

      {/* Website Overview & Technical Capabilities (Informational Text Section) */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-lg border border-graphite/40 bg-card-bg shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-wire font-display font-extrabold text-sm">
              <ShieldCheck className="w-5 h-5 text-wire" />
              <span>100% Client-Side Privacy</span>
            </div>
            <p className="font-sans text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              Your documents, images, formulas, and keys never leave your browser. All conversions, canvas modifications, and PDF compilations execute locally in device memory.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-graphite/40 bg-card-bg shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-wire font-display font-extrabold text-sm">
              <Zap className="w-5 h-5 text-signal" />
              <span>Zero-Cost Infrastructure</span>
            </div>
            <p className="font-sans text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              No subscription fees, no credit cards, and no usage walls. Every utility is free to use anonymously, powered by open client libraries and keyless endpoints.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-graphite/40 bg-card-bg shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-wire font-display font-extrabold text-sm">
              <FileCheck className="w-5 h-5 text-signal" />
              <span>Timestamped Record Exports</span>
            </div>
            <p className="font-sans text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              Every tool features a built-in Save &amp; Download option that records the exact date, time, and verification parameters directly into your local ledger and downloadable spec sheet.
            </p>
          </div>
        </div>

        {/* Feature Capabilities Guide */}
        <div className="p-5 rounded-lg border border-graphite/40 bg-paper dark:bg-ink shadow-sm space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-paper text-sm">
            <Sparkles className="w-4 h-4 text-signal" />
            <span>WHAT YOU CAN DO ON TOOLNEST</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-slate-800 dark:text-slate-200 font-medium">
            <div className="p-2.5 rounded border border-graphite/30 bg-card-bg">
              <strong className="text-slate-950 dark:text-slate-100 block mb-0.5">IMAGE WORKBENCH</strong>
              <span>Compress images, cut out backgrounds, generate AI schematics, and convert multiple photos to PDF.</span>
            </div>
            <div className="p-2.5 rounded border border-graphite/30 bg-card-bg">
              <strong className="text-slate-950 dark:text-slate-100 block mb-0.5">PDF UTILITIES</strong>
              <span>Merge multi-page PDFs, split and extract page ranges, or reduce PDF byte sizes securely in-memory.</span>
            </div>
            <div className="p-2.5 rounded border border-graphite/30 bg-card-bg">
              <strong className="text-slate-950 dark:text-slate-100 block mb-0.5">MATH &amp; CONVERTERS</strong>
              <span>Evaluate complex scientific expressions, convert IEC/SI digital storage units, and compute physical metrics.</span>
            </div>
            <div className="p-2.5 rounded border border-graphite/30 bg-card-bg">
              <strong className="text-slate-950 dark:text-slate-100 block mb-0.5">SECURITY &amp; TEXT</strong>
              <span>Format &amp; validate JSON, generate cryptographic passwords, analyze word density, and build QR codes.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tool Filter & Search Bar */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 dark:text-slate-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools by name, tag, or function (e.g. 'pdf', 'crop', 'bits')..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-graphite/40 bg-card-bg text-ink dark:text-paper placeholder:text-slate-500 text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-signal focus:border-signal transition-colors shadow-sm"
            />
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 self-end md:self-auto">
            <span>AVAILABLE: {TOOLS_REGISTRY.length} MODULES</span>
            <span>·</span>
            <span className="text-signal">MATCHING: {filteredTools.length}</span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {TOOLS_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded text-xs font-mono whitespace-nowrap transition-all focus:outline-none focus:ring-2 focus:ring-signal ${
                  active
                    ? "bg-blueprint text-paper border border-signal font-bold shadow-sm"
                    : "border border-graphite/40 bg-card-bg text-slate-800 dark:text-slate-200 hover:border-signal hover:text-signal font-medium"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Pegboard Grid of Square Tool Cards */}
      <section className="space-y-4">
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-graphite/40 rounded-xl bg-card-bg/60">
            <SlidersHorizontal className="w-8 h-8 text-graphite mx-auto mb-2 opacity-60" />
            <p className="font-display font-semibold text-base text-ink dark:text-paper">
              No matching utility found
            </p>
            <p className="font-mono text-xs text-slate-700 dark:text-slate-300 mt-1">
              Try modifying your search keywords or clear active category filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-4 px-4 py-2 text-xs font-mono rounded bg-signal text-ink font-bold hover:bg-signal-hover transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
