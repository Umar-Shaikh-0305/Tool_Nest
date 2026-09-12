"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Binary, Copy, Check, Upload, ArrowRightLeft, AlertCircle, FileDown } from "lucide-react";
import { downloadTextReport } from "@/lib/export-utils";

export default function Base64ConverterPage() {
  const [mode, setMode] = useState<"text" | "file">("text");
  const [direction, setDirection] = useState<"encode" | "decode">("encode");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTextConvert = (val: string, dir: "encode" | "decode") => {
    setInputText(val);
    setError(null);
    if (!val) {
      setOutputText("");
      return;
    }

    try {
      if (dir === "encode") {
        // UTF-8 safe encode
        const encoded = btoa(encodeURIComponent(val).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
        setOutputText(encoded);
      } else {
        // UTF-8 safe decode
        const decoded = decodeURIComponent(Array.prototype.map.call(atob(val), (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
        setOutputText(decoded);
      }
    } catch (err: any) {
      setError(dir === "decode" ? "Invalid Base64 sequence." : "Encoding failed.");
      setOutputText("");
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setOutputText((e.target?.result as string) || "");
      setInputText(`[File: ${file.name}, ${(file.size / 1024).toFixed(1)} KB]`);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownloadOutput = () => {
    if (!outputText) return;

    downloadTextReport(
      direction === "encode" ? "base64-encoded" : "base64-decoded",
      "Base64 Encoder & Decoder",
      {
        "Operation": direction.toUpperCase(),
        "Input Length": `${inputText.length} characters`,
        "Output Length": `${outputText.length} characters`,
      },
      outputText
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
            Base64 Encoder &amp; Decoder
          </h1>
          <p className="font-mono text-xs text-slate-800 dark:text-slate-300 font-medium">
            Bidirectional ASCII binary representation converter for strings and arbitrary binary payloads.
          </p>
        </div>

        {/* Direction Switch */}
        <div className="flex items-center gap-2 p-1 rounded-lg border border-graphite/40 bg-card-bg font-mono text-xs">
          <button
            onClick={() => {
              setDirection("encode");
              handleTextConvert(inputText, "encode");
            }}
            className={`px-3 py-1.5 rounded ${
              direction === "encode"
                ? "bg-blueprint text-paper font-extrabold border border-signal shadow-sm"
                : "text-slate-800 dark:text-slate-200 font-semibold"
            }`}
          >
            ENCODE (Text → Base64)
          </button>
          <button
            onClick={() => {
              setDirection("decode");
              handleTextConvert(inputText, "decode");
            }}
            className={`px-3 py-1.5 rounded ${
              direction === "decode"
                ? "bg-blueprint text-paper font-extrabold border border-signal shadow-sm"
                : "text-slate-800 dark:text-slate-200 font-semibold"
            }`}
          >
            DECODE (Base64 → Text)
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded bg-red-500/10 border border-red-500/30 font-mono text-xs text-red-500 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
        {/* Input */}
        <div className="p-4 rounded-lg border border-graphite/30 bg-card-bg space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-ink dark:text-paper">
              {direction === "encode" ? "INPUT RAW STRING" : "INPUT BASE64 STRING"}
            </span>
            <label className="text-[11px] text-signal hover:underline cursor-pointer flex items-center gap-1">
              <Upload className="w-3 3.5" />
              <span>Or File to DataURL</span>
              <input
                type="file"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            rows={12}
            value={inputText}
            onChange={(e) => handleTextConvert(e.target.value, direction)}
            placeholder={
              direction === "encode"
                ? "Type or paste UTF-8 text to encode..."
                : "Paste valid Base64 string to decode..."
            }
            className="w-full p-3 rounded bg-paper dark:bg-ink text-ink dark:text-paper border border-graphite/30 focus:border-signal outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Output */}
        <div className="p-4 rounded-lg border border-graphite/30 bg-card-bg space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-ink dark:text-paper">
              {direction === "encode" ? "BASE64 RESULT" : "DECODED RESULT"}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadOutput}
                disabled={!outputText}
                className="px-3 py-1 rounded bg-signal hover:bg-signal-hover text-ink font-bold flex items-center gap-1 disabled:opacity-30 transition-colors"
                title="Download output payload as text/spec file"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>SAVE / DOWNLOAD</span>
              </button>
              <button
                onClick={handleCopy}
                disabled={!outputText}
                className="px-3 py-1 rounded border border-graphite/30 hover:border-signal text-graphite hover:text-signal font-bold flex items-center gap-1 disabled:opacity-30 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-wire" /> : <Copy className="w-3.5 h-3.5" />}
                <span>COPY</span>
              </button>
            </div>
          </div>

          <textarea
            rows={12}
            readOnly
            value={outputText}
            placeholder="Result appears here automatically..."
            className="w-full p-3 rounded bg-graphite/5 text-ink dark:text-paper border border-graphite/20 outline-none resize-none leading-relaxed font-bold"
          />
        </div>
      </div>
    </div>
  );
}
