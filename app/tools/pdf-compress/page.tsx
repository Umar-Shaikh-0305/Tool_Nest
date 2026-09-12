"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, FileDown, Check, ShieldCheck, AlertCircle, Save } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { downloadTextReport } from "@/lib/export-utils";

export default function PdfCompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelectFile = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    setFile(f);
    setOriginalSize(f.size);
    setCompressedSize(null);
    setCompressedBlob(null);
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      // Load PDF and re-save with objects streams and cleanup
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const optimizedBytes = await pdfDoc.save({ useObjectStreams: true });

      const blob = new Blob([optimizedBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      setCompressedBlob(blob);
      setCompressedSize(blob.size);
    } catch (err: any) {
      console.error(err);
      alert("Compression error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedBlob) return;
    const url = URL.createObjectURL(compressedBlob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `optimized-${dateStr}-${file?.name || "document.pdf"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveSpec = () => {
    if (!file) return;
    const origKb = (originalSize / 1024).toFixed(1);
    const compKb = compressedSize !== null ? (compressedSize / 1024).toFixed(1) : "Pending";
    const reduction = compressedSize !== null ? `${(((originalSize - compressedSize) / originalSize) * 100).toFixed(1)}%` : "Pending";

    downloadTextReport(
      "pdf-compress-spec",
      "PDF Optimizer & Compressor",
      {
        "File Name": file.name,
        "Original File Size": `${origKb} KB (${originalSize} bytes)`,
        "Optimized File Size": `${compKb} KB (${compressedSize ?? "N/A"} bytes)`,
        "Compression Reduction": reduction,
        "Engine": "pdf-lib Object Stream Linearization",
        "Optimization Date": new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        "Optimization Time": new Date().toLocaleTimeString("en-US"),
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
            PDF Optimizer &amp; Compressor
          </h1>
          <p className="font-mono text-xs text-slate-800 dark:text-slate-300 font-medium">
            Browser-based object stream optimization and redundant element purging without cloud transmission.
          </p>
        </div>

        {file && (
          <button
            onClick={handleSaveSpec}
            className="px-3.5 py-2 rounded bg-paper dark:bg-ink border-2 border-signal text-slate-950 dark:text-paper font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-signal/10 transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-signal" />
            <span>SAVE SPEC</span>
          </button>
        )}
      </div>

      <input
        type="file"
        ref={inputRef}
        onChange={(e) => handleSelectFile(e.target.files)}
        accept="application/pdf"
        className="hidden"
      />

      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="p-16 rounded-xl border-2 border-dashed border-graphite/40 hover:border-signal text-center cursor-pointer bg-card-bg/60 transition-colors"
        >
          <Upload className="w-12 h-12 text-slate-700 dark:text-slate-300 mx-auto mb-3 opacity-60" />
          <p className="font-display font-bold text-base text-slate-900 dark:text-paper">
            Select or drop a PDF file to optimize
          </p>
          <p className="font-mono text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">Processed entirely in-memory</p>
        </div>
      ) : (
        <div className="p-6 rounded-xl border border-graphite/40 bg-card-bg space-y-5 font-mono text-xs shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-graphite/20">
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-paper">{file.name}</p>
              <p className="text-slate-800 dark:text-slate-300 font-medium">Original Size: {(originalSize / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setCompressedSize(null);
              }}
              className="text-red-500 hover:underline font-bold"
            >
              Change File
            </button>
          </div>

          {compressedSize !== null && (
            <div className="p-4 rounded-lg bg-wire/15 border border-wire/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-extrabold text-wire-dark dark:text-wire text-sm">Optimization Complete!</p>
                <p className="text-slate-900 dark:text-slate-100 font-bold mt-1">
                  New Size: {(compressedSize / 1024).toFixed(1)} KB (
                  {(((originalSize - compressedSize) / originalSize) * 100).toFixed(1)}% reduction)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveSpec}
                  className="px-3.5 py-2 rounded bg-paper dark:bg-ink border-2 border-signal text-slate-950 dark:text-paper font-bold font-mono text-xs flex items-center gap-1.5 shadow-sm hover:bg-signal/10"
                >
                  <Save className="w-4 h-4 text-signal" />
                  <span>SAVE SPEC</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 rounded bg-signal hover:bg-signal-hover text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <FileDown className="w-4 h-4" />
                  <span>DOWNLOAD PDF</span>
                </button>
              </div>
            </div>
          )}

          {compressedSize === null && (
            <button
              onClick={handleCompress}
              disabled={isProcessing}
              className="w-full py-3 rounded bg-signal hover:bg-signal-hover text-slate-950 font-bold font-mono text-xs shadow-sm flex items-center justify-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              <span>{isProcessing ? "OPTIMIZING OBJECT STREAMS..." : "OPTIMIZE & COMPRESS PDF"}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
