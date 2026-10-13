"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, FileDown, Check, ShieldCheck, Download, Trash2 } from "lucide-react";
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
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
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
                PDF Compressor
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Reduce PDF file size in your browser without any server upload.
              </p>
            </div>
            {file && (
              <button
                onClick={handleSaveSpec}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-violet-50 text-slate-700 hover:text-violet-600 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Report</span>
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
              className="p-12 sm:p-16 rounded-2xl border-2 border-dashed border-slate-200 hover:border-violet-400 bg-slate-50 hover:bg-violet-50/30 text-center cursor-pointer transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Upload className="w-8 h-8" />
              </div>
              <p className="text-base font-bold text-slate-900 mb-1">
                Choose a PDF file or drag it here
              </p>
              <p className="text-xs text-slate-500">
                100% private in-memory compression via pdf-lib
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-slate-900 truncate max-w-xs">{file.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Original Size: {(originalSize / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setCompressedSize(null);
                    setCompressedBlob(null);
                  }}
                  className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  title="Remove file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {compressedSize !== null && (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <Check className="w-5 h-5 text-emerald-600" />
                    <span>Optimization Complete!</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-white rounded-xl border border-emerald-100">
                      <p className="text-xs text-slate-500">Optimized Size</p>
                      <p className="text-lg font-extrabold text-slate-900">{(compressedSize / 1024).toFixed(1)} KB</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-emerald-100">
                      <p className="text-xs text-slate-500">Size Reduction</p>
                      <p className="text-lg font-extrabold text-emerald-600">
                        {(((originalSize - compressedSize) / originalSize) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleDownload}
                      className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>Download Compressed PDF</span>
                    </button>
                    <button
                      onClick={handleSaveSpec}
                      className="px-4 py-3 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Save Report</span>
                    </button>
                  </div>
                </div>
              )}

              {compressedSize === null && (
                <button
                  onClick={handleCompress}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  <span>{isProcessing ? "Optimizing PDF..." : "Compress PDF"}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
