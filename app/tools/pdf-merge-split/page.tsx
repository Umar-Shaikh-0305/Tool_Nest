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
  Download,
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

      setStatusMessage("Merge complete! Combined PDF downloaded.");
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

      const indicesToExtract = new Set<number>();
      const parts = pageRange.split(",");

      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.includes("-")) {
          const [startStr, endStr] = trimmed.split("-");
          const start = parseInt(startStr, 10);
          const end = parseInt(endStr, 10);
          if (!isNaN(start) && !isNaN(end)) {
            for (let p = Math.max(1, start); p <= Math.min(totalPages, end); p++) {
              indicesToExtract.add(p - 1);
            }
          }
        } else {
          const p = parseInt(trimmed, 10);
          if (!isNaN(p) && p >= 1 && p <= totalPages) {
            indicesToExtract.add(p - 1);
          }
        }
      }

      const sortedIndices = Array.from(indicesToExtract).sort((a, b) => a - b);
      if (sortedIndices.length === 0) {
        alert("Please enter a valid page number range.");
        setIsProcessing(false);
        return;
      }

      const copiedPages = await newDoc.copyPages(sourceDoc, sortedIndices);
      copiedPages.forEach((page) => newDoc.addPage(page));

      const splitBytes = await newDoc.save();
      const blob = new Blob([splitBytes.buffer as ArrayBuffer], { type: "application/pdf" });
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
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tools</span>
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                PDF Merge &amp; Split
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Combine multiple PDFs or extract selected pages in your browser.
              </p>
            </div>

            {/* Tab Selector */}
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                onClick={() => setActiveTab("merge")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "merge"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-violet-600"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Merge</span>
              </button>
              <button
                onClick={() => setActiveTab("split")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "split"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-violet-600"
                }`}
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>Split</span>
              </button>
            </div>
          </div>

          {statusMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
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
                  className="px-4 py-2.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 font-semibold text-xs flex items-center gap-2 transition-colors border border-violet-200"
                >
                  <Upload className="w-4 h-4" />
                  <span>+ Add PDF Files</span>
                </button>

                {mergeList.length > 0 && (
                  <button
                    onClick={handleSaveMergeSpec}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-violet-50 text-slate-700 hover:text-violet-600 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save Report</span>
                  </button>
                )}
              </div>

              {mergeList.length === 0 ? (
                <div
                  onClick={() => mergeInputRef.current?.click()}
                  className="p-12 sm:p-16 rounded-2xl border-2 border-dashed border-slate-200 hover:border-violet-400 bg-slate-50 hover:bg-violet-50/30 text-center cursor-pointer transition-all"
                >
                  <div className="w-16 h-16 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <Layers className="w-8 h-8" />
                  </div>
                  <p className="text-base font-bold text-slate-900 mb-1">
                    Select two or more PDF files to combine
                  </p>
                  <p className="text-xs text-slate-500">
                    Order can be arranged before merging
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {mergeList.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <p className="font-semibold text-sm text-slate-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.pageCount} pages · {(item.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
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
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-20"
                          title="Move up"
                        >
                          <MoveUp className="w-4 h-4" />
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
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-20"
                          title="Move down"
                        >
                          <MoveDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setMergeList(mergeList.filter((_, i) => i !== idx))}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg ml-1"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={executeMerge}
                    disabled={mergeList.length < 2 || isProcessing}
                    className="w-full mt-4 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>{isProcessing ? "Merging PDFs..." : `Merge & Download (${mergeList.length} files)`}</span>
                  </button>
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
                  className="p-12 sm:p-16 rounded-2xl border-2 border-dashed border-slate-200 hover:border-violet-400 bg-slate-50 hover:bg-violet-50/30 text-center cursor-pointer transition-all"
                >
                  <div className="w-16 h-16 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <Scissors className="w-8 h-8" />
                  </div>
                  <p className="text-base font-bold text-slate-900 mb-1">
                    Select a PDF to extract pages
                  </p>
                  <p className="text-xs text-slate-500">
                    Click to browse your device
                  </p>
                </div>
              ) : (
                <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <p className="font-bold text-sm text-slate-900 truncate max-w-xs">{splitFile.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Total Pages: {splitFile.pageCount} · {(splitFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => setSplitFile(null)}
                      className="text-xs text-violet-600 hover:text-violet-800 font-semibold underline"
                    >
                      Change File
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-700 tracking-wider block">
                      Page Range to Extract (e.g. &quot;1-3&quot; or &quot;1, 3, 5&quot;)
                    </label>
                    <input
                      type="text"
                      value={pageRange}
                      onChange={(e) => setPageRange(e.target.value)}
                      placeholder={`1-${splitFile.pageCount}`}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none text-slate-900 font-medium"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={executeSplit}
                      disabled={isProcessing}
                      className="flex-1 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-all"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>{isProcessing ? "Extracting..." : "Extract & Download PDF"}</span>
                    </button>
                    <button
                      onClick={handleSaveSplitSpec}
                      className="px-4 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Save Report</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
