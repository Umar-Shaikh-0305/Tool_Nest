"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Download } from "lucide-react";
import { downloadTextReport } from "@/lib/export-utils";

export default function CssGradientPage() {
  const [color1, setColor1] = useState("#7C3AED");
  const [color2, setColor2] = useState("#EC4899");
  const [angle, setAngle] = useState(135);
  const [type, setType] = useState<"linear" | "radial">("linear");
  const [copied, setCopied] = useState(false);

  const css = type === "linear"
    ? `background: linear-gradient(${angle}deg, ${color1}, ${color2});`
    : `background: radial-gradient(circle, ${color1}, ${color2});`;

  const copy = async () => {
    await navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const save = () => downloadTextReport("css-gradient", "CSS Gradient Generator", { Type: type, Color1: color1, Color2: color2, Angle: `${angle}deg` }, css);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Tools
        </Link>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">CSS Gradient Generator</h1>
          <p className="text-slate-500 text-sm mb-6">Build beautiful CSS gradients visually and copy the code.</p>

          {/* Preview */}
          <div className="w-full h-36 sm:h-44 rounded-2xl mb-6 border border-slate-200 shadow-inner"
            style={type === "linear"
              ? { background: `linear-gradient(${angle}deg, ${color1}, ${color2})` }
              : { background: `radial-gradient(circle, ${color1}, ${color2})` }} />

          <div className="grid grid-cols-2 rounded-xl border border-slate-200 overflow-hidden mb-5">
            {(["linear", "radial"] as const).map((t) => (
              <button key={t} onClick={() => setType(t)}
                className={`py-2.5 text-sm font-semibold capitalize transition-colors text-center ${
                  type === t ? "bg-violet-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                }`}>{t}</button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Color 1</label>
              <div className="flex items-center gap-2">
                <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5 shrink-0" />
                <input type="text" value={color1} onChange={(e) => setColor1(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm font-mono focus:outline-none focus:border-violet-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Color 2</label>
              <div className="flex items-center gap-2">
                <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5 shrink-0" />
                <input type="text" value={color2} onChange={(e) => setColor2(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm font-mono focus:outline-none focus:border-violet-400" />
              </div>
            </div>
          </div>

          {type === "linear" && (
            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Angle — {angle}°</label>
              <input type="range" min="0" max="360" value={angle} onChange={(e) => setAngle(Number(e.target.value))}
                className="w-full accent-violet-600" />
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-900 font-mono text-xs sm:text-sm text-emerald-400 mb-4 break-all">
            {css}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={copy}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-violet-50 text-slate-700 hover:text-violet-600 text-sm font-semibold transition-colors border border-slate-200">
              <Copy className="w-4 h-4" />{copied ? "Copied!" : "Copy CSS"}
            </button>
            <button onClick={save}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-violet-50 text-slate-700 hover:text-violet-600 text-sm font-semibold transition-colors border border-slate-200">
              <Download className="w-4 h-4" /> Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
