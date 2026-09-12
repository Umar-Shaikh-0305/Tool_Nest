"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, FileDown, Sliders, Image as ImageIcon, Save } from "lucide-react";
import { downloadTextReport } from "@/lib/export-utils";

export default function ImageCompressorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(80);
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [compressedDataUrl, setCompressedDataUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    setFile(f);
    setOriginalSize(f.size);

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setPreviewSrc(src);
      compressImage(src, quality, maxWidth);
    };
    reader.readAsDataURL(f);
  };

  const compressImage = (src: string, q: number, maxW: number) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > maxW) {
        height = Math.round((height * maxW) / width);
        width = maxW;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, width, height);

      const outputData = canvas.toDataURL("image/jpeg", q / 100);
      setCompressedDataUrl(outputData);

      // Estimate byte size from Base64
      const base64Length = outputData.length - (outputData.indexOf(",") + 1);
      const byteLength = Math.round((base64Length * 3) / 4);
      setCompressedSize(byteLength);
    };
  };

  useEffect(() => {
    if (previewSrc) {
      compressImage(previewSrc, quality, maxWidth);
    }
  }, [quality, maxWidth]);

  const handleDownload = () => {
    if (!compressedDataUrl) return;
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = compressedDataUrl;
    a.download = `compressed-${dateStr}-${file?.name || "image.jpg"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSaveSpec = () => {
    if (!file) return;
    const origKb = (originalSize / 1024).toFixed(1);
    const compKb = (compressedSize / 1024).toFixed(1);
    const reduction = originalSize > 0 ? `${(((originalSize - compressedSize) / originalSize) * 100).toFixed(1)}%` : "0%";

    downloadTextReport(
      "image-compress-spec",
      "Image Compressor & Resizer",
      {
        "Source File": file.name,
        "Original Byte Size": `${origKb} KB (${originalSize} bytes)`,
        "Compressed Byte Size": `${compKb} KB (${compressedSize} bytes)`,
        "Compression Ratio / Saved": reduction,
        "Quality Parameter": `${quality}%`,
        "Max Dimension Bound": `${maxWidth} px`,
        "Processed Date": new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        "Processed Time": new Date().toLocaleTimeString("en-US"),
      }
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
            Image Compressor &amp; Resizer
          </h1>
          <p className="font-mono text-xs text-slate-800 dark:text-slate-300 font-medium">
            Real-time HTML5 Canvas compression, quality tuning, and dimensional downscaling.
          </p>
        </div>

        {compressedDataUrl && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveSpec}
              className="px-3.5 py-2 rounded bg-paper dark:bg-ink border-2 border-signal text-slate-950 dark:text-paper font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-signal/10 transition-colors"
              title="Save date-stamped compression spec sheet"
            >
              <Save className="w-3.5 h-3.5 text-signal" />
              <span>SAVE / DOWNLOAD SPEC</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded bg-signal hover:bg-signal-hover text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <FileDown className="w-4 h-4" />
              <span>DOWNLOAD OPTIMIZED</span>
            </button>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleSelect(e.target.files)}
        accept="image/*"
        className="hidden"
      />

      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-16 rounded-xl border-2 border-dashed border-graphite/40 hover:border-signal text-center cursor-pointer bg-card-bg/60 transition-colors"
        >
          <Upload className="w-12 h-12 text-slate-700 dark:text-slate-300 mx-auto mb-3 opacity-60" />
          <p className="font-display font-bold text-base text-slate-900 dark:text-paper">
            Drop an image here to compress
          </p>
          <p className="font-mono text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">Supports JPEG, PNG, WEBP</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-5 p-5 rounded-lg border border-graphite/40 bg-card-bg space-y-4 font-mono text-xs shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-graphite/20">
              <span className="font-bold text-slate-900 dark:text-paper truncate max-w-[200px]">
                {file.name}
              </span>
              <button
                onClick={() => {
                  setFile(null);
                  setPreviewSrc(null);
                }}
                className="text-red-500 hover:underline font-bold"
              >
                Change
              </button>
            </div>

            {/* Metrics Comparison */}
            <div className="p-3 rounded bg-graphite/10 border border-graphite/30 space-y-1.5 font-bold">
              <div className="flex justify-between text-slate-800 dark:text-slate-200">
                <span>Original Size:</span>
                <span>{(originalSize / 1024).toFixed(1)} KB</span>
              </div>
              <div className="flex justify-between font-extrabold text-signal">
                <span>Compressed Size:</span>
                <span>{(compressedSize / 1024).toFixed(1)} KB</span>
              </div>
              <div className="flex justify-between text-wire font-extrabold pt-1 border-t border-graphite/20">
                <span>Saved / Reduction:</span>
                <span>
                  {originalSize > 0
                    ? `${(((originalSize - compressedSize) / originalSize) * 100).toFixed(1)}%`
                    : "0%"}
                </span>
              </div>
            </div>

            {/* Quality Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-900 dark:text-slate-100 font-bold">
                <span>COMPRESSION QUALITY</span>
                <span className="text-signal font-extrabold">{quality}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-signal cursor-pointer"
              />
            </div>

            {/* Max Width */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-900 dark:text-slate-100 font-bold">
                <span>MAX DIMENSION BOUND</span>
                <span className="text-signal font-extrabold">{maxWidth}px</span>
              </div>
              <input
                type="range"
                min="320"
                max="3840"
                step="80"
                value={maxWidth}
                onChange={(e) => setMaxWidth(Number(e.target.value))}
                className="w-full accent-signal cursor-pointer"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-7 p-4 rounded-lg border border-graphite/30 bg-card-bg bg-graph-grid flex items-center justify-center min-h-[400px]">
            {compressedDataUrl && (
              <img
                src={compressedDataUrl}
                alt="Compressed preview"
                className="max-h-[380px] max-w-full object-contain rounded shadow"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
