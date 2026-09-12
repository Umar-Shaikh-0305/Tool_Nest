"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, QrCode, FileDown, Copy, Check, Save } from "lucide-react";
import QRCode from "qrcode";
import { downloadTextReport } from "@/lib/export-utils";

export default function QrCodeGeneratorPage() {
  const [text, setText] = useState("https://toolnest.app");
  const [fgColor, setFgColor] = useState("#1F3A5F");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [errorCorrection, setErrorCorrection] = useState<"L" | "M" | "Q" | "H">("M");
  const [dataUrl, setDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!text.trim()) {
      setDataUrl("");
      return;
    }

    QRCode.toDataURL(text, {
      width: 400,
      margin: 2,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      errorCorrectionLevel: errorCorrection,
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error(err));
  }, [text, fgColor, bgColor, errorCorrection]);

  const handleDownloadPng = () => {
    if (!dataUrl) return;
    const now = new Date().toISOString().slice(0, 10);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qrcode-${now}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSaveSpec = () => {
    downloadTextReport(
      "qrcode-spec",
      "QR Code Generator",
      {
        "Payload Content": text,
        "Payload Length": `${text.length} characters`,
        "Error Correction Level": errorCorrection,
        "Foreground Color": fgColor.toUpperCase(),
        "Background Color": bgColor.toUpperCase(),
        "Resolution": "400 x 400 px",
        "Generated Date": new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        "Generated Time": new Date().toLocaleTimeString("en-US"),
      },
      text
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
            QR Code Generator
          </h1>
          <p className="font-mono text-xs text-slate-800 dark:text-slate-300 font-medium">
            Instant vector &amp; raster QR code synthesis with customizable error correction and palette.
          </p>
        </div>

        {dataUrl && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveSpec}
              className="px-3.5 py-2 rounded bg-paper dark:bg-ink border-2 border-signal text-slate-900 dark:text-paper font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-signal/10 transition-colors"
              title="Save date-stamped technical spec sheet"
            >
              <Save className="w-3.5 h-3.5 text-signal" />
              <span>SAVE / DOWNLOAD SPEC</span>
            </button>
            <button
              onClick={handleDownloadPng}
              className="px-4 py-2 rounded bg-signal hover:bg-signal-hover text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <FileDown className="w-4 h-4" />
              <span>DOWNLOAD PNG</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Settings */}
        <div className="md:col-span-6 p-5 rounded-lg border border-graphite/40 bg-card-bg space-y-4 font-mono text-xs shadow-sm">
          <div className="space-y-1">
            <label className="text-slate-900 dark:text-slate-100 font-bold block">ENCODED PAYLOAD / URL</label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter URL, Wi-Fi credentials, or text payload..."
              className="w-full bg-paper dark:bg-ink border border-graphite/40 rounded p-2.5 outline-none focus:border-signal text-slate-900 dark:text-paper text-xs font-semibold"
            />
          </div>

          {/* Palette Colors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-800 dark:text-slate-200 font-bold block mb-1">FOREGROUND</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-8 h-8 rounded border border-graphite/40 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{fgColor.toUpperCase()}</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-800 dark:text-slate-200 font-bold block mb-1">BACKGROUND</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded border border-graphite/40 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{bgColor.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Error Correction */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-800 dark:text-slate-200 font-bold block">ERROR CORRECTION LEVEL</label>
            <div className="grid grid-cols-4 gap-2">
              {(["L", "M", "Q", "H"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setErrorCorrection(lvl)}
                  className={`py-1.5 rounded border text-center font-bold ${
                    errorCorrection === lvl
                      ? "border-signal bg-signal/20 text-slate-950 dark:text-wire font-extrabold"
                      : "border-graphite/40 text-slate-800 dark:text-slate-200 hover:border-signal"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Viewport */}
        <div className="md:col-span-6 p-6 rounded-lg border border-graphite/30 bg-card-bg bg-graph-grid flex flex-col items-center justify-center min-h-[320px]">
          {dataUrl ? (
            <div className="p-4 bg-white rounded-lg shadow-md border border-graphite/20">
              <img src={dataUrl} alt="QR Code Preview" className="w-56 h-56" />
            </div>
          ) : (
            <p className="font-mono text-xs text-graphite">Enter payload to render QR</p>
          )}
        </div>
      </div>
    </div>
  );
}
