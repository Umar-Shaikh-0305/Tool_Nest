"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Cake, Clock, FileDown } from "lucide-react";
import { downloadTextReport } from "@/lib/export-utils";

export default function AgeCalculatorPage() {
  const [birthDate, setBirthDate] = useState<string>("2000-01-01");

  const calculation = useMemo(() => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const now = new Date();
    if (isNaN(birth.getTime()) || birth > now) return null;

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const diffMs = now.getTime() - birth.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const totalMinutes = Math.floor(diffMs / (1000 * 60));

    // Next birthday calculation
    let nextBday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBday < now) {
      nextBday = new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate());
    }
    const msUntilBday = nextBday.getTime() - now.getTime();
    const daysUntilNextBday = Math.ceil(msUntilBday / (1000 * 60 * 60 * 24));

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const bornDay = daysOfWeek[birth.getDay()];

    return {
      years,
      months,
      days,
      totalDays,
      totalHours,
      totalMinutes,
      daysUntilNextBday,
      bornDay,
    };
  }, [birthDate]);

  const handleSaveReport = () => {
    if (!calculation) return;

    downloadTextReport(
      "chronological-age-record",
      "Chronological Age Calculator",
      {
        "Recorded Date of Birth": birthDate,
        "Day of Week Born": calculation.bornDay,
        "Current Chronological Age": `${calculation.years} Years, ${calculation.months} Months, ${calculation.days} Days`,
        "Total Days Lived": calculation.totalDays.toLocaleString(),
        "Total Hours Lived": `${calculation.totalHours.toLocaleString()} Hours`,
        "Total Minutes Lived": `${calculation.totalMinutes.toLocaleString()} Minutes`,
        "Next Birthday Countdown": `${calculation.daysUntilNextBday} Days Remaining`,
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
            Chronological Age Calculator
          </h1>
          <p className="font-mono text-xs text-slate-800 text-slate-800 font-medium">
            Precision temporal calculation with exact epoch breakdowns and solar return countdowns.
          </p>
        </div>

        <button
          onClick={handleSaveReport}
          disabled={!calculation}
          className="px-4 py-2 rounded bg-signal hover:bg-signal-hover text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-40"
          title="Download chronological age record"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>SAVE / DOWNLOAD RECORD</span>
        </button>
      </div>

      <div className="p-6 rounded-lg border border-graphite/40 bg-card-bg space-y-6 font-mono text-xs shadow-sm">
        <div className="max-w-xs space-y-2">
          <label className="text-slate-900 text-slate-800 font-bold block">DATE OF BIRTH</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full p-2.5 rounded border border-graphite/30 bg-white bg-white text-sm font-bold text-slate-900 text-slate-900 outline-none focus:border-signal"
          />
        </div>

        {calculation ? (
          <div className="space-y-6 pt-4 border-t border-graphite/20">
            {/* Primary Age Display */}
            <div className="p-6 rounded-lg bg-blueprint/5 dark:bg-blueprint/20 border border-blueprint/30 text-center space-y-2">
              <span className="text-slate-700 uppercase text-[10px]">Current Chronological Age</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-signal flex items-center justify-center gap-3">
                <span>{calculation.years} <span className="text-xs text-slate-700 font-normal">years</span></span>
                <span>{calculation.months} <span className="text-xs text-slate-700 font-normal">months</span></span>
                <span>{calculation.days} <span className="text-xs text-slate-700 font-normal">days</span></span>
              </div>
              <p className="text-[11px] text-slate-700">You were born on a {calculation.bornDay}.</p>
            </div>

            {/* Total Units Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded border border-graphite/20 bg-card-bg">
                <span className="text-[10px] text-slate-700 block">TOTAL DAYS</span>
                <span className="text-lg font-bold text-slate-900 text-slate-900">
                  {calculation.totalDays.toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded border border-graphite/20 bg-card-bg">
                <span className="text-[10px] text-slate-700 block">TOTAL HOURS</span>
                <span className="text-lg font-bold text-slate-900 text-slate-900">
                  {calculation.totalHours.toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded border border-graphite/20 bg-card-bg">
                <span className="text-[10px] text-slate-700 block">TOTAL MINUTES</span>
                <span className="text-lg font-bold text-slate-900 text-slate-900">
                  {calculation.totalMinutes.toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded border border-graphite/20 bg-card-bg">
                <span className="text-[10px] text-slate-700 block">NEXT BIRTHDAY</span>
                <span className="text-lg font-bold text-wire">
                  {calculation.daysUntilNextBday} days
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-slate-700">Please choose a valid birth date in the past.</p>
        )}
      </div>
    </div>
  );
}
