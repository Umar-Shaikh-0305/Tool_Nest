"use client";
import { useState } from "react";
import { Monitor, Upload, Download, AlertCircle, CheckCircle } from "lucide-react";
import { saveUserHistoryItem } from "@/lib/auth";

function extractTextFromPptx(buffer: ArrayBuffer): { slides: string[] } {
  try {
    const bytes = new Uint8Array(buffer);
    let str = "";
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] >= 32 && bytes[i] < 127) str += String.fromCharCode(bytes[i]);
      else str += " ";
    }
    // Extract text between <a:t> tags (PPTX uses DrawingML)
    const matches = str.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) ?? [];
    const texts = matches.map((m) => m.replace(/<[^>]+>/g, "").trim()).filter((t) => t.length > 1);

    if (texts.length === 0) return { slides: ["Could not extract text from this presentation."] };

    // Group texts into simulated slides (every ~5 text chunks = one slide)
    const chunkSize = Math.max(3, Math.ceil(texts.length / 10));
    const slides: string[] = [];
    for (let i = 0; i < texts.length; i += chunkSize) {
      slides.push(texts.slice(i, i + chunkSize).join(" "));
    }
    return { slides };
  } catch {
    return { slides: ["Error reading presentation content."] };
  }
}

export default function PowerPointToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [slides, setSlides] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [done, setDone] = useState(false);

  const handleFile = async (f: File) => {
    setFile(f);
    setDone(false);
    setLoading(true);
    setSlides([]);
    try {
      const buffer = await f.arrayBuffer();
      const { slides: extracted } = extractTextFromPptx(buffer);
      setSlides(extracted);
    } catch (e) {
      setSlides(["Could not read file."]);
    }
    setLoading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleConvert = async () => {
    if (!file || slides.length === 0) return;
    setConverting(true);
    try {
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();
      const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const pageWidth = 792; // landscape
      const pageHeight = 612;
      const margin = 50;

      slides.forEach((slideText, idx) => {
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        // Draw slide header background
        page.drawRectangle({ x: 0, y: pageHeight - 80, width: pageWidth, height: 80, color: rgb(0.48, 0.23, 0.93) });
        page.drawText(`Slide ${idx + 1}`, {
          x: margin,
          y: pageHeight - 52,
          size: 20,
          font: titleFont,
          color: rgb(1, 1, 1),
        });

        // Body text
        const fontSize = 13;
        const lineHeight = fontSize * 1.5;
        const words = slideText.split(/\s+/);
        const maxWidth = pageWidth - margin * 2;
        let lines: string[] = [];
        let cur = "";
        for (const word of words) {
          const test = cur ? `${cur} ${word}` : word;
          if (bodyFont.widthOfTextAtSize(test, fontSize) > maxWidth && cur) {
            lines.push(cur);
            cur = word;
          } else {
            cur = test;
          }
        }
        if (cur) lines.push(cur);

        let y = pageHeight - 100;
        for (const line of lines) {
          if (y < margin) break;
          page.drawText(line, { x: margin, y, size: fontSize, font: bodyFont, color: rgb(0.1, 0.1, 0.1) });
          y -= lineHeight;
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.(ppt|pptx)$/i, "") + ".pdf";
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
      saveUserHistoryItem({
        toolId: "powerpoint-to-pdf",
        toolName: "PowerPoint to PDF",
        summary: `Converted ${file.name} to PDF (${slides.length} slides)`,
        timestamp: new Date().toISOString(),
      });
    } catch (e) { console.error(e); }
    setConverting(false);
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
              <Monitor className="w-7 h-7 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">PowerPoint to PDF</h1>
              <p className="text-slate-500 text-sm">Convert PowerPoint presentations to PDF format</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-amber-800 text-sm">
            <strong>Demo Mode:</strong> Full formatting and slide rendering requires a server-side engine. Text content is extracted and placed in a PDF.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <label
            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-violet-200 rounded-2xl cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-all"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <Upload className="w-8 h-8 text-violet-400 mb-2" />
            <span className="text-slate-600 font-medium">Drop presentation here or click to upload</span>
            <span className="text-slate-400 text-sm mt-1">Accepted: .ppt, .pptx</span>
            <input type="file" className="hidden" accept=".ppt,.pptx" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </label>

          {file && (
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
              <Monitor className="w-4 h-4 text-violet-500" />
              <span>{file.name}</span>
            </div>
          )}

          {loading && (
            <div className="mt-6 flex items-center gap-3 text-violet-600">
              <div className="w-5 h-5 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
              <span className="text-sm font-medium">Reading presentation...</span>
            </div>
          )}

          {slides.length > 0 && !loading && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Slide Preview ({slides.length} slides)</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 mb-4">
                {slides.map((s, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-3">
                    <div className="bg-violet-600 text-white text-xs font-bold px-2 py-1 rounded-lg shrink-0">
                      Slide {i + 1}
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">{s}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={handleConvert}
                disabled={converting}
                className="inline-flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:opacity-60"
              >
                {converting ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Converting...</>
                ) : (
                  <><Download className="w-4 h-4" /> Convert &amp; Download PDF</>
                )}
              </button>
              {done && (
                <div className="mt-3 flex items-center gap-2 text-green-600 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" /> PDF downloaded!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
