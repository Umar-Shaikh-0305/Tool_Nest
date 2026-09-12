"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Code2, Copy, Check, FileDown, Trash2, AlertCircle, Save } from "lucide-react";
import { downloadTextReport } from "@/lib/export-utils";

export default function JsonFormatterPage() {
  const [input, setInput] = useState<string>(
    '{"toolnest":{"version":"1.0","infrastructure":"zero-cost","modules":["image-studio","scientific-calc","pdf-tools"]}}'
  );
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const formatJson = (spaces = 2) => {
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed, null, spaces));
      setError(null);
    } catch (err: any) {
      setError(err.message || "Invalid JSON syntax");
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed));
      setError(null);
    } catch (err: any) {
      setError(err.message || "Invalid JSON syntax");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    const blob = new Blob([input], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const now = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `json-formatted-${now}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveSpec = () => {
    let isValid = true;
    let keyCount = 0;
    try {
      const parsed = JSON.parse(input);
      if (typeof parsed === "object" && parsed !== null) {
        keyCount = Object.keys(parsed).length;
      }
    } catch (e) {
      isValid = false;
    }

    const lines = input.split("\n").length;
    const bytes = new Blob([input]).size;

    downloadTextReport(
      "json-spec",
      "JSON Formatter & Validator",
      {
        "Validation Status": isValid ? "VALID (RFC 8259)" : "INVALID SYNTAX",
        "Total Lines": lines,
        "Payload Size": `${bytes} bytes (${(bytes / 1024).toFixed(2)} KB)`,
        "Top-Level Keys": keyCount,
        "Formatted Date": new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        "Formatted Time": new Date().toLocaleTimeString("en-US"),
      },
      input
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
            JSON Formatter &amp; Validator
          </h1>
          <p className="font-mono text-xs text-slate-800 dark:text-slate-300 font-medium">
            Client-side JSON syntax validator, multi-indentation beautifier, and payload compressor.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={() => formatJson(2)}
            className="px-3 py-1.5 rounded border border-graphite/40 hover:border-signal text-slate-900 dark:text-slate-100 font-bold bg-card-bg"
          >
            2 SPACES
          </button>
          <button
            onClick={() => formatJson(4)}
            className="px-3 py-1.5 rounded border border-graphite/40 hover:border-signal text-slate-900 dark:text-slate-100 font-bold bg-card-bg"
          >
            4 SPACES
          </button>
          <button
            onClick={minifyJson}
            className="px-3 py-1.5 rounded border border-graphite/40 hover:border-signal text-slate-900 dark:text-slate-100 font-bold bg-card-bg"
          >
            MINIFY
          </button>
          <button
            onClick={handleSaveSpec}
            className="px-3 py-1.5 rounded border-2 border-signal bg-paper dark:bg-ink text-slate-950 dark:text-paper font-bold flex items-center gap-1.5 shadow-sm hover:bg-signal/10"
            title="Save date-stamped spec sheet"
          >
            <Save className="w-3.5 h-3.5 text-signal" />
            <span>SAVE SPEC</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded bg-signal hover:bg-signal-hover text-slate-950 font-bold flex items-center gap-1.5 shadow-sm"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>DOWNLOAD JSON</span>
          </button>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded border border-graphite/40 hover:border-signal text-slate-900 dark:text-slate-100 font-bold flex items-center gap-1 bg-card-bg"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-wire" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "COPIED" : "COPY"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded bg-red-500/10 border border-red-500/30 font-mono text-xs text-red-500 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="p-4 rounded-lg border border-graphite/40 bg-card-bg shadow-sm">
        <textarea
          rows={18}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            try {
              JSON.parse(e.target.value);
              setError(null);
            } catch (err: any) {
              setError(err.message);
            }
          }}
          placeholder="Paste or write JSON here..."
          className="w-full p-4 rounded bg-paper dark:bg-ink text-slate-900 dark:text-paper font-mono text-xs leading-relaxed outline-none border border-graphite/40 focus:border-signal font-semibold"
        />

        <div className="flex flex-wrap items-center justify-between pt-3 font-mono text-xs text-slate-800 dark:text-slate-200 font-bold gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                error ? "bg-red-500" : "bg-wire"
              }`}
            />
            <span>{error ? "SYNTAX INVALID" : "SYNTAX VALID (RFC 8259)"}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSaveSpec}
              className="text-slate-900 dark:text-paper hover:text-signal flex items-center gap-1.5 font-bold"
            >
              <Save className="w-3.5 h-3.5 text-signal" />
              <span>Save Spec Sheet</span>
            </button>
            <button
              onClick={handleDownload}
              className="text-slate-900 dark:text-paper hover:text-signal flex items-center gap-1.5 font-bold"
            >
              <FileDown className="w-3.5 h-3.5 text-signal" />
              <span>Download JSON</span>
            </button>
            <button
              onClick={() => {
                setInput("");
                setError(null);
              }}
              className="hover:text-red-500 flex items-center gap-1 text-slate-700 dark:text-slate-300 font-bold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
