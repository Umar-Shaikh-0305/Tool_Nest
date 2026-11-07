"use client";
import { useState } from "react";
import { RotateCw, Upload, Download, CheckCircle } from "lucide-react";
import { saveUserHistoryItem } from "@/lib/auth";

type RotateOption = 90 | 180 | 270;

export default function RotatePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [rotation, setRotation] = useState<RotateOption>(90);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

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

  const handleRotate = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const { PDFDocument, degrees } = await import("pdf-lib");
      const ab = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(ab, { ignoreEncryption: true });
      pdfDoc.getPages().forEach((page) => {
        const current = page.getRotation().angle;
        page.setRotation(degrees((current + rotation) % 360));
      });
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(".pdf", "_rotated.pdf");
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
      saveUserHistoryItem({
        toolId: "rotate-pdf",
        toolName: "Rotate PDF",
        summary: `Rotated ${file.name} by ${rotation}°`,
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
              <RotateCw className="w-7 h-7 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Rotate PDF</h1>
              <p className="text-slate-500 text-sm">Rotate PDF pages 90°, 180°, or 270°</p>
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
            <div className="mt-3 text-sm text-slate-600 flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-violet-500" />
              {file.name} · {pageCount} page{pageCount !== 1 ? "s" : ""}
            </div>
          )}

          {file && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Rotation Direction</h3>
              <div className="flex gap-3 flex-wrap">
                {([90, 180, 270] as RotateOption[]).map((deg) => (
                  <button
                    key={deg}
                    onClick={() => setRotation(deg)}
                    className={`flex flex-col items-center gap-2 px-5 py-4 rounded-2xl border-2 font-medium transition-all ${rotation === deg ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-600 hover:border-violet-300"}`}
                  >
                    <RotateCw
                      className="w-6 h-6"
                      style={{
                        transform: deg === 90 ? "none" : deg === 180 ? "scaleY(-1)" : "rotate(180deg) scaleX(-1)",
                      }}
                    />
                    <span className="text-sm">
                      {deg === 90 ? "90° Clockwise" : deg === 180 ? "180°" : "90° Counter-CW"}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleRotate}
                disabled={loading}
                className="mt-6 inline-flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Rotating...</>
                ) : (
                  <><Download className="w-4 h-4" /> Rotate &amp; Download</>
                )}
              </button>
              {done && (
                <div className="mt-3 flex items-center gap-2 text-green-600 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" /> Rotated PDF downloaded!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
