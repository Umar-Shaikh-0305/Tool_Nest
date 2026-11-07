"use client";
import { useState, useCallback } from "react";
import { ImageIcon, Upload, Download, CheckCircle, ChevronUp, ChevronDown, X } from "lucide-react";
import { saveUserHistoryItem } from "@/lib/auth";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  type: "jpeg" | "png";
}

export default function JpgToPdfPage() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newImages: ImageFile[] = [];
    Array.from(files).forEach((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["jpg", "jpeg", "png"].includes(ext ?? "")) return;
      const preview = URL.createObjectURL(file);
      newImages.push({
        id: Math.random().toString(36).slice(2),
        file,
        preview,
        type: ext === "png" ? "png" : "jpeg",
      });
    });
    setImages((prev) => [...prev, ...newImages]);
    setDone(false);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
  };

  const moveDown = (index: number) => {
    setImages((prev) => {
      if (index === prev.length - 1) return prev;
      const arr = [...prev];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
  };

  const remove = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleCreate = async () => {
    if (!images.length) return;
    setLoading(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();
      for (const img of images) {
        const arrayBuffer = await img.file.arrayBuffer();
        let embeddedImage;
        if (img.type === "png") {
          embeddedImage = await pdfDoc.embedPng(arrayBuffer);
        } else {
          embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
        }
        const { width, height } = embeddedImage.scale(1);
        const page = pdfDoc.addPage([width, height]);
        page.drawImage(embeddedImage, { x: 0, y: 0, width, height });
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "images.pdf";
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
      saveUserHistoryItem({
        toolId: "jpg-to-pdf",
        toolName: "JPG to PDF",
        summary: `Created PDF from ${images.length} image(s)`,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.error(e);
    }
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
              <ImageIcon className="w-7 h-7 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">JPG to PDF</h1>
              <p className="text-slate-500 text-sm">Convert JPG/PNG images to a PDF document</p>
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
            <span className="text-slate-600 font-medium">Drop images here or click to upload</span>
            <span className="text-slate-400 text-sm mt-1">Accepted: .jpg, .jpeg, .png (multiple files)</span>
            <input type="file" className="hidden" accept=".jpg,.jpeg,.png" multiple onChange={(e) => addFiles(e.target.files)} />
          </label>

          {images.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                {images.length} image{images.length !== 1 ? "s" : ""} — drag to reorder
              </h3>
              <div className="space-y-2 mb-6">
                {images.map((img, i) => (
                  <div key={img.id} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <img src={img.preview} alt={img.file.name} className="w-14 h-14 object-cover rounded-lg border border-slate-200" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{img.file.name}</p>
                      <p className="text-xs text-slate-400">{(img.file.size / 1024).toFixed(1)} KB · {img.type.toUpperCase()}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => moveUp(i)} disabled={i === 0} className="p-1.5 rounded-lg hover:bg-violet-100 text-slate-400 hover:text-violet-600 disabled:opacity-30 transition-colors">
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button onClick={() => moveDown(i)} disabled={i === images.length - 1} className="p-1.5 rounded-lg hover:bg-violet-100 text-slate-400 hover:text-violet-600 disabled:opacity-30 transition-colors">
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button onClick={() => remove(img.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:opacity-60"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating PDF...</>
                ) : (
                  <><Download className="w-4 h-4" /> Create PDF</>
                )}
              </button>
              {done && (
                <div className="mt-3 flex items-center gap-2 text-green-600 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" /> PDF created and downloaded!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
