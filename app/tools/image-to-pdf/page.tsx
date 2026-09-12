"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Upload,
  ArrowLeft,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Sliders,
  FileDown,
  Trash2,
  MoveUp,
  MoveDown,
  Check,
  Crop,
  Layers,
  Sparkles,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { downloadTextReport } from "@/lib/export-utils";

interface ImageItem {
  id: string;
  name: string;
  originalSrc: string;
  currentSrc: string;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  filter: "none" | "grayscale" | "sepia" | "invert";
}

export default function ImageToPdfPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<"a4" | "letter" | "fit">("a4");
  const [orientation, setOrientation] = useState<"p" | "l">("p");
  const [marginSize, setMarginSize] = useState<number>(10);
  const [isExporting, setIsExporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check if a file was passed via Universal Import
  useEffect(() => {
    try {
      const pendingData = sessionStorage.getItem("toolnest_pending_file_data");
      const pendingName = sessionStorage.getItem("toolnest_pending_file_name");
      if (pendingData) {
        addImage(pendingData, pendingName || "imported-image.png");
        sessionStorage.removeItem("toolnest_pending_file_data");
        sessionStorage.removeItem("toolnest_pending_file_name");
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const addImage = (src: string, name: string) => {
    const newItem: ImageItem = {
      id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name,
      originalSrc: src,
      currentSrc: src,
      rotation: 0,
      flipH: false,
      flipV: false,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      filter: "none",
    };
    setImages((prev) => [...prev, newItem]);
    if (images.length === 0) {
      setSelectedIndex(0);
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            addImage(e.target.result as string, file.name);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const currentItem = images[selectedIndex];

  // Re-render canvas when editing properties of current item change
  useEffect(() => {
    if (!currentItem) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = currentItem.originalSrc;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const isRotated90 = currentItem.rotation % 180 !== 0;
      canvas.width = isRotated90 ? img.height : img.width;
      canvas.height = isRotated90 ? img.width : img.height;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Center for rotation
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((currentItem.rotation * Math.PI) / 180);
      ctx.scale(currentItem.flipH ? -1 : 1, currentItem.flipV ? -1 : 1);

      // Filters
      let filterString = `brightness(${currentItem.brightness}%) contrast(${currentItem.contrast}%) saturate(${currentItem.saturation}%)`;
      if (currentItem.blur > 0) {
        filterString += ` blur(${currentItem.blur}px)`;
      }
      if (currentItem.filter === "grayscale") filterString += " grayscale(100%)";
      if (currentItem.filter === "sepia") filterString += " sepia(100%)";
      if (currentItem.filter === "invert") filterString += " invert(100%)";

      ctx.filter = filterString;
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      // Update currentSrc for PDF export
      const renderedData = canvas.toDataURL("image/jpeg", 0.92);
      setImages((prev) =>
        prev.map((item, idx) =>
          idx === selectedIndex ? { ...item, currentSrc: renderedData } : item
        )
      );
    };
  }, [
    currentItem?.rotation,
    currentItem?.flipH,
    currentItem?.flipV,
    currentItem?.brightness,
    currentItem?.contrast,
    currentItem?.saturation,
    currentItem?.blur,
    currentItem?.filter,
    selectedIndex,
  ]);

  const updateCurrent = (patch: Partial<ImageItem>) => {
    setImages((prev) =>
      prev.map((item, idx) => (idx === selectedIndex ? { ...item, ...patch } : item))
    );
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (selectedIndex >= index && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= images.length) return;
    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
    setSelectedIndex(target);
  };

  // Generate PDF client-side using jsPDF
  const handleGeneratePdf = async () => {
    if (images.length === 0) return;
    setIsExporting(true);

    try {
      const doc = new jsPDF({
        orientation: orientation === "p" ? "portrait" : "landscape",
        unit: "mm",
        format: pageSize === "fit" ? "a4" : pageSize,
      });

      for (let i = 0; i < images.length; i++) {
        if (i > 0) {
          doc.addPage(pageSize === "fit" ? "a4" : pageSize, orientation === "p" ? "portrait" : "landscape");
        }

        const imgData = images[i].currentSrc;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        const availWidth = pageWidth - marginSize * 2;
        const availHeight = pageHeight - marginSize * 2;

        doc.addImage(
          imgData,
          "JPEG",
          marginSize,
          marginSize,
          availWidth,
          availHeight,
          undefined,
          "FAST"
        );
      }

        doc.save(`toolnest-pdf-${new Date().toISOString().slice(0, 10)}-${Date.now()}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF", err);
      alert("An error occurred while building the PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveSpec = () => {
    const fileList = images.map((img, i) => `#${i + 1} - ${img.name} (rot: ${img.rotation}°, filter: ${img.filter})`).join("\n");
    downloadTextReport(
      "image-to-pdf-spec",
      "Image to PDF Studio",
      {
        "Total Pages": images.length,
        "Page Format": pageSize.toUpperCase(),
        "Page Orientation": orientation === "p" ? "Portrait" : "Landscape",
        "Margins": `${marginSize} mm`,
        "Rendering Engine": "HTML5 Canvas + jsPDF",
        "Export Date": new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        "Export Time": new Date().toLocaleTimeString("en-US"),
      },
      fileList ? `IMAGE SEQUENCE SPECIFICATION:\n${fileList}` : undefined
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header Bar */}
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
            Image to PDF Studio
          </h1>
          <p className="font-mono text-xs text-slate-800 dark:text-slate-300 font-medium">
            Multi-image canvas workstation with custom filters, rotation, and client-side jsPDF compilation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSaveSpec}
            disabled={images.length === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border-2 border-signal bg-paper dark:bg-ink text-slate-950 dark:text-paper font-mono font-bold text-xs shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-signal/10"
            title="Download PDF compilation spec sheet with timestamp"
          >
            <FileDown className="w-4 h-4 text-signal" />
            <span>SAVE / DOWNLOAD SPEC</span>
          </button>

          {/* Generate PDF Action */}
          <button
            onClick={handleGeneratePdf}
            disabled={images.length === 0 || isExporting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-signal hover:bg-signal-hover text-slate-950 font-mono font-bold text-xs shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <FileDown className="w-4 h-4" />
            <span>{isExporting ? "COMPILING PDF..." : `GENERATE PDF (${images.length} PAGES)`}</span>
          </button>
        </div>
      </div>

      {/* Main Content Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Queue & Upload */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 rounded-lg border border-graphite/30 bg-card-bg">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs font-semibold text-ink dark:text-paper">
                IMAGE QUEUE ({images.length})
              </span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-mono text-signal hover:underline"
              >
                + Add Images
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFiles(e.target.files)}
              multiple
              accept="image/*"
              className="hidden"
            />

            {images.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 border-2 border-dashed border-graphite/30 hover:border-signal rounded-lg text-center cursor-pointer transition-colors"
              >
                <Upload className="w-8 h-8 text-graphite mx-auto mb-2 opacity-60" />
                <p className="font-mono text-xs text-ink dark:text-paper">Upload images</p>
                <p className="font-mono text-[10px] text-graphite">JPG, PNG, WEBP</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {images.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedIndex(idx)}
                    className={`p-2 rounded border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                      idx === selectedIndex
                        ? "border-signal bg-signal/10"
                        : "border-graphite/20 hover:border-graphite/50 bg-card-bg"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[10px] text-graphite w-4">
                        #{idx + 1}
                      </span>
                      <img
                        src={item.currentSrc}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded border border-graphite/20"
                      />
                      <span className="font-mono text-xs truncate max-w-[90px] text-ink dark:text-paper">
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveImage(idx, "up");
                        }}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-graphite/10 disabled:opacity-20 text-graphite"
                      >
                        <MoveUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveImage(idx, "down");
                        }}
                        disabled={idx === images.length - 1}
                        className="p-1 rounded hover:bg-graphite/10 disabled:opacity-20 text-graphite"
                      >
                        <MoveDown className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(idx);
                        }}
                        className="p-1 rounded hover:bg-red-500/10 text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PDF Page Setup Options */}
          <div className="p-4 rounded-lg border border-graphite/30 bg-card-bg space-y-3 font-mono text-xs">
            <span className="font-semibold block text-ink dark:text-paper">
              PDF FORMAT SETTINGS
            </span>

            <div>
              <label className="text-[10px] text-graphite block mb-1">PAGE SIZE</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as any)}
                className="w-full bg-paper dark:bg-ink border border-graphite/30 rounded px-2 py-1.5 focus:border-signal outline-none"
              >
                <option value="a4">A4 (210 x 297 mm)</option>
                <option value="letter">US Letter (8.5 x 11 in)</option>
                <option value="fit">Auto-Fit Content</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-graphite block mb-1">ORIENTATION</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrientation("p")}
                  className={`py-1 rounded border text-center ${
                    orientation === "p"
                      ? "border-signal bg-signal/15 text-signal font-bold"
                      : "border-graphite/30"
                  }`}
                >
                  Portrait
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation("l")}
                  className={`py-1 rounded border text-center ${
                    orientation === "l"
                      ? "border-signal bg-signal/15 text-signal font-bold"
                      : "border-graphite/30"
                  }`}
                >
                  Landscape
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-graphite block mb-1">
                MARGINS ({marginSize}mm)
              </label>
              <input
                type="range"
                min="0"
                max="30"
                value={marginSize}
                onChange={(e) => setMarginSize(Number(e.target.value))}
                className="w-full accent-signal"
              />
            </div>
          </div>
        </div>

        {/* Center Canvas Viewport */}
        <div className="lg:col-span-6 p-4 rounded-lg border border-graphite/30 bg-card-bg flex flex-col items-center justify-center min-h-[460px] bg-graph-grid">
          {currentItem ? (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-2">
              <div className="max-w-full max-h-[480px] overflow-auto border border-graphite/30 rounded p-2 bg-paper dark:bg-ink shadow-inner">
                <canvas ref={canvasRef} className="max-w-full max-h-[440px] object-contain" />
              </div>
              <p className="font-mono text-[11px] text-graphite">
                Preview: {currentItem.name} · {currentItem.rotation}°
              </p>
            </div>
          ) : (
            <div className="text-center p-8 space-y-2">
              <Layers className="w-12 h-12 text-graphite mx-auto opacity-40" />
              <p className="font-display font-medium text-ink dark:text-paper">
                No image selected
              </p>
              <p className="font-mono text-xs text-graphite">
                Add an image on the left to activate the canvas editor.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Per-Image Canvas Controls */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 rounded-lg border border-graphite/30 bg-card-bg space-y-4 font-mono text-xs">
            <span className="font-semibold block text-ink dark:text-paper">
              CANVAS ADJUSTMENTS
            </span>

            {currentItem ? (
              <>
                {/* Transform Controls */}
                <div className="space-y-2">
                  <label className="text-[10px] text-white block">TRANSFORMS</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        updateCurrent({ rotation: (currentItem.rotation + 90) % 360 })
                      }
                      className="p-1.5 rounded border border-white/30 hover:border-signal flex flex-col items-center gap-1 text-white"
                      title="Rotate 90 deg"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span className="text-[9px]">Rotate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateCurrent({ flipH: !currentItem.flipH })}
                      className={`p-1.5 rounded border flex flex-col items-center gap-1 ${
                        currentItem.flipH ? "border-signal bg-signal/15 text-signal" : "border-white/30 text-white"
                      }`}
                      title="Flip Horizontal"
                    >
                      <FlipHorizontal className="w-3.5 h-3.5" />
                      <span className="text-[9px]">Flip H</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateCurrent({ flipV: !currentItem.flipV })}
                      className={`p-1.5 rounded border flex flex-col items-center gap-1 ${
                        currentItem.flipV ? "border-signal bg-signal/15 text-signal" : "border-white/30 text-white"
                      }`}
                      title="Flip Vertical"
                    >
                      <FlipVertical className="w-3.5 h-3.5" />
                      <span className="text-[9px]">Flip V</span>
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="space-y-2">
                  <label className="text-[10px] text-white block">COLOR FILTER</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["none", "grayscale", "sepia", "invert"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => updateCurrent({ filter: mode })}
                        className={`py-1 px-2 rounded border text-[10px] uppercase text-center ${
                          currentItem.filter === mode
                            ? "border-signal bg-signal/15 text-signal font-bold"
                            : "border-white/30 hover:border-white/60 text-white"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brightness */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-white">
                    <span>BRIGHTNESS</span>
                    <span>{currentItem.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="200"
                    value={currentItem.brightness}
                    onChange={(e) => updateCurrent({ brightness: Number(e.target.value) })}
                    className="w-full accent-signal"
                  />
                </div>

                {/* Contrast */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-white">
                    <span>CONTRAST</span>
                    <span>{currentItem.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="200"
                    value={currentItem.contrast}
                    onChange={(e) => updateCurrent({ contrast: Number(e.target.value) })}
                    className="w-full accent-signal"
                  />
                </div>

                {/* Saturation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-white">
                    <span>SATURATION</span>
                    <span>{currentItem.saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="250"
                    value={currentItem.saturation}
                    onChange={(e) => updateCurrent({ saturation: Number(e.target.value) })}
                    className="w-full accent-signal"
                  />
                </div>

                {/* Blur */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-white">
                    <span>BLUR</span>
                    <span>{currentItem.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={currentItem.blur}
                    onChange={(e) => updateCurrent({ blur: Number(e.target.value) })}
                    className="w-full accent-signal"
                  />
                </div>

                {/* Reset to defaults */}
                <button
                  type="button"
                  onClick={() =>
                    updateCurrent({
                      rotation: 0,
                      flipH: false,
                      flipV: false,
                      brightness: 100,
                      contrast: 100,
                      saturation: 100,
                      blur: 0,
                      filter: "none",
                    })
                  }
                  className="w-full py-1.5 rounded border border-white/30 text-[10px] hover:border-signal text-white hover:text-signal"
                >
                  Reset Adjustments
                </button>
              </>
            ) : (
              <p className="text-white/70 text-[11px]">Select an image to adjust.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
