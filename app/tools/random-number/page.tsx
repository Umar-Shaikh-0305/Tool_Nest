"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Copy, Download } from "lucide-react";
import { downloadTextReport } from "@/lib/export-utils";

export default function RandomNumberPage() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [decimals, setDecimals] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const nums: number[] = [];
    for (let i = 0; i < count; i++) {
      const n = Math.random() * (max - min) + min;
      nums.push(decimals ? Math.round(n * 100) / 100 : Math.floor(n));
    }
    setResults(nums);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(results.join(", "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const save = () => downloadTextReport("random-number", "Random Number Generator",
    { Min: min, Max: max, Count: count, Decimals: decimals ? "Yes" : "No" },
    results.join(", "));

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Tools
        </Link>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Random Number Generator</h1>
          <p className="text-slate-500 text-sm mb-6">Generate random numbers, rolls, or picks in any range.</p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Min</label>
              <input type="number" value={min} onChange={(e) => setMin(Number(e.target.value))}
                className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold text-center focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Max</label>
              <input type="number" value={max} onChange={(e) => setMax(Number(e.target.value))}
                className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold text-center focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">How many numbers? ({count})</label>
            <input type="range" min="1" max="20" value={count} onChange={(e) => setCount(Number(e.target.value))}
              className="w-full accent-violet-600" />
          </div>

          <label className="flex items-center gap-2 mb-5 cursor-pointer">
            <input type="checkbox" checked={decimals} onChange={(e) => setDecimals(e.target.checked)}
              className="w-4 h-4 rounded accent-violet-600" />
            <span className="text-sm font-medium text-slate-700">Include decimals</span>
          </label>

          <button onClick={generate}
            className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors mb-5">
            <RefreshCw className="w-4 h-4" /> Generate
          </button>

          {results.length > 0 && (
            <>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap gap-2 mb-3 justify-center">
                {results.map((n, i) => (
                  <span key={i} className="px-4 py-2 rounded-xl bg-violet-100 text-violet-800 font-bold text-xl">{n}</span>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={copy}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-violet-50 text-slate-700 hover:text-violet-600 text-sm font-semibold transition-colors border border-slate-200">
                  <Copy className="w-4 h-4" />{copied ? "Copied!" : "Copy"}
                </button>
                <button onClick={save}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-violet-50 text-slate-700 hover:text-violet-600 text-sm font-semibold transition-colors border border-slate-200">
                  <Download className="w-4 h-4" /> Save
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
