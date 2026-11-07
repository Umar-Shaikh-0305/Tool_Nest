"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, FileDown, Scissors, RefreshCw, Wand2, Save } from "lucide-react";
import { downloadTextReport } from "@/lib/export-utils";

export default function BackgroundRemoverPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [tolerance, setTolerance] = useState<number>(30);
  const [targetColor, setTargetColor] = useState<string>("#FFFFFF");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImageSrc(src);
      setProcessedUrl(null);
      processRemoval(src, targetColor, tolerance);
    };
    reader.readAsDataURL(file);
  };

  const processRemoval = (src: string, hexColor: string, tol: number) => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    img.onload = () => {
      const canvas = canvasRef.current || document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Parse target hex
      const rTarget = parseInt(hexColor.slice(1, 3), 16);
      const gTarget = parseInt(hexColor.slice(3, 5), 16);
      const bTarget = parseInt(hexColor.slice(5, 7), 16);

      const tolSq = (tol * 2.55) * (tol * 2.55) * 3;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const distSq =
          (r - rTarget) * (r - rTarget) +
          (g - gTarget) * (g - gTarget) +
          (b - bTarget) * (b - bTarget);

        if (distSq <= tolSq) {
          data[i + 3] = 0; // Transparent
        }
      }

      ctx.putImageData(imgData, 0, 0);
      setProcessedUrl(canvas.toDataURL("image/png"));
      setIsProcessing(false);
    };
  };

  const handleDownload = () => {
    if (!processedUrl) return;
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = processedUrl;
    a.download = `transparent-${dateStr}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSaveSpec = () => {
    downloadTextReport(
      "bg-remover-spec",
      "Background Eraser & Cutout",
      {
        "Target Color Key": targetColor.toUpperCase(),
        "Chroma Tolerance": `${tolerance}%`,
        "Output Format": "PNG (32-bit RGBA Transparent Alpha Channel)",
        "Engine": "HTML5 Canvas Direct Pixel Array Segmentation",
        "Executed Date": new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        "Executed Time": new Date().toLocaleTimeString("en-US"),
      }
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-graphite/40 pb-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-800 text-slate-800 hover:text-signal mb-1 transition-colors font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO UTILITY WORKBENCH</span>
          </Link>
          <h1 className="font-display font-extrabold text-2xl text-slate-900 text-slate-900">
            Background Eraser &amp; Cutout
          </h1>
          <p className="font-mono text-xs text-slate-800 text-slate-800 font-medium">
            Client-side pixel chroma &amp; luminance segmentation with zero-latency transparent PNG export.
          </p>
        </div>

        {processedUrl && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveSpec}
              className="px-3.5 py-2 rounded bg-white bg-white border-2 border-signal text-slate-950 text-slate-900 font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-signal/10 transition-colors"
              title="Save date-stamped segmentation spec sheet"
            >
              <Save className="w-3.5 h-3.5 text-signal" />
              <span>SAVE / DOWNLOAD SPEC</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded bg-signal hover:bg-signal-hover text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <FileDown className="w-4 h-4" />
              <span>DOWNLOAD TRANSPARENT PNG</span>
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

      {!imageSrc ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-16 rounded-xl border-2 border-dashed border-graphite/40 hover:border-signal text-center cursor-pointer bg-card-bg/60 transition-colors"
        >
          <Scissors className="w-12 h-12 text-slate-700 text-slate-800 mx-auto mb-3 opacity-60" />
          <p className="font-display font-bold text-base text-slate-900 text-slate-900">
            Drop an image to remove background
          </p>
          <p className="font-mono text-xs text-slate-700 text-slate-800 mt-1 font-medium">Works great on product photos, logos, graphics</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 p-5 rounded-lg border border-graphite/40 bg-card-bg space-y-4 font-mono text-xs shadow-sm">
            <span className="font-extrabold text-slate-900 text-slate-900 block text-sm">COLOR SEGMENTATION</span>

            {/* Target Color */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-900 text-slate-800 font-bold block">REMOVE COLOR</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={targetColor}
                  onChange={(e) => {
                    setTargetColor(e.target.value);
                    if (imageSrc) processRemoval(imageSrc, e.target.value, tolerance);
                  }}
                  className="w-10 h-8 rounded border border-graphite/40 cursor-pointer"
                />
                <span className="font-mono text-xs font-bold text-slate-900 text-slate-800">{targetColor.toUpperCase()}</span>
              </div>
            </div>

            {/* Tolerance */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-900 text-slate-800 font-bold">
                <span>TOLERANCE THRESHOLD</span>
                <span className="text-signal font-extrabold">{tolerance}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                value={tolerance}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setTolerance(val);
                  if (imageSrc) processRemoval(imageSrc, targetColor, val);
                }}
                className="w-full accent-signal cursor-pointer"
              />
            </div>

            <button
              onClick={() => {
                setTargetColor("#FFFFFF");
                setTolerance(30);
                if (imageSrc) processRemoval(imageSrc, "#FFFFFF", 30);
              }}
              className="w-full py-2 rounded border border-graphite/30 hover:border-signal text-slate-700 hover:text-signal"
            >
              Reset to Pure White
            </button>
          </div>

          <div className="lg:col-span-8 p-4 rounded-lg border border-graphite/30 bg-card-bg flex items-center justify-center min-h-[420px] bg-[radial-gradient(#ccc_1px,transparent_1px)] dark:bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px]">
            {processedUrl ? (
              <img
                src={processedUrl}
                alt="Processed Transparent"
                className="max-h-[400px] max-w-full object-contain"
              />
            ) : (
              <div className="flex items-center gap-2 font-mono text-xs text-slate-700">
                <Wand2 className="w-4 h-4 animate-spin text-signal" />
                <span>Isolating subject...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
