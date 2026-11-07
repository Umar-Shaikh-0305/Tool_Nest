"use client";
import { useState } from "react";
import { FileText, Upload, Download, AlertCircle, CheckCircle } from "lucide-react";
import { saveUserHistoryItem } from "@/lib/auth";
import ProcessingModal from "@/components/ProcessingModal";

function extractTextFromDocx(buffer: ArrayBuffer): string {
  try {
    // DOCX files are ZIP archives containing XML. We search for readable text patterns.
    const bytes = new Uint8Array(buffer);
    let str = "";
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] >= 32 && bytes[i] < 127) {
        str += String.fromCharCode(bytes[i]);
      } else {
        str += " ";
      }
    }
    // Extract text between XML tags like <w:t>content</w:t>
    const matches = str.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) ?? [];
    const extracted = matches
      .map((m) => m.replace(/<[^>]+>/g, "").trim())
      .filter((t) => t.length > 0)
      .join(" ");
    return extracted || "Could not extract readable text from this document.";
  } catch {
    return "Error reading document content.";
  }
}

export default function WordToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewText, setPreviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [done, setDone] = useState(false);

  const handleFile = async (f: File) => {
    setFile(f);
    setDone(false);
    setLoading(true);
    setPreviewText("");
    try {
      const buffer = await f.arrayBuffer();
      const text = extractTextFromDocx(buffer);
      setPreviewText(text);
    } catch (e) {
      setPreviewText("Could not read file.");
    }
    setLoading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleConvert = async () => {
    if (!file || !previewText) return;
    setConverting(true);
    const startTime = Date.now();
    try {
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 11;
      const margin = 50;
      const lineHeight = fontSize * 1.4;

      const words = previewText.split(/\s+/);
      const pageWidth = 595;
      const pageHeight = 842;
      const maxWidth = pageWidth - margin * 2;

      let lines: string[] = [];
      let currentLine = "";

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);
        if (testWidth > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);

      let y = pageHeight - margin;
      let page = pdfDoc.addPage([pageWidth, pageHeight]);

      for (const line of lines) {
        if (y < margin + lineHeight) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
        }
        page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
        y -= lineHeight;
      }

      const elapsed = Date.now() - startTime;
      if (elapsed < 2500) {
        await new Promise((r) => setTimeout(r, 2500 - elapsed));
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.(doc|docx)$/i, "") + ".pdf";
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
      saveUserHistoryItem({
        toolId: "word-to-pdf",
        toolName: "Word to PDF",
        summary: `Converted ${file.name} to PDF`,
        timestamp: new Date().toISOString(),
      });
    } catch (e) { console.error(e); }
    setConverting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <ProcessingModal
        isOpen={converting}
        title="Converting WORD to PDF..."
        subtitle="Formatting pages, margins, typography and generating PDF document..."
        color="violet"
      />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <a href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-violet-600 mb-8 text-sm font-medium transition-colors">
          ← Back to Tools
        </a>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mb-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Word to PDF</h1>
              <p className="text-slate-500 text-sm">Convert Word documents to PDF format</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-amber-800 text-sm">
            <strong>Demo Mode:</strong> Full formatting preservation requires a server-side engine. Text content is extracted and placed in PDF.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <label
            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-violet-200 rounded-2xl cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-all"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <Upload className="w-8 h-8 text-violet-400 mb-2" />
            <span className="text-slate-600 font-medium">Drop Word document here or click to upload</span>
            <span className="text-slate-400 text-sm mt-1">Accepted: .doc, .docx</span>
            <input type="file" className="hidden" accept=".doc,.docx" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </label>

          {file && (
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
              <FileText className="w-4 h-4 text-violet-500" />
              <span>{file.name}</span>
              <span className="text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}

          {loading && (
            <div className="mt-6 flex items-center gap-3 text-violet-600">
              <div className="w-5 h-5 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
              <span className="text-sm font-medium">Reading document...</span>
            </div>
          )}

          {previewText && !loading && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Extracted Text Preview</h3>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 h-56 overflow-y-auto text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {previewText}
              </div>
              <button
                onClick={handleConvert}
                disabled={converting}
                className="mt-4 inline-flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:opacity-60"
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
