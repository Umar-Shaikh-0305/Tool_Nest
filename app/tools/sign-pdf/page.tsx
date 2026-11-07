"use client";
import { useState, useRef, useEffect } from "react";
import { PenLine, Upload, Download, CheckCircle, Trash2 } from "lucide-react";
import { saveUserHistoryItem } from "@/lib/auth";

export default function SignPdfPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineColor, setLineColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(3);
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [targetPage, setTargetPage] = useState(1);
  const [xPos, setXPos] = useState(10);
  const [yPos, setYPos] = useState(85);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    lastPos.current = getPos(e, canvas);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || !lastPos.current) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

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
    if (!file || !hasSignature) return;
    setLoading(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const canvas = canvasRef.current!;
      const sigDataUrl = canvas.toDataURL("image/png");
      const sigRes = await fetch(sigDataUrl);
      const sigBlob = await sigRes.blob();
      const sigArrayBuffer = await sigBlob.arrayBuffer();

      const ab = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(ab, { ignoreEncryption: true });
      const sigImage = await pdfDoc.embedPng(sigArrayBuffer);

      const pageIndex = Math.min(targetPage - 1, pdfDoc.getPageCount() - 1);
      const page = pdfDoc.getPage(pageIndex);
      const { width, height } = page.getSize();

      const sigWidth = width * 0.25;
      const sigHeight = (sigImage.height / sigImage.width) * sigWidth;
      const x = (xPos / 100) * width;
      const y = height - (yPos / 100) * height - sigHeight;

      page.drawImage(sigImage, { x, y, width: sigWidth, height: sigHeight });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(".pdf", "_signed.pdf");
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
      saveUserHistoryItem({
        toolId: "sign-pdf",
        toolName: "Sign PDF",
        summary: `Signed ${file.name} on page ${targetPage}`,
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
              <PenLine className="w-7 h-7 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Sign PDF</h1>
              <p className="text-slate-500 text-sm">Draw and embed your signature into a PDF document</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6">
          {/* PDF Upload */}
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

          {/* Signature Pad */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">2. Draw Your Signature</h3>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500">Color:</label>
                {["#000000", "#1d4ed8", "#dc2626"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setLineColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-full border-2 ${lineColor === c ? "border-violet-500 scale-110" : "border-slate-300"} transition-all`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500">Thickness:</label>
                <input type="range" min={1} max={8} value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="w-20 accent-violet-600" />
                <span className="text-xs text-slate-500">{lineWidth}px</span>
              </div>
              <button onClick={clearCanvas} className="ml-auto flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors">
                <Trash2 className="w-4 h-4" /> Clear
              </button>
            </div>
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="w-full border-2 border-slate-200 rounded-2xl cursor-crosshair bg-white touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {!hasSignature && <p className="text-xs text-slate-400 mt-1 text-center">Draw your signature above</p>}
          </div>

          {/* Position Controls */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">3. Placement</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Page Number</label>
                <input
                  type="number"
                  min={1}
                  max={pageCount || 1}
                  value={targetPage}
                  onChange={(e) => setTargetPage(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">X Position (%): {xPos}</label>
                <input type="range" min={0} max={75} value={xPos} onChange={(e) => setXPos(Number(e.target.value))} className="w-full accent-violet-600" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Y Position (%): {yPos}</label>
                <input type="range" min={0} max={95} value={yPos} onChange={(e) => setYPos(Number(e.target.value))} className="w-full accent-violet-600" />
              </div>
            </div>
          </div>

          <button
            onClick={handleApply}
            disabled={!file || !hasSignature || loading}
            className="inline-flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Embedding...</>
            ) : (
              <><Download className="w-4 h-4" /> Add Signature &amp; Download</>
            )}
          </button>
          {done && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4" /> Signed PDF downloaded!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
