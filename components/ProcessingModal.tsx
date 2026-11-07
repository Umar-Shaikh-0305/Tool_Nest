"use client";
import React, { useEffect, useState } from "react";

interface ProcessingModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  progressText?: string;
  color?: "red" | "violet" | "emerald" | "amber" | "sky";
}

export default function ProcessingModal({
  isOpen,
  title,
  subtitle,
  progressText,
  color = "red",
}: ProcessingModalProps) {
  const [percent, setPercent] = useState(15);

  useEffect(() => {
    if (!isOpen) {
      setPercent(15);
      return;
    }

    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 95) return prev;
        const jump = Math.floor(Math.random() * 12) + 5;
        return Math.min(prev + jump, 95);
      });
    }, 280);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const colorStyles = {
    red: {
      spinner: "border-red-600",
      accent: "text-red-600",
      bgBar: "bg-red-500",
    },
    violet: {
      spinner: "border-violet-600",
      accent: "text-violet-600",
      bgBar: "bg-violet-500",
    },
    emerald: {
      spinner: "border-emerald-600",
      accent: "text-emerald-600",
      bgBar: "bg-emerald-500",
    },
    amber: {
      spinner: "border-amber-600",
      accent: "text-amber-600",
      bgBar: "bg-amber-500",
    },
    sky: {
      spinner: "border-sky-600",
      accent: "text-sky-600",
      bgBar: "bg-sky-500",
    },
  }[color] || {
    spinner: "border-red-600",
    accent: "text-red-600",
    bgBar: "bg-red-500",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 sm:p-10 max-w-md w-full flex flex-col items-center text-center space-y-6">
        
        {/* Title matching TinyWow screenshot */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
          {title}
        </h2>

        {/* Circular Progress Spinner as shown in user's image */}
        <div className="relative w-28 h-28 flex items-center justify-center my-2">
          {/* Subtle track ring */}
          <div className="w-24 h-24 rounded-full border-8 border-slate-100" />
          
          {/* Spinning colored arc */}
          <div
            className={`absolute w-24 h-24 rounded-full border-8 border-transparent ${colorStyles.spinner} border-t-transparent border-r-transparent animate-spin`}
            style={{ animationDuration: "0.85s" }}
          />

          {/* Center percentage badge */}
          <div className="absolute flex flex-col items-center">
            <span className="text-sm font-black text-slate-700">{percent}%</span>
          </div>
        </div>

        {/* Subtitle / Progress text */}
        <div className="space-y-1">
          {progressText && (
            <p className="text-sm font-semibold text-slate-700">
              {progressText}
            </p>
          )}
          <p className="text-xs text-slate-400">
            {subtitle || "Optimizing layout & formatting... Please wait a few seconds."}
          </p>
        </div>

        {/* Linear progress bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full ${colorStyles.bgBar} rounded-full transition-all duration-300 ease-out`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
