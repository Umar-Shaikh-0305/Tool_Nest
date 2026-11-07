"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Delete,
  RotateCcw,
  History,
  Trash2,
  Copy,
  Check,
  Calculator as CalcIcon,
  FileDown,
} from "lucide-react";
import * as math from "mathjs";
import { downloadTextReport } from "@/lib/export-utils";

interface HistoryEntry {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
}

export default function ScientificCalculatorPage() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("");
  const [memory, setMemory] = useState<number>(0);
  const [hasMemory, setHasMemory] = useState(false);
  const [isRad, setIsRad] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const appendToExpression = (val: string) => {
    setExpression((prev) => prev + val);
    inputRef.current?.focus();
  };

  const clearAll = () => {
    setExpression("");
    setResult("");
    inputRef.current?.focus();
  };

  const deleteLast = () => {
    setExpression((prev) => prev.slice(0, -1));
    inputRef.current?.focus();
  };

  const evaluateExpression = () => {
    if (!expression.trim()) return;

    try {
      // Prepare expression for mathjs
      let cleanExpr = expression
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/π/g, "pi");

      // Handle degree/radian conversion for trig functions if in deg mode
      if (!isRad) {
        cleanExpr = cleanExpr
          .replace(/sin\(([^)]+)\)/g, "sin(($1) deg)")
          .replace(/cos\(([^)]+)\)/g, "cos(($1) deg)")
          .replace(/tan\(([^)]+)\)/g, "tan(($1) deg)");
      }

      const evaluated = math.evaluate(cleanExpr);
      const formatted = typeof evaluated === "number" ? math.format(evaluated, { precision: 12 }) : String(evaluated);

      setResult(formatted);

      // Save to history
      const newEntry: HistoryEntry = {
        id: `calc-${Date.now()}`,
        expression,
        result: formatted,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      };
      setHistory((prev) => [newEntry, ...prev.slice(0, 24)]);
    } catch (err: any) {
      setResult("Syntax Error");
    }
  };

  // Keyboard Handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      evaluateExpression();
    } else if (e.key === "Escape") {
      e.preventDefault();
      clearAll();
    }
  };

  // Memory Functions
  const handleMemoryAdd = () => {
    const val = parseFloat(result) || parseFloat(expression) || 0;
    setMemory((prev) => prev + val);
    setHasMemory(true);
  };

  const handleMemorySubtract = () => {
    const val = parseFloat(result) || parseFloat(expression) || 0;
    setMemory((prev) => prev - val);
    setHasMemory(true);
  };

  const handleMemoryRecall = () => {
    if (hasMemory) {
      appendToExpression(String(memory));
    }
  };

  const handleMemoryClear = () => {
    setMemory(0);
    setHasMemory(false);
  };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveReport = () => {
    const historyText = history
      .map((h) => `[${h.timestamp}] ${h.expression} = ${h.result}`)
      .join("\n");

    downloadTextReport(
      "scientific-calc-report",
      "Scientific Calculator",
      {
        "Active Expression": expression || "None",
        "Calculated Result": result || "None",
        "Angle Mode": isRad ? "Radians (RAD)" : "Degrees (DEG)",
        "Memory Register": hasMemory ? String(memory) : "Empty",
        "Recorded Entries": history.length,
      },
      historyText ? `CALCULATION HISTORY LEDGER:\n${historyText}` : undefined
    );
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
            Precision Scientific Calculator
          </h1>
          <p className="font-mono text-xs text-slate-800 text-slate-800 font-medium">
            Safe mathematical expression parsing with math.js, full trigonometric set, memory registers, and calculation ledger.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-900 text-slate-800 font-bold">ANGLE MODE:</span>
            <button
              onClick={() => setIsRad(!isRad)}
              className="px-2.5 py-1 rounded border border-graphite/40 font-mono text-xs font-bold text-signal bg-signal/15 hover:border-signal transition-colors"
            >
              {isRad ? "RAD (Radians)" : "DEG (Degrees)"}
            </button>
          </div>

          <button
            onClick={handleSaveReport}
            className="px-4 py-2 rounded bg-signal hover:bg-signal-hover text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            title="Download calculation record with date and timestamp"
          >
            <FileDown className="w-4 h-4" />
            <span>SAVE / DOWNLOAD REPORT</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center: Calculator Display & Keypad */}
        <div className="lg:col-span-8 space-y-4">
          {/* Scientific Terminal Display */}
          <div className="p-5 rounded-lg border border-graphite/40 bg-card-bg shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-wire inline-block" />
                <span>MATH ENGINE: ACTIVE</span>
                {hasMemory && (
                  <span className="px-1.5 py-0.2 rounded bg-signal/20 text-signal font-bold">
                    M: {memory}
                  </span>
                )}
              </div>
              <span>{isRad ? "RAD" : "DEG"}</span>
            </div>

            {/* Expression Input */}
            <input
              ref={inputRef}
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter equation (e.g. sin(45) + sqrt(144) * 2^3)..."
              className="w-full text-right font-mono text-xl sm:text-2xl bg-transparent text-slate-900 text-slate-900 outline-none border-b border-graphite/20 pb-2 focus:border-signal tracking-wide"
            />

            {/* Result Line */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={copyResult}
                disabled={!result || result === "Syntax Error"}
                className="text-xs font-mono text-slate-700 hover:text-signal disabled:opacity-30 flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-wire" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Result"}</span>
              </button>

              <div className="text-right">
                <span className="font-mono text-2xl sm:text-3xl font-bold text-signal">
                  {result ? `= ${result}` : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Keypad Grid */}
          <div className="p-4 rounded-lg border border-graphite/30 bg-card-bg space-y-3 font-mono">
            {/* Memory & Utility Row */}
            <div className="grid grid-cols-6 gap-2">
              <button
                onClick={handleMemoryClear}
                className="py-2 rounded border border-graphite/30 text-xs hover:border-signal"
              >
                MC
              </button>
              <button
                onClick={handleMemoryRecall}
                className="py-2 rounded border border-graphite/30 text-xs hover:border-signal"
              >
                MR
              </button>
              <button
                onClick={handleMemoryAdd}
                className="py-2 rounded border border-graphite/30 text-xs hover:border-signal"
              >
                M+
              </button>
              <button
                onClick={handleMemorySubtract}
                className="py-2 rounded border border-graphite/30 text-xs hover:border-signal"
              >
                M-
              </button>
              <button
                onClick={deleteLast}
                className="py-2 rounded border border-graphite/30 text-xs text-red-500 hover:border-red-500 flex items-center justify-center"
                title="Backspace"
              >
                <Delete className="w-4 h-4" />
              </button>
              <button
                onClick={clearAll}
                className="py-2 rounded border border-red-500/40 text-red-500 text-xs font-bold hover:bg-red-500/10"
              >
                AC
              </button>
            </div>

            {/* Scientific Function Keypad */}
            <div className="grid grid-cols-6 gap-2 text-xs">
              <button
                onClick={() => appendToExpression("sin(")}
                className="py-2.5 rounded border border-graphite/30 bg-blueprint/5 hover:border-signal"
              >
                sin
              </button>
              <button
                onClick={() => appendToExpression("cos(")}
                className="py-2.5 rounded border border-graphite/30 bg-blueprint/5 hover:border-signal"
              >
                cos
              </button>
              <button
                onClick={() => appendToExpression("tan(")}
                className="py-2.5 rounded border border-graphite/30 bg-blueprint/5 hover:border-signal"
              >
                tan
              </button>
              <button
                onClick={() => appendToExpression("(")}
                className="py-2.5 rounded border border-graphite/30 hover:border-signal"
              >
                (
              </button>
              <button
                onClick={() => appendToExpression(")")}
                className="py-2.5 rounded border border-graphite/30 hover:border-signal"
              >
                )
              </button>
              <button
                onClick={() => appendToExpression("^")}
                className="py-2.5 rounded border border-graphite/30 hover:border-signal text-signal font-bold"
              >
                x^y
              </button>

              <button
                onClick={() => appendToExpression("asin(")}
                className="py-2.5 rounded border border-graphite/30 bg-blueprint/5 hover:border-signal"
              >
                asin
              </button>
              <button
                onClick={() => appendToExpression("acos(")}
                className="py-2.5 rounded border border-graphite/30 bg-blueprint/5 hover:border-signal"
              >
                acos
              </button>
              <button
                onClick={() => appendToExpression("atan(")}
                className="py-2.5 rounded border border-graphite/30 bg-blueprint/5 hover:border-signal"
              >
                atan
              </button>
              <button
                onClick={() => appendToExpression("sqrt(")}
                className="py-2.5 rounded border border-graphite/30 hover:border-signal"
              >
                √
              </button>
              <button
                onClick={() => appendToExpression("cbrt(")}
                className="py-2.5 rounded border border-graphite/30 hover:border-signal"
              >
                ∛
              </button>
              <button
                onClick={() => appendToExpression("!")}
                className="py-2.5 rounded border border-graphite/30 hover:border-signal"
              >
                x!
              </button>

              <button
                onClick={() => appendToExpression("log10(")}
                className="py-2.5 rounded border border-graphite/30 bg-blueprint/5 hover:border-signal"
              >
                log
              </button>
              <button
                onClick={() => appendToExpression("log(")}
                className="py-2.5 rounded border border-graphite/30 bg-blueprint/5 hover:border-signal"
              >
                ln
              </button>
              <button
                onClick={() => appendToExpression("pi")}
                className="py-2.5 rounded border border-graphite/30 hover:border-signal"
              >
                π
              </button>
              <button
                onClick={() => appendToExpression("e")}
                className="py-2.5 rounded border border-graphite/30 hover:border-signal"
              >
                e
              </button>
              <button
                onClick={() => appendToExpression("%")}
                className="py-2.5 rounded border border-graphite/30 hover:border-signal"
              >
                %
              </button>
              <button
                onClick={() => appendToExpression("÷")}
                className="py-2.5 rounded border border-graphite/30 text-signal font-bold text-sm hover:border-signal"
              >
                ÷
              </button>

              {/* Numerical Block */}
              <button
                onClick={() => appendToExpression("7")}
                className="py-3 rounded border border-graphite/30 font-bold hover:border-signal bg-graphite/5"
              >
                7
              </button>
              <button
                onClick={() => appendToExpression("8")}
                className="py-3 rounded border border-graphite/30 font-bold hover:border-signal bg-graphite/5"
              >
                8
              </button>
              <button
                onClick={() => appendToExpression("9")}
                className="py-3 rounded border border-graphite/30 font-bold hover:border-signal bg-graphite/5"
              >
                9
              </button>
              <button
                onClick={() => appendToExpression("×")}
                className="py-3 rounded border border-graphite/30 text-signal font-bold text-sm hover:border-signal"
              >
                ×
              </button>
              <button
                onClick={() => appendToExpression("abs(")}
                className="py-3 rounded border border-graphite/30 hover:border-signal text-[11px]"
              >
                |x|
              </button>
              <button
                onClick={() => appendToExpression("-")}
                className="py-3 rounded border border-graphite/30 text-signal font-bold text-sm hover:border-signal"
              >
                -
              </button>

              <button
                onClick={() => appendToExpression("4")}
                className="py-3 rounded border border-graphite/30 font-bold hover:border-signal bg-graphite/5"
              >
                4
              </button>
              <button
                onClick={() => appendToExpression("5")}
                className="py-3 rounded border border-graphite/30 font-bold hover:border-signal bg-graphite/5"
              >
                5
              </button>
              <button
                onClick={() => appendToExpression("6")}
                className="py-3 rounded border border-graphite/30 font-bold hover:border-signal bg-graphite/5"
              >
                6
              </button>
              <button
                onClick={() => appendToExpression("+")}
                className="py-3 rounded border border-graphite/30 text-signal font-bold text-sm hover:border-signal"
              >
                +
              </button>
              <button
                onClick={() => appendToExpression("mod(")}
                className="py-3 rounded border border-graphite/30 hover:border-signal text-[11px]"
              >
                mod
              </button>
              <button
                onClick={() => appendToExpression("10^")}
                className="py-3 rounded border border-graphite/30 hover:border-signal text-[11px]"
              >
                10^x
              </button>

              <button
                onClick={() => appendToExpression("1")}
                className="py-3 rounded border border-graphite/30 font-bold hover:border-signal bg-graphite/5"
              >
                1
              </button>
              <button
                onClick={() => appendToExpression("2")}
                className="py-3 rounded border border-graphite/30 font-bold hover:border-signal bg-graphite/5"
              >
                2
              </button>
              <button
                onClick={() => appendToExpression("3")}
                className="py-3 rounded border border-graphite/30 font-bold hover:border-signal bg-graphite/5"
              >
                3
              </button>
              <button
                onClick={() => appendToExpression("0")}
                className="py-3 rounded border border-graphite/30 font-bold hover:border-signal bg-graphite/5"
              >
                0
              </button>
              <button
                onClick={() => appendToExpression(".")}
                className="py-3 rounded border border-graphite/30 font-bold hover:border-signal"
              >
                .
              </button>
              <button
                onClick={evaluateExpression}
                className="py-3 rounded bg-signal hover:bg-signal-hover text-slate-900 font-extrabold text-base transition-colors shadow-sm"
              >
                =
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Calculation History Ledger */}
        <div className="lg:col-span-4 p-4 rounded-lg border border-graphite/30 bg-card-bg flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3 border-b border-graphite/20 mb-3">
            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-900 text-slate-900">
              <History className="w-3.5 h-3.5 text-signal" />
              <span>CALCULATION LEDGER</span>
            </div>
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className="text-[10px] font-mono text-red-500 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {history.length === 0 ? (
              <div className="text-center py-12 text-slate-700 font-mono text-xs">
                No calculation recorded yet.
              </div>
            ) : (
              history.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => {
                    setExpression(entry.expression);
                    setResult(entry.result);
                  }}
                  className="p-2.5 rounded border border-graphite/20 hover:border-signal bg-graphite/5 cursor-pointer font-mono text-xs space-y-1 transition-all"
                  title="Click to recall this expression"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-700">
                    <span>{entry.timestamp}</span>
                    <span className="text-wire hover:underline">Recall</span>
                  </div>
                  <div className="text-slate-700 text-slate-700 truncate">
                    {entry.expression}
                  </div>
                  <div className="text-signal font-bold text-sm text-right">
                    = {entry.result}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
