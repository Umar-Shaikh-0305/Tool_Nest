"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Download } from "lucide-react";
import { downloadTextReport } from "@/lib/export-utils";

const convert = (text: string, mode: string): string => {
  switch (mode) {
    case "upper": return text.toUpperCase();
    case "lower": return text.toLowerCase();
    case "title": return text.replace(/\b\w/g, (c) => c.toUpperCase());
    case "sentence": return text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : "";
    case "camel": return text.replace(/(?:^\w|[A-Z]|\b\w)/g, (w, i) => i === 0 ? w.toLowerCase() : w.toUpperCase()).replace(/\s+/g, "");
    case "pascal": return text.replace(/(?:^\w|[A-Z]|\b\w)/g, (w) => w.toUpperCase()).replace(/\s+/g, "");
    case "snake": return text.toLowerCase().replace(/\s+/g, "_");
    case "kebab": return text.toLowerCase().replace(/\s+/g, "-");
    case "constant": return text.toUpperCase().replace(/\s+/g, "_");
    default: return text;
  }
};

const MODES = [
  { key: "upper", label: "UPPERCASE" },
  { key: "lower", label: "lowercase" },
  { key: "title", label: "Title Case" },
  { key: "sentence", label: "Sentence case" },
  { key: "camel", label: "camelCase" },
  { key: "pascal", label: "PascalCase" },
  { key: "snake", label: "snake_case" },
  { key: "kebab", label: "kebab-case" },
  { key: "constant", label: "CONSTANT_CASE" },
];

export default function TextCaseConverterPage() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("upper");
  const [copied, setCopied] = useState(false);

  const output = convert(input, mode);

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const save = () => downloadTextReport("text-case-converter", "Text Case Converter", { Mode: mode }, output);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Tools
        </Link>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Text Case Converter</h1>
          <p className="text-slate-500 text-sm mb-6">Convert your text to any case format instantly.</p>

          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste your text here..."
            rows={4}
            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none mb-4" />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
            {MODES.map((m) => (
              <button key={m.key} onClick={() => setMode(m.key)}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors text-center truncate ${
                  mode === m.key ? "bg-violet-600 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-violet-50 hover:text-violet-600"
                }`}>{m.label}</button>
            ))}
          </div>

          {input && (
            <>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-3">
                <p className="text-slate-900 text-sm leading-relaxed break-all font-mono">{output}</p>
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
