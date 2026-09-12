"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Palette, Pipette, Copy, Check, FileDown } from "lucide-react";
import { downloadTextReport } from "@/lib/export-utils";

export default function ColorPickerPage() {
  const [hex, setHex] = useState<string>("#FFB020");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Convert Hex to RGB
  const hexToRgb = (hexStr: string) => {
    let clean = hexStr.replace("#", "");
    if (clean.length === 3) {
      clean = clean.split("").map((c) => c + c).join("");
    }
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  // Convert RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
  };

  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Compute Palettes
  const complementaryHex = hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l);
  const analogous1 = hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l);
  const analogous2 = hslToHex((hsl.h + 330) % 360, hsl.s, hsl.l);
  const triadic1 = hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l);
  const triadic2 = hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l);

  const handleEyedropper = async () => {
    if (typeof window !== "undefined" && "EyeDropper" in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        setHex(result.sRGBHex.toUpperCase());
      } catch (e) {
        console.warn("Eyedropper cancelled or failed", e);
      }
    } else {
      alert("EyeDropper API is supported in Chrome, Edge, and Opera desktop browsers.");
    }
  };

  const copyVal = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedText(val);
    setTimeout(() => setCopiedText(null), 1500);
  };

  const handleSavePalette = () => {
    const cssVars = `:root {\n  --primary: ${hex};\n  --primary-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};\n  --primary-hsl: ${hsl.h}, ${hsl.s}%, ${hsl.l}%;\n  --complementary: ${complementaryHex};\n  --analogous-1: ${analogous1};\n  --analogous-2: ${analogous2};\n  --triadic-1: ${triadic1};\n  --triadic-2: ${triadic2};\n}`;

    downloadTextReport(
      "color-palette-spec",
      "Color Matrix & Harmonic Palettes",
      {
        "Primary HEX": hex,
        "Primary RGB": `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
        "Primary HSL": `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
        "Complementary Color": complementaryHex,
        "Analogous Palette": `${analogous1}, ${analogous2}`,
        "Triadic Palette": `${triadic1}, ${triadic2}`,
      },
      `CSS VARIABLES SPECIFICATION:\n${cssVars}`
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-graphite/40 pb-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-800 dark:text-slate-200 hover:text-signal mb-1 transition-colors font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO UTILITY WORKBENCH</span>
          </Link>
          <h1 className="font-display font-extrabold text-2xl text-slate-900 dark:text-paper">
            Color Matrix &amp; Harmonic Palettes
          </h1>
          <p className="font-mono text-xs text-slate-800 dark:text-slate-300 font-medium">
            Precision color space translator (HEX, RGB, HSL) with automatic harmonic harmony generators.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleEyedropper}
            className="px-3.5 py-2 rounded border border-graphite/40 hover:border-signal text-slate-900 dark:text-slate-100 font-mono text-xs flex items-center gap-1.5 transition-colors font-bold bg-card-bg"
          >
            <Pipette className="w-3.5 h-3.5" />
            <span>EYEDROPPER</span>
          </button>

          <button
            onClick={handleSavePalette}
            className="px-4 py-2 rounded bg-signal hover:bg-signal-hover text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            title="Download color harmony spec sheet with CSS variables"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>SAVE / DOWNLOAD SPEC</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 font-mono text-xs">
        {/* Color Preview & Values */}
        <div className="md:col-span-6 p-6 rounded-lg border border-graphite/30 bg-card-bg space-y-4">
          <div
            className="w-full h-32 rounded-lg border border-graphite/30 shadow-inner flex items-center justify-center transition-colors"
            style={{ backgroundColor: hex }}
          >
            <input
              type="color"
              value={hex}
              onChange={(e) => setHex(e.target.value.toUpperCase())}
              className="opacity-0 w-full h-full cursor-pointer"
              title="Click to pick color"
            />
          </div>

          <div className="space-y-2 pt-2">
            {/* Hex */}
            <div className="flex items-center justify-between p-2 rounded bg-graphite/5 border border-graphite/20">
              <span className="text-graphite">HEX:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-ink dark:text-paper">{hex}</span>
                <button
                  onClick={() => copyVal(hex)}
                  className="p-1 text-graphite hover:text-signal"
                >
                  {copiedText === hex ? <Check className="w-3.5 h-3.5 text-wire" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* RGB */}
            <div className="flex items-center justify-between p-2 rounded bg-graphite/5 border border-graphite/20">
              <span className="text-graphite">RGB:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-ink dark:text-paper">
                  rgb({rgb.r}, {rgb.g}, {rgb.b})
                </span>
                <button
                  onClick={() => copyVal(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}
                  className="p-1 text-graphite hover:text-signal"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* HSL */}
            <div className="flex items-center justify-between p-2 rounded bg-graphite/5 border border-graphite/20">
              <span className="text-graphite">HSL:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-ink dark:text-paper">
                  hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
                </span>
                <button
                  onClick={() => copyVal(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)}
                  className="p-1 text-graphite hover:text-signal"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Harmonies */}
        <div className="md:col-span-6 p-6 rounded-lg border border-graphite/30 bg-card-bg space-y-4">
          <span className="font-bold text-ink dark:text-paper block pb-2 border-b border-graphite/20">
            HARMONIC SCHEMES
          </span>

          {/* Complementary */}
          <div className="space-y-1">
            <span className="text-[10px] text-graphite block">COMPLEMENTARY (180°)</span>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded border border-graphite/30"
                style={{ backgroundColor: complementaryHex }}
              />
              <span className="font-bold">{complementaryHex}</span>
              <button
                onClick={() => setHex(complementaryHex)}
                className="ml-auto text-[10px] text-signal hover:underline"
              >
                Set Active
              </button>
            </div>
          </div>

          {/* Analogous */}
          <div className="space-y-1 pt-2 border-t border-graphite/10">
            <span className="text-[10px] text-graphite block">ANALOGOUS (±30°)</span>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded border border-graphite/30"
                  style={{ backgroundColor: analogous1 }}
                />
                <span>{analogous1}</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded border border-graphite/30"
                  style={{ backgroundColor: analogous2 }}
                />
                <span>{analogous2}</span>
              </div>
            </div>
          </div>

          {/* Triadic */}
          <div className="space-y-1 pt-2 border-t border-graphite/10">
            <span className="text-[10px] text-graphite block">TRIADIC (±120°)</span>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded border border-graphite/30"
                  style={{ backgroundColor: triadic1 }}
                />
                <span>{triadic1}</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded border border-graphite/30"
                  style={{ backgroundColor: triadic2 }}
                />
                <span>{triadic2}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
