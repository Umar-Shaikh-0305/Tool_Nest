"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  HardDrive,
  Copy,
  Check,
  RotateCcw,
  Info,
  Binary,
  Layers,
  FileDown,
} from "lucide-react";
import { downloadTextReport } from "@/lib/export-utils";

type Standard = "binary" | "decimal";

interface StorageUnit {
  id: string;
  name: string;
  symbol: string;
  binarySymbol: string;
  binaryExponent: number; // power of 1024
  decimalExponent: number; // power of 1000
}

const STORAGE_UNITS: StorageUnit[] = [
  { id: "b", name: "Bit", symbol: "b", binarySymbol: "b", binaryExponent: -1, decimalExponent: -1 },
  { id: "B", name: "Byte", symbol: "B", binarySymbol: "B", binaryExponent: 0, decimalExponent: 0 },
  { id: "KB", name: "Kilobyte", symbol: "KB", binarySymbol: "KiB", binaryExponent: 1, decimalExponent: 1 },
  { id: "MB", name: "Megabyte", symbol: "MB", binarySymbol: "MiB", binaryExponent: 2, decimalExponent: 2 },
  { id: "GB", name: "Gigabyte", symbol: "GB", binarySymbol: "GiB", binaryExponent: 3, decimalExponent: 3 },
  { id: "TB", name: "Terabyte", symbol: "TB", binarySymbol: "TiB", binaryExponent: 4, decimalExponent: 4 },
  { id: "PB", name: "Petabyte", symbol: "PB", binarySymbol: "PiB", binaryExponent: 5, decimalExponent: 5 },
];

