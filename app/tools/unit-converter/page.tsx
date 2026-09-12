"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Scale, ArrowRightLeft, Copy, Check, FileDown } from "lucide-react";
import { downloadTextReport } from "@/lib/export-utils";

type UnitCategory = "length" | "weight" | "temperature" | "speed";

const CONVERSION_FACTORS: Record<
  "length" | "weight" | "speed",
  Record<string, number>
> = {
  length: {
    Meter: 1,
    Kilometer: 1000,
    Centimeter: 0.01,
    Millimeter: 0.001,
    Mile: 1609.344,
    Yard: 0.9144,
    Foot: 0.3048,
    Inch: 0.0254,
  },
  weight: {
    Kilogram: 1,
    Gram: 0.001,
    Milligram: 0.000001,
    Pound: 0.45359237,
    Ounce: 0.028349523,
    MetricTon: 1000,
  },
  speed: {
    "Meters per second (m/s)": 1,
    "Kilometers per hour (km/h)": 0.277778,
    "Miles per hour (mph)": 0.44704,
    "Knots (kn)": 0.514444,
  },
};

export default function UnitConverterPage() {
  const [category, setCategory] = useState<UnitCategory>("length");
  const [fromUnit, setFromUnit] = useState<string>("Meter");
  const [toUnit, setToUnit] = useState<string>("Foot");
  const [amount, setAmount] = useState<string>("1");
  const [copied, setCopied] = useState(false);

  const calculateConversion = (): string => {
    const num = parseFloat(amount);
    if (isNaN(num)) return "0";

    if (category === "temperature") {
      let celsius = num;
      if (fromUnit === "Fahrenheit") celsius = ((num - 32) * 5) / 9;
      if (fromUnit === "Kelvin") celsius = num - 273.15;

      let result = celsius;
      if (toUnit === "Fahrenheit") result = (celsius * 9) / 5 + 32;
      if (toUnit === "Kelvin") result = celsius + 273.15;
      return Number(result.toFixed(6)).toString();
    }

    const table = CONVERSION_FACTORS[category];
    const fromFactor = table[fromUnit] || 1;
    const toFactor = table[toUnit] || 1;
    const inBase = num * fromFactor;
    const converted = inBase / toFactor;
    return Number(converted.toFixed(6)).toString();
  };

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const getUnitOptions = () => {
    if (category === "temperature") return ["Celsius", "Fahrenheit", "Kelvin"];
    return Object.keys(CONVERSION_FACTORS[category]);
  };

  const handleCategoryChange = (cat: UnitCategory) => {
    setCategory(cat);
    if (cat === "temperature") {
      setFromUnit("Celsius");
      setToUnit("Fahrenheit");
    } else {
      const units = Object.keys(CONVERSION_FACTORS[cat]);
      setFromUnit(units[0]);
      setToUnit(units[1] || units[0]);
    }
  };

  const resultVal = calculateConversion();

  const handleSaveSpec = () => {
    downloadTextReport(
      "unit-conversion-spec",
      "Engineering Unit Converter",
      {
        "Measurement Domain": category.toUpperCase(),
        "Input Magnitude": `${amount} ${fromUnit}`,
        "Computed Output": `${resultVal} ${toUnit}`,
        "Equivalence Ratio": `1 ${fromUnit} ≈ ${(parseFloat(resultVal) / (parseFloat(amount) || 1)).toFixed(6)} ${toUnit}`,
      }
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
            Engineering Unit Converter
          </h1>
          <p className="font-mono text-xs text-slate-800 dark:text-slate-300 font-medium">
            Multi-system dimensional translation across length, mass, temperature, and velocity.
          </p>
        </div>

        <button
          onClick={handleSaveSpec}
          className="px-4 py-2 rounded bg-signal hover:bg-signal-hover text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          title="Download unit conversion specification report"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>SAVE / DOWNLOAD SPEC</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs">
        {(["length", "weight", "temperature", "speed"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-3 py-1.5 rounded uppercase font-semibold transition-colors ${
              category === cat
                ? "bg-blueprint text-paper border border-signal"
                : "border border-graphite/30 bg-card-bg text-graphite hover:border-signal"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Converter Box */}
      <div className="p-6 rounded-lg border border-graphite/30 bg-card-bg space-y-6 font-mono text-xs">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          {/* FROM */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-graphite font-bold block">FROM</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-base font-bold bg-paper dark:bg-ink border border-graphite/30 rounded p-2.5 outline-none focus:border-signal text-ink dark:text-paper"
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full bg-paper dark:bg-ink border border-graphite/30 rounded p-2 outline-none focus:border-signal"
            >
              {getUnitOptions().map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* SWAP BUTTON */}
          <div className="flex justify-center pt-4">
            <button
              onClick={swapUnits}
              className="p-3 rounded-full border border-graphite/30 hover:border-signal hover:bg-signal/10 text-graphite hover:text-signal transition-all"
              title="Swap units"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* TO */}
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-graphite font-bold">RESULT</label>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(resultVal);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="text-[10px] text-graphite hover:text-signal flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-wire" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <div className="w-full text-base font-bold bg-graphite/10 border border-graphite/20 rounded p-2.5 text-signal truncate">
              {resultVal}
            </div>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full bg-paper dark:bg-ink border border-graphite/30 rounded p-2 outline-none focus:border-signal"
            >
              {getUnitOptions().map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
