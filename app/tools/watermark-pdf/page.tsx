"use client";
import { useState } from "react";
import { Stamp, Upload, Download, CheckCircle } from "lucide-react";
import { saveUserHistoryItem } from "@/lib/auth";

const COLOR_OPTIONS = [
  { label: "Gray", r: 0.5, g: 0.5, b: 0.5 },
  { label: "Red", r: 0.8, g: 0.1, b: 0.1 },
  { label: "Blue", r: 0.1, g: 0.2, b: 0.8 },
  { label: "Green", r: 0.1, g: 0.6, b: 0.1 },
];

export default function WatermarkPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.3);
  const [colorIndex, setColorIndex] = useState(0);
  const [rotation, setRotation] = useState(-45);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [pageCount, setPageCount] = useState(0);

  const handleFile = async (f: File) => {
    setFile(f);
    setDone(false);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const ab = await f.arrayBuffer();
      const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
      setPageCount(doc.getPageCount());
    } catch (e) { console.error(e); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type === "application/pdf") handleFile(f);
  };

  const handleApply = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const { PDFDocument, rgb, StandardFonts, degrees } = await import("pdf-lib");
      const ab = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(ab, { ignoreEncryption: true });
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const color = COLOR_OPTIONS[colorIndex];
      const pages = pdfDoc.getPages();
      for (const page of pages) {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        page.drawText(watermarkText, {
          x: width / 2 - textWidth / 2,
          y: height / 2 - fontSize / 2,
          size: fontSize,
          font,
          color: rgb(color.r, color.g, color.b),
          opacity,
          rotate: degrees(rotation),
        });
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(".pdf", "_watermarked.pdf");
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
      saveUserHistoryItem({
        toolId: "watermark-pdf",
        toolName: "Watermark PDF",
        summary: `Added watermark "${watermarkText}" to ${file.name}`,
        timestamp: new Date().toISOString(),
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <a href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-violet-600 mb-8 text-sm font-medium transition-colors">
          ← Back to Tools
        </a>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mb-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center">
              <Stamp className="w-7 h-7 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Watermark PDF</h1>
              <p className="text-slate-500 text-sm">Add a text watermark to every page of your PDF</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <label
            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-violet-200 rounded-2xl cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-all"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <Upload className="w-8 h-8 text-violet-400 mb-2" />
            <span className="text-slate-600 font-medium">Drop PDF here or click to upload</span>
            <span className="text-slate-400 text-sm mt-1">Accepted: .pdf</span>
            <input type="file" className="hidden" accept=".pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </label>

          {file && (
            <div className="mt-2 text-sm text-slate-600 flex items-center gap-2">
              <Stamp className="w-4 h-4 text-violet-500" />
              {file.name} · {pageCount} page{pageCount !== 1 ? "s" : ""}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Watermark Text</label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Color</label>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setColorIndex(i)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${colorIndex === i ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-600 hover:border-violet-300"}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Font Size: {fontSize}px</label>
              <input type="range" min={20} max={80} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-violet-600" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Opacity: {Math.round(opacity * 100)}%</label>
              <input type="range" min={10} max={100} value={Math.round(opacity * 100)} onChange={(e) => setOpacity(Number(e.target.value) / 100)} className="w-full accent-violet-600" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Rotation: {rotation}°</label>
              <input type="range" min={-90} max={90} value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="w-full accent-violet-600" />
            </div>
            <div className="flex items-end">
              <div
                className="w-full h-20 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden"
                style={{ position: "relative" }}
              >
                <span
                  className="font-bold select-none"
                  style={{
                    fontSize: `${Math.min(fontSize * 0.5, 28)}px`,
                    opacity,
                    transform: `rotate(${rotation}deg)`,
                    color: `rgb(${Math.round(COLOR_OPTIONS[colorIndex].r * 255)},${Math.round(COLOR_OPTIONS[colorIndex].g * 255)},${Math.round(COLOR_OPTIONS[colorIndex].b * 255)})`,
                  }}
                >
                  {watermarkText || "Preview"}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleApply}
            disabled={!file || loading}
            className="mt-6 inline-flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Applying...</>
            ) : (
              <><Download className="w-4 h-4" /> Apply Watermark &amp; Download</>
            )}
          </button>
          {done && (
            <div className="mt-3 flex items-center gap-2 text-green-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4" /> Watermarked PDF downloaded!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
