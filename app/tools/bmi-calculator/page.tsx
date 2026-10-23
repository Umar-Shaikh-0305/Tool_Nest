"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Activity, Info, FileDown } from "lucide-react";
import { downloadTextReport } from "@/lib/export-utils";

export default function BmiCalculatorPage() {
  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">("metric");

  // Metric: height (cm), weight (kg)
  const [cm, setCm] = useState<string>("175");
  const [kg, setKg] = useState<string>("70");

  // Imperial: feet, inches, lbs
  const [feet, setFeet] = useState<string>("5");
  const [inches, setInches] = useState<string>("9");
  const [lbs, setLbs] = useState<string>("154");

  const calculateBmi = () => {
    if (unitSystem === "metric") {
      const h = parseFloat(cm) / 100;
      const w = parseFloat(kg);
      if (!h || !w || h <= 0) return null;
      return w / (h * h);
    } else {
      const f = parseFloat(feet) || 0;
      const inc = parseFloat(inches) || 0;
      const totalInches = f * 12 + inc;
      const w = parseFloat(lbs);
      if (!totalInches || !w || totalInches <= 0) return null;
      return (w / (totalInches * totalInches)) * 703;
    }
  };

  const bmi = calculateBmi();

  const getCategory = (val: number) => {
    if (val < 18.5) return { name: "Underweight", color: "text-blueprint" };
    if (val < 25) return { name: "Normal Weight", color: "text-wire" };
    if (val < 30) return { name: "Overweight", color: "text-signal" };
    return { name: "Obese", color: "text-red-500" };
  };

  const category = bmi ? getCategory(bmi) : null;

  const handleSaveReport = () => {
    if (!bmi || !category) return;
    const heightStr = unitSystem === "metric" ? `${cm} cm` : `${feet} ft ${inches} in`;
    const weightStr = unitSystem === "metric" ? `${kg} kg` : `${lbs} lbs`;

    downloadTextReport(
      "bmi-biometric-report",
      "Body Mass Index (BMI) Analyzer",
      {
        "Measurement Standard": unitSystem.toUpperCase(),
        "Recorded Height": heightStr,
        "Recorded Weight": weightStr,
        "Body Mass Index (BMI)": bmi.toFixed(2),
        "Clinical Classification": category.name.toUpperCase(),
        "Healthy Range Standard": "18.5 – 24.9 BMI",
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
            Body Mass Index (BMI) Analyzer
          </h1>
          <p className="font-mono text-xs text-slate-800 text-slate-800 font-medium">
            Biometric ratio index calculation with category classification and target ranges.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 p-1 rounded-lg border border-graphite/40 bg-card-bg font-mono text-xs">
            <button
              onClick={() => setUnitSystem("metric")}
              className={`px-3 py-1.5 rounded ${
                unitSystem === "metric"
                  ? "bg-violet-600 text-white font-extrabold border border-signal shadow-sm"
                  : "text-slate-800 text-slate-800 font-semibold"
              }`}
            >
              Metric (cm/kg)
            </button>
            <button
              onClick={() => setUnitSystem("imperial")}
              className={`px-3 py-1.5 rounded ${
                unitSystem === "imperial"
                  ? "bg-violet-600 text-white font-extrabold border border-signal shadow-sm"
                  : "text-slate-800 text-slate-800 font-semibold"
              }`}
            >
              Imperial (ft/lbs)
            </button>
          </div>

          <button
            onClick={handleSaveReport}
            disabled={!bmi}
            className="px-4 py-2 rounded bg-signal hover:bg-signal-hover text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-40"
            title="Download biometric BMI report"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>SAVE / DOWNLOAD REPORT</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 font-mono text-xs">
        <div className="md:col-span-6 p-6 rounded-lg border border-graphite/30 bg-card-bg space-y-4">
          <span className="font-bold text-slate-900 text-slate-900 block pb-2 border-b border-graphite/20">
            PHYSICAL PARAMETERS
          </span>

          {unitSystem === "metric" ? (
            <>
              <div className="space-y-1">
                <label className="text-slate-700 block">HEIGHT (CM)</label>
                <input
                  type="number"
                  value={cm}
                  onChange={(e) => setCm(e.target.value)}
                  className="w-full p-2.5 rounded border border-graphite/30 bg-white bg-white text-sm font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-700 block">WEIGHT (KG)</label>
                <input
                  type="number"
                  value={kg}
                  onChange={(e) => setKg(e.target.value)}
                  className="w-full p-2.5 rounded border border-graphite/30 bg-white bg-white text-sm font-bold"
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-slate-700 block">HEIGHT (FEET &amp; INCHES)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={feet}
                    onChange={(e) => setFeet(e.target.value)}
                    placeholder="Feet"
                    className="p-2.5 rounded border border-graphite/30 bg-white bg-white text-sm font-bold"
                  />
                  <input
                    type="number"
                    value={inches}
                    onChange={(e) => setInches(e.target.value)}
                    placeholder="Inches"
                    className="p-2.5 rounded border border-graphite/30 bg-white bg-white text-sm font-bold"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-slate-700 block">WEIGHT (LBS)</label>
                <input
                  type="number"
                  value={lbs}
                  onChange={(e) => setLbs(e.target.value)}
                  className="w-full p-2.5 rounded border border-graphite/30 bg-white bg-white text-sm font-bold"
                />
              </div>
            </>
          )}
        </div>

        {/* Results Panel */}
        <div className="md:col-span-6 p-6 rounded-lg border border-graphite/30 bg-card-bg flex flex-col justify-center items-center text-center space-y-4">
          <span className="text-slate-700">COMPUTED BMI RATIO</span>
          <div className="text-4xl sm:text-5xl font-extrabold text-signal">
            {bmi ? bmi.toFixed(1) : "--"}
          </div>

          {category && (
            <div className={`text-base font-bold uppercase tracking-wider ${category.color}`}>
              {category.name}
            </div>
          )}

          <div className="w-full pt-4 border-t border-graphite/20 text-[11px] text-slate-700 space-y-1 text-left">
            <div className="flex justify-between">
              <span>Underweight:</span>
              <span>&lt; 18.5</span>
            </div>
            <div className="flex justify-between">
              <span>Normal weight:</span>
              <span>18.5 – 24.9</span>
            </div>
            <div className="flex justify-between">
              <span>Overweight:</span>
              <span>25.0 – 29.9</span>
            </div>
            <div className="flex justify-between">
              <span>Obese:</span>
              <span>&ge; 30.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