export default function StorageConverterPage() {
  const [standard, setStandard] = useState<Standard>("binary");
  const [activeUnit, setActiveUnit] = useState<string>("GB");
  const [inputValue, setInputValue] = useState<string>("1");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Convert currently typed value into base Bytes
  const computeBaseBytes = (): number => {
    const num = parseFloat(inputValue);
    if (isNaN(num) || num < 0) return 0;

    const base = standard === "binary" ? 1024 : 1000;
    const unit = STORAGE_UNITS.find((u) => u.id === activeUnit);
    if (!unit) return 0;

    if (unit.id === "b") {
      return num / 8;
    }
    const exponent = standard === "binary" ? unit.binaryExponent : unit.decimalExponent;
    return num * Math.pow(base, exponent);
  };

  const baseBytes = computeBaseBytes();

  // Convert base Bytes into a specific unit
  const formatUnitValue = (unit: StorageUnit): string => {
    if (isNaN(baseBytes) || baseBytes === 0) return "0";

    const base = standard === "binary" ? 1024 : 1000;
    if (unit.id === "b") {
      const bits = baseBytes * 8;
      return Number(bits.toPrecision(10)).toString();
    }

    const exponent = standard === "binary" ? unit.binaryExponent : unit.decimalExponent;
    const val = baseBytes / Math.pow(base, exponent);

    if (val < 0.000001 && val > 0) {
      return val.toExponential(4);
    }
    return Number(val.toPrecision(10)).toString();
  };

  const handleCopy = (unitId: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedId(unitId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleSaveSpecSheet = () => {
    const detailsMap: Record<string, string> = {
      "Standard Mode": standard === "binary" ? "IEC Binary (1024-based)" : "SI Decimal (1000-based)",
      "Reference Value": `${inputValue} ${activeUnit}`,
      "Base Bytes": `${baseBytes.toLocaleString()} Bytes`,
    };

    STORAGE_UNITS.forEach((u) => {
      const sym = standard === "binary" ? u.binarySymbol : u.symbol;
      detailsMap[`${u.name} (${sym})`] = formatUnitValue(u);
    });

    downloadTextReport("storage-converter-spec", "Digital Storage Unit Converter", detailsMap);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-graphite/40 pb-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-800 text-slate-800 hover:text-signal mb-1 transition-colors font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO UTILITY WORKBENCH</span>
          </Link>
          <h1 className="font-display font-extrabold text-2xl text-slate-900 text-slate-900">
            Digital Storage Unit Converter
          </h1>
          <p className="font-mono text-xs text-slate-800 text-slate-800 font-medium">
            Real-time multi-unit matrix comparing IEC Binary (1024-based) vs SI Decimal (1000-based) standards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Standard Selector Toggle */}
          <div className="flex items-center gap-2 p-1 rounded-lg border border-graphite/40 bg-card-bg">
            <button
              onClick={() => setStandard("binary")}
              className={`px-3 py-1.5 rounded text-xs font-mono ${
                standard === "binary"
                  ? "bg-violet-600 text-white font-extrabold border border-signal shadow-sm"
                  : "text-slate-800 text-slate-800 hover:text-signal font-semibold"
              }`}
            >
              IEC Binary (1024)
            </button>
            <button
              onClick={() => setStandard("decimal")}
              className={`px-3 py-1.5 rounded text-xs font-mono ${
                standard === "decimal"
                  ? "bg-violet-600 text-white font-extrabold border border-signal shadow-sm"
                  : "text-slate-800 text-slate-800 hover:text-signal font-semibold"
              }`}
            >
              SI Decimal (1000)
            </button>
          </div>

          <button
            onClick={handleSaveSpecSheet}
            className="px-4 py-2 rounded bg-signal hover:bg-signal-hover text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            title="Download full storage matrix specification report"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>SAVE / DOWNLOAD SPEC</span>
          </button>
        </div>
      </div>

      {/* Info Technical Callout */}
      <div className="p-4 rounded-lg border border-blueprint/30 bg-blueprint/5 dark:bg-blueprint/20 text-xs font-mono text-slate-700 text-slate-700 flex items-start gap-3">
        <Info className="w-4 h-4 text-signal flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-900 text-slate-900">
            {standard === "binary" ? "IEC Binary Standard (Power of 2 / 1024)" : "SI Decimal Standard (Power of 10 / 1000)"}
          </p>
          <p className="text-[11px] leading-relaxed">
            {standard === "binary"
              ? "RAM, operating systems, and disk sector allocations traditionally count in powers of 2 (1 KiB = 1,024 Bytes; 1 GiB = 1,073,741,824 Bytes)."
              : "Storage manufacturers (hard drives, SSDs, flash drives) measure capacities in metric powers of 10 (1 KB = 1,000 Bytes; 1 GB = 1,000,000,000 Bytes). This explains why a '1 TB' drive appears as ~931 GiB in Windows."}
          </p>
        </div>
      </div>

      {/* Reactive Conversion Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {STORAGE_UNITS.map((unit) => {
          const isSelected = activeUnit === unit.id;
          const displaySymbol = standard === "binary" ? unit.binarySymbol : unit.symbol;
          const val = isSelected ? inputValue : formatUnitValue(unit);

          return (
            <div
              key={unit.id}
              className={`p-4 rounded-lg border transition-all ${
                isSelected
                  ? "border-signal bg-signal/5 ring-2 ring-signal/20 shadow-md"
                  : "border-graphite/30 bg-card-bg hover:border-graphite/60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900 text-slate-900">
                    {unit.name}
                  </span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-graphite/10 text-slate-700 text-slate-700">
                    {displaySymbol}
                  </span>
                </div>

                <button
                  onClick={() => handleCopy(unit.id, val)}
                  className="p-1 rounded text-slate-700 hover:text-signal focus:outline-none"
                  title="Copy value"
                >
                  {copiedId === unit.id ? (
                    <Check className="w-3.5 h-3.5 text-wire" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Input for active unit or read-only reactive calculation */}
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={val}
                  onFocus={() => {
                    if (!isSelected) {
                      setActiveUnit(unit.id);
                      setInputValue(val);
                    }
                  }}
                  onChange={(e) => {
                    setActiveUnit(unit.id);
                    setInputValue(e.target.value);
                  }}
                  className={`w-full font-mono text-base px-3 py-2 rounded border bg-white bg-white text-slate-900 text-slate-900 focus:outline-none focus:border-signal ${
                    isSelected ? "border-signal font-bold" : "border-graphite/20"
                  }`}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-700 text-slate-700">
                <span>
                  {unit.id === "b"
                    ? "1/8 Byte"
                    : unit.id === "B"
                    ? "Base 1 Byte"
                    : `1 ${displaySymbol} = ${
                        standard === "binary"
                          ? `1024^${unit.binaryExponent}`
                          : `1000^${unit.decimalExponent}`
                      } B`}
                </span>
                {isSelected && (
                  <span className="text-signal font-semibold">EDITING BASE</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reset Bar */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={() => {
            setActiveUnit("GB");
            setInputValue("1");
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded border border-graphite/30 hover:border-signal text-slate-700 hover:text-signal font-mono text-xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET TO 1 GB</span>
        </button>
      </div>
    </div>
  );
}
