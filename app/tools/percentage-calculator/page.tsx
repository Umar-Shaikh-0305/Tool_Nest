"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Percent, FileDown } from "lucide-react";
import { downloadTextReport } from "@/lib/export-utils";

export default function PercentageCalculatorPage() {
  // Mode 1: What is X% of Y?
  const [m1X, setM1X] = useState<string>("15");
  const [m1Y, setM1Y] = useState<string>("200");

  // Mode 2: X is what % of Y?
  const [m2X, setM2X] = useState<string>("25");
  const [m2Y, setM2Y] = useState<string>("100");

  // Mode 3: % Increase/Decrease from X to Y
  const [m3X, setM3X] = useState<string>("50");
  const [m3Y, setM3Y] = useState<string>("75");

  // Mode 4: Discount & Final Price (Original X, Discount Y%)
  const [m4X, setM4X] = useState<string>("80");
  const [m4Y, setM4Y] = useState<string>("20");

  const calcM1 = () => {
    const x = parseFloat(m1X);
    const y = parseFloat(m1Y);
    if (isNaN(x) || isNaN(y)) return "0";
    return ((x / 100) * y).toFixed(2);
  };

  const calcM2 = () => {
    const x = parseFloat(m2X);
    const y = parseFloat(m2Y);
    if (isNaN(x) || isNaN(y) || y === 0) return "0%";
    return `${((x / y) * 100).toFixed(2)}%`;
  };

  const calcM3 = () => {
    const x = parseFloat(m3X);
    const y = parseFloat(m3Y);
    if (isNaN(x) || isNaN(y) || x === 0) return "0%";
    const diff = ((y - x) / x) * 100;
    const sign = diff > 0 ? "+" : "";
    return `${sign}${diff.toFixed(2)}%`;
  };

  const calcM4 = () => {
    const x = parseFloat(m4X);
    const y = parseFloat(m4Y);
    if (isNaN(x) || isNaN(y)) return { savings: "0", finalPrice: "0" };
    const savings = (x * (y / 100));
    const finalPrice = x - savings;
    return { savings: savings.toFixed(2), finalPrice: finalPrice.toFixed(2) };
  };

  const m4Result = calcM4();

  const handleSaveReport = () => {
    downloadTextReport(
      "percentage-workbench-report",
      "Percentage Utility Workbench",
      {
        "Mode 1: X% of Y": `${m1X}% of ${m1Y} = ${calcM1()}`,
        "Mode 2: Ratio": `${m2X} of ${m2Y} = ${calcM2()}`,
        "Mode 3: Delta Change": `From ${m3X} to ${m3Y} = ${calcM3()}`,
        "Mode 4: Discount": `Price $${m4X} with ${m4Y}% off = $${m4Result.finalPrice} (Saved $${m4Result.savings})`,
      }
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
            Percentage Utility Workbench
          </h1>
          <p className="font-mono text-xs text-slate-800 dark:text-slate-300 font-medium">
            Four targeted calculators for direct percentages, proportion ratios, delta changes, and retail discounts.
          </p>
        </div>

        <button
          onClick={handleSaveReport}
          className="px-4 py-2 rounded bg-signal hover:bg-signal-hover text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          title="Download percentage calculations report"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>SAVE / DOWNLOAD REPORT</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        {/* Module 1 */}
        <div className="p-5 rounded-lg border border-graphite/30 bg-card-bg space-y-3">
          <span className="font-bold text-ink dark:text-paper block pb-2 border-b border-graphite/20">
            1. WHAT IS X% OF Y?
          </span>
          <div className="flex items-center gap-2">
            <span>What is</span>
            <input
              type="number"
              value={m1X}
              onChange={(e) => setM1X(e.target.value)}
              className="w-20 p-2 rounded border border-graphite/30 bg-paper dark:bg-ink text-center font-bold"
            />
            <span>% of</span>
            <input
              type="number"
              value={m1Y}
              onChange={(e) => setM1Y(e.target.value)}
              className="w-24 p-2 rounded border border-graphite/30 bg-paper dark:bg-ink text-center font-bold"
            />
            <span>?</span>
          </div>
          <div className="pt-2 flex items-center justify-between">
            <span className="text-graphite">Computed Result:</span>
            <span className="text-xl font-bold text-signal">{calcM1()}</span>
          </div>
        </div>

        {/* Module 2 */}
        <div className="p-5 rounded-lg border border-graphite/30 bg-card-bg space-y-3">
          <span className="font-bold text-ink dark:text-paper block pb-2 border-b border-graphite/20">
            2. X IS WHAT % OF Y?
          </span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={m2X}
              onChange={(e) => setM2X(e.target.value)}
              className="w-20 p-2 rounded border border-graphite/30 bg-paper dark:bg-ink text-center font-bold"
            />
            <span>is what % of</span>
            <input
              type="number"
              value={m2Y}
              onChange={(e) => setM2Y(e.target.value)}
              className="w-24 p-2 rounded border border-graphite/30 bg-paper dark:bg-ink text-center font-bold"
            />
            <span>?</span>
          </div>
          <div className="pt-2 flex items-center justify-between">
            <span className="text-graphite">Computed Ratio:</span>
            <span className="text-xl font-bold text-signal">{calcM2()}</span>
          </div>
        </div>

        {/* Module 3 */}
        <div className="p-5 rounded-lg border border-graphite/30 bg-card-bg space-y-3">
          <span className="font-bold text-ink dark:text-paper block pb-2 border-b border-graphite/20">
            3. PERCENTAGE CHANGE (DELTA)
          </span>
          <div className="flex items-center gap-2">
            <span>From</span>
            <input
              type="number"
              value={m3X}
              onChange={(e) => setM3X(e.target.value)}
              className="w-24 p-2 rounded border border-graphite/30 bg-paper dark:bg-ink text-center font-bold"
            />
            <span>to</span>
            <input
              type="number"
              value={m3Y}
              onChange={(e) => setM3Y(e.target.value)}
              className="w-24 p-2 rounded border border-graphite/30 bg-paper dark:bg-ink text-center font-bold"
            />
          </div>
          <div className="pt-2 flex items-center justify-between">
            <span className="text-graphite">Net Difference:</span>
            <span className="text-xl font-bold text-wire">{calcM3()}</span>
          </div>
        </div>

        {/* Module 4 */}
        <div className="p-5 rounded-lg border border-graphite/30 bg-card-bg space-y-3">
          <span className="font-bold text-ink dark:text-paper block pb-2 border-b border-graphite/20">
            4. DISCOUNT &amp; FINAL PRICE
          </span>
          <div className="flex items-center gap-2">
            <span>Price: $</span>
            <input
              type="number"
              value={m4X}
              onChange={(e) => setM4X(e.target.value)}
              className="w-24 p-2 rounded border border-graphite/30 bg-paper dark:bg-ink text-center font-bold"
            />
            <span>Discount:</span>
            <input
              type="number"
              value={m4Y}
              onChange={(e) => setM4Y(e.target.value)}
              className="w-16 p-2 rounded border border-graphite/30 bg-paper dark:bg-ink text-center font-bold"
            />
            <span>%</span>
          </div>
          <div className="pt-2 flex items-center justify-between text-graphite">
            <span>Savings: ${m4Result.savings}</span>
            <div className="text-right">
              <span className="text-xs text-graphite block">Final:</span>
              <span className="text-xl font-bold text-signal">${m4Result.finalPrice}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
