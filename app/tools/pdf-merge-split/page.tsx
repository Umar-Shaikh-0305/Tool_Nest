"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Layers,
  FileDown,
  Trash2,
  MoveUp,
  MoveDown,
  Scissors,
  Check,
  AlertCircle,
  Save,
} from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { downloadTextReport } from "@/lib/export-utils";

interface PdfItem {
  id: string;
  name: string;
  size: number;
  buffer: ArrayBuffer;
  pageCount: number;
}

export default function PdfMergeSplitPage() {
  const [activeTab, setActiveTab] = useState<"merge" | "split">("merge");
  const [mergeList, setMergeList] = useState<PdfItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Split state
  const [splitFile, setSplitFile] = useState<PdfItem | null>(null);
  const [pageRange, setPageRange] = useState<string>("1");

  const mergeInputRef = useRef<HTMLInputElement>(null);
  const splitInputRef = useRef<HTMLInputElement>(null);

  const handleMergeFiles = async (files: FileList | null) => {
    if (!files) return;
    setStatusMessage(null);

    for (const file of Array.from(files)) {
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        try {
          const buffer = await file.arrayBuffer();
          const doc = await PDFDocument.load(buffer);
          const newItem: PdfItem = {
            id: `pdf-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: file.name,
            size: file.size,
            buffer,
            pageCount: doc.getPageCount(),
          };
          setMergeList((prev) => [...prev, newItem]);
        } catch (e) {
          console.error("Failed to load PDF", e);
        }
      }
    }
  };

  const handleSplitFile = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    try {
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer);
      setSplitFile({
        id: `pdf-split-${Date.now()}`,
        name: file.name,
        size: file.size,
        buffer,
        pageCount: doc.getPageCount(),
      });
      setPageRange(`1-${Math.min(doc.getPageCount(), 3)}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveMergeSpec = () => {
    if (mergeList.length === 0) return;
    const totalPages = mergeList.reduce((acc, f) => acc + f.pageCount, 0);
    const totalSizeKb = (mergeList.reduce((acc, f) => acc + f.size, 0) / 1024).toFixed(1);
    const manifest = mergeList.map((f, i) => `${i + 1}. ${f.name} (${f.pageCount} pages, ${(f.size / 1024).toFixed(1)} KB)`).join("\n");

    downloadTextReport(
      "pdf-merge-spec",
      "PDF Merge Document Manifest",
      {
        "Total Documents Combined": mergeList.length,
        "Total Page Count": totalPages,
        "Combined Ingestion Size": `${totalSizeKb} KB`,
        "Engine": "pdf-lib (100% In-Browser Assembly)",
        "Executed Date": new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        "Executed Time": new Date().toLocaleTimeString("en-US"),
      },
      manifest
    );
  };

  const handleSaveSplitSpec = () => {
    if (!splitFile) return;
    downloadTextReport(
      "pdf-split-spec",
      "PDF Split & Extraction Manifest",
      {
        "Source Document": splitFile.name,
        "Original Page Count": splitFile.pageCount,
        "Extracted Page Range": pageRange,
        "Engine": "pdf-lib (In-Browser Page Copy)",
        "Executed Date": new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        "Executed Time": new Date().toLocaleTimeString("en-US"),
      }
    );
  };

  const executeMerge = async () => {
    if (mergeList.length < 2) return;
    setIsProcessing(true);
    setStatusMessage("Combining documents...");

    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of mergeList) {
        const doc = await PDFDocument.load(item.buffer);
        const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `merged-document-${dateStr}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage("Merge complete! PDF document downloaded.");
    } catch (err: any) {
      setStatusMessage(`Merge failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeSplit = async () => {
    if (!splitFile) return;
    setIsProcessing(true);

    try {
      const sourceDoc = await PDFDocument.load(splitFile.buffer);
      const newDoc = await PDFDocument.create();
      const totalPages = sourceDoc.getPageCount();

      // Parse range e.g. "1-3, 5"
      const indicesToExtract = new Set<number>();
      const parts = pageRange.split(",");

      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.includes("-")) {
          const [startStr, endStr] = trimmed.split("-");
          const start = Math.max(1, parseInt(startStr, 10));
          const end = Math.min(totalPages, parseInt(endStr, 10));
          for (let i = start; i <= end; i++) {
            indicesToExtract.add(i - 1);
          }
        } else {
          const single = parseInt(trimmed, 10);
          if (single >= 1 && single <= totalPages) {
            indicesToExtract.add(single - 1);
          }
        }
      }

      const sortedIndices = Array.from(indicesToExtract).sort((a, b) => a - b);
      if (sortedIndices.length === 0) {
        throw new Error("No valid page numbers found in range.");
      }

      const extractedPages = await newDoc.copyPages(sourceDoc, sortedIndices);
      extractedPages.forEach((p) => newDoc.addPage(p));

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `extracted-pages-${dateStr}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage(`Successfully extracted ${sortedIndices.length} page(s) and downloaded PDF.`);
    } catch (err: any) {
      setStatusMessage(`Split failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
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
            PDF Merge &amp; Split
          </h1>
          <p className="font-mono text-xs text-slate-800 dark:text-slate-300 font-medium">
            Client-side PDF page manipulation via pdf-lib. No documents leave your browser.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 p-1 rounded-lg border border-graphite/40 bg-card-bg">
          <button
            onClick={() => setActiveTab("merge")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono ${
              activeTab === "merge"
                ? "bg-blueprint text-paper font-extrabold border border-signal shadow-sm"
                : "text-slate-800 dark:text-slate-200 hover:text-signal font-semibold"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>MERGE PDFS</span>
          </button>
          <button
            onClick={() => setActiveTab("split")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono ${
              activeTab === "split"
                ? "bg-blueprint text-paper font-extrabold border border-signal shadow-sm"
                : "text-slate-800 dark:text-slate-200 hover:text-signal font-semibold"
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>SPLIT / EXTRACT</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded bg-blueprint/15 border border-blueprint/40 text-xs font-mono text-blueprint-900 dark:text-wire flex items-center gap-2 font-bold">
          <Check className="w-4 h-4 text-wire" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* MERGE TAB */}
      {activeTab === "merge" ? (
        <div className="space-y-4">
          <input
            type="file"
            ref={mergeInputRef}
            onChange={(e) => handleMergeFiles(e.target.files)}
            multiple
            accept="application/pdf"
            className="hidden"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => mergeInputRef.current?.click()}
              className="px-4 py-2 rounded border border-graphite/40 hover:border-signal text-xs font-mono text-slate-900 dark:text-paper hover:text-signal flex items-center gap-2 transition-colors font-bold bg-card-bg"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>+ ADD PDF DOCUMENTS</span>
            </button>

            <div className="flex items-center gap-2">
              {mergeList.length > 0 && (
                <button
                  onClick={handleSaveMergeSpec}
                  className="px-4 py-2 rounded bg-paper dark:bg-ink border-2 border-signal text-slate-950 dark:text-paper font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-signal/10"
                  title="Save date-stamped document manifest"
                >
                  <Save className="w-3.5 h-3.5 text-signal" />
                  <span>SAVE SPEC</span>
                </button>
              )}
              <button
                onClick={executeMerge}
                disabled={mergeList.length < 2 || isProcessing}
                className="px-5 py-2 rounded bg-signal hover:bg-signal-hover text-slate-950 font-mono font-bold text-xs flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors"
              >
                <FileDown className="w-4 h-4" />
                <span>{isProcessing ? "MERGING..." : `MERGE & DOWNLOAD (${mergeList.length} FILES)`}</span>
              </button>
            </div>
          </div>

          {mergeList.length === 0 ? (
            <div
              onClick={() => mergeInputRef.current?.click()}
              className="p-12 rounded-lg border-2 border-dashed border-graphite/40 hover:border-signal text-center cursor-pointer bg-card-bg/60 transition-colors"
            >
              <Layers className="w-10 h-10 text-slate-700 dark:text-slate-300 mx-auto mb-2 opacity-60" />
              <p className="font-display text-sm font-bold text-slate-900 dark:text-paper">
                Drop two or more PDF files here to merge
              </p>
              <p className="font-mono text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
                Order will be preserved in the exported document
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {mergeList.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border border-graphite/40 bg-card-bg flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-slate-800 dark:text-slate-200 font-extrabold w-6">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-mono text-xs text-slate-900 dark:text-paper font-bold">
                        {item.name}
                      </p>
                      <p className="font-mono text-[11px] text-slate-800 dark:text-slate-300 font-medium">
                        {item.pageCount} pages · {(item.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        if (idx === 0) return;
                        const copy = [...mergeList];
                        const t = copy[idx];
                        copy[idx] = copy[idx - 1];
                        copy[idx - 1] = t;
                        setMergeList(copy);
                      }}
                      disabled={idx === 0}
                      className="p-1 rounded text-slate-800 dark:text-slate-200 hover:text-signal disabled:opacity-20"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (idx === mergeList.length - 1) return;
                        const copy = [...mergeList];
                        const t = copy[idx];
                        copy[idx] = copy[idx + 1];
                        copy[idx + 1] = t;
                        setMergeList(copy);
                      }}
                      disabled={idx === mergeList.length - 1}
                      className="p-1 rounded text-slate-800 dark:text-slate-200 hover:text-signal disabled:opacity-20"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setMergeList(mergeList.filter((_, i) => i !== idx))}
                      className="p-1 rounded text-red-500 hover:bg-red-500/10 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* SPLIT TAB */
        <div className="space-y-4">
          <input
            type="file"
            ref={splitInputRef}
            onChange={(e) => handleSplitFile(e.target.files)}
            accept="application/pdf"
            className="hidden"
          />

          {!splitFile ? (
            <div
              onClick={() => splitInputRef.current?.click()}
              className="p-12 rounded-lg border-2 border-dashed border-graphite/40 hover:border-signal text-center cursor-pointer bg-card-bg/60 transition-colors"
            >
              <Scissors className="w-10 h-10 text-slate-700 dark:text-slate-300 mx-auto mb-2 opacity-60" />
              <p className="font-display text-sm font-bold text-slate-900 dark:text-paper">
                Select a PDF to extract pages
              </p>
              <p className="font-mono text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
                Click or drag a single PDF document
              </p>
            </div>
          ) : (
            <div className="p-6 rounded-lg border border-graphite/40 bg-card-bg space-y-4 font-mono text-xs shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-graphite/20">
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-paper">{splitFile.name}</p>
                  <p className="text-slate-800 dark:text-slate-300 font-medium">
                    Total Pages: {splitFile.pageCount} · {(splitFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={() => setSplitFile(null)}
                  className="text-red-500 hover:underline font-bold"
                >
                  Choose Different File
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-slate-900 dark:text-slate-100 font-bold block">
                  PAGE RANGE TO EXTRACT (e.g. &quot;1-3&quot; or &quot;1, 4, 7-9&quot;)
                </label>
                <input
                  type="text"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  placeholder={`1-${splitFile.pageCount}`}
                  className="w-full bg-paper dark:bg-ink border border-graphite/40 rounded px-3 py-2 text-sm focus:border-signal outline-none font-mono text-slate-900 dark:text-paper font-semibold"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleSaveSplitSpec}
                  className="px-4 py-3 rounded bg-paper dark:bg-ink border-2 border-signal text-slate-950 dark:text-paper font-bold font-mono text-xs shadow-sm flex items-center justify-center gap-2 hover:bg-signal/10 transition-colors"
                >
                  <Save className="w-4 h-4 text-signal" />
                  <span>SAVE SPEC SHEET</span>
                </button>
                <button
                  onClick={executeSplit}
                  disabled={isProcessing}
                  className="flex-1 py-3 rounded bg-signal hover:bg-signal-hover text-slate-950 font-bold font-mono text-xs shadow-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  <span>{isProcessing ? "EXTRACTING PAGES..." : "EXTRACT & DOWNLOAD NEW PDF"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
