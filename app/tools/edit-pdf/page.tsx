"use client";
import { useState } from "react";
import { Edit3, Upload, Download, CheckCircle, Plus, Trash2 } from "lucide-react";
import { saveUserHistoryItem } from "@/lib/auth";

interface TextAnnotation {
  id: string;
  text: string;
  fontSize: number;
  color: string;
  page: number;
  xPercent: number;
  yPercent: number;
}

const COLORS = [
  { label: "Black", value: "#000000", r: 0, g: 0, b: 0 },
  { label: "Red", value: "#dc2626", r: 0.86, g: 0.15, b: 0.15 },
  { label: "Blue", value: "#1d4ed8", r: 0.11, g: 0.31, b: 0.85 },
  { label: "Green", value: "#16a34a", r: 0.09, g: 0.64, b: 0.29 },
];

export default function EditPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [annotations, setAnnotations] = useState<TextAnnotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Form state
  const [text, setText] = useState("Annotation");
  const [fontSize, setFontSize] = useState(14);
  const [colorIndex, setColorIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [xPercent, setXPercent] = useState(10);
  const [yPercent, setYPercent] = useState(10);

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

  const addAnnotation = () => {
    if (!text.trim()) return;
    setAnnotations((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2), text, fontSize, color: COLORS[colorIndex].value, page, xPercent, yPercent },
    ]);
    setText("Annotation");
  };

  const removeAnnotation = (id: string) => setAnnotations((prev) => prev.filter((a) => a.id !== id));

  const handleApply = async () => {
    if (!file || annotations.length === 0) return;
    setLoading(true);
    try {
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
      const ab = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(ab, { ignoreEncryption: true });
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();

      for (const ann of annotations) {
        const pageIndex = Math.min(ann.page - 1, pages.length - 1);
        const p = pages[pageIndex];
        const { width, height } = p.getSize();
        const c = COLORS.find((col) => col.value === ann.color) ?? COLORS[0];
        p.drawText(ann.text, {
          x: (ann.xPercent / 100) * width,
          y: height - (ann.yPercent / 100) * height,
          size: ann.fontSize,
          font,
          color: rgb(c.r, c.g, c.b),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(".pdf", "_edited.pdf");
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
      saveUserHistoryItem({
        toolId: "edit-pdf",
        toolName: "Edit PDF",
        summary: `Added ${annotations.length} annotation(s) to ${file.name}`,
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
              <Edit3 className="w-7 h-7 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Edit PDF</h1>
              <p className="text-slate-500 text-sm">Add text annotations and highlights to PDF</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">1. Upload PDF</h3>
            <label
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-violet-200 rounded-2xl cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-all"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <Upload className="w-6 h-6 text-violet-400 mb-1" />
              <span className="text-slate-600 font-medium text-sm">Drop PDF or click to upload</span>
              <input type="file" className="hidden" accept=".pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </label>
            {file && <p className="mt-2 text-sm text-slate-600">{file.name} · {pageCount} page{pageCount !== 1 ? "s" : ""}</p>}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">2. Add Text Annotation</h3>
            <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-200">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Text</label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Font Size</label>
                  <input type="number" min={6} max={72} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Page</label>
                  <input type="number" min={1} max={pageCount || 1} value={page} onChange={(e) => setPage(Number(e.target.value))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">X (%): {xPercent}</label>
                  <input type="range" min={0} max={90} value={xPercent} onChange={(e) => setXPercent(Number(e.target.value))} className="w-full accent-violet-600 mt-2" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Y (%): {yPercent}</label>
                  <input type="range" min={0} max={95} value={yPercent} onChange={(e) => setYPercent(Number(e.target.value))} className="w-full accent-violet-600 mt-2" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Color</label>
                <div className="flex gap-2">
                  {COLORS.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setColorIndex(i)}
                      style={{ backgroundColor: c.value }}
                      className={`w-7 h-7 rounded-full border-2 ${colorIndex === i ? "border-violet-500 scale-110" : "border-slate-300"} transition-all`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={addAnnotation}
                disabled={!text.trim()}
                className="flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-violet-200 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" /> Add Annotation
              </button>
            </div>
          </div>

          {annotations.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">3. Annotations ({annotations.length})</h3>
              <div className="space-y-2">
                {annotations.map((ann) => (
                  <div key={ann.id} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
                    <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: ann.color }} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-slate-700 font-medium truncate block">&ldquo;{ann.text}&rdquo;</span>
                      <span className="text-xs text-slate-400">Page {ann.page} · {ann.fontSize}px · ({ann.xPercent}%, {ann.yPercent}%)</span>
                    </div>
                    <button onClick={() => removeAnnotation(ann.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleApply}
            disabled={!file || annotations.length === 0 || loading}
            className="inline-flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Applying...</>
            ) : (
              <><Download className="w-4 h-4" /> Apply Edits &amp; Download</>
            )}
          </button>
          {done && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4" /> Edited PDF downloaded!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
