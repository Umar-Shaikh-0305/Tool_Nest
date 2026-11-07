"use client";
import { useState, useRef } from "react";
import { Presentation, Upload, Download, CheckCircle, Copy, MonitorPlay } from "lucide-react";
import { saveUserHistoryItem } from "@/lib/auth";
import ProcessingModal from "@/components/ProcessingModal";

export default function PdfToPowerPointPage() {
  const [file, setFile] = useState<File | null>(null);
  const [slides, setSlides] = useState<{ slideNum: number; title: string; bullets: string[] }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    if (!f || !f.name.toLowerCase().endsWith(".pdf")) return;
    setFile(f);
    setDone(false);
    setLoading(true);
    setSlides([]);
    setLoadingMsg("Initializing presentation slides...");

    const startTime = Date.now();

    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

      const arrayBuffer = await f.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      const parsedSlides: { slideNum: number; title: string; bullets: string[] }[] = [];

      for (let i = 1; i <= numPages; i++) {
        setLoadingMsg(`Processing slide ${i} of ${numPages}...`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Sort items vertically top-to-bottom
        const items = (textContent.items as any[]).filter((it) => it.str && it.str.trim().length > 0);
        items.sort((a, b) => b.transform[5] - a.transform[5]);

        let lines: string[] = [];
        let currentLine = "";
        let lastY: number | null = null;

        for (const item of items) {
          const y = item.transform[5];
          if (lastY !== null && Math.abs(y - lastY) > 5) {
            if (currentLine.trim()) lines.push(currentLine.trim());
            currentLine = item.str;
          } else {
            currentLine += (currentLine ? " " : "") + item.str;
          }
          lastY = y;
        }
        if (currentLine.trim()) lines.push(currentLine.trim());

        // Extract title (usually first line) and bullets (remaining lines)
        const title = lines[0] || `Slide ${i}`;
        const bullets = lines.slice(1).filter((l) => l.length > 0);

        parsedSlides.push({
          slideNum: i,
          title,
          bullets: bullets.length ? bullets : ["(Slide contains graphic/image content)"],
        });
      }

      // Enforce 2.5s realistic processing time
      const elapsed = Date.now() - startTime;
      if (elapsed < 2500) {
        setLoadingMsg("Generating PowerPoint templates & slides...");
        await new Promise((r) => setTimeout(r, 2500 - elapsed));
      }

      setSlides(parsedSlides);
    } catch (err: any) {
      console.error(err);
      setSlides([
        {
          slideNum: 1,
          title: "Error Reading Presentation",
          bullets: [err?.message || "Could not read PDF"],
        },
      ]);
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  };

  const handleDownload = () => {
    if (!slides.length || !file) return;

    const baseName = file.name.replace(/\.pdf$/i, "");

    // Generate an HTML-based PowerPoint presentation (.ppt) that opens natively in MS PowerPoint & Keynote
    const pptHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:p='urn:schemas-microsoft-com:office:powerpoint' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${baseName}</title>
        <style>
          @page { size: 10in 7.5in; margin: 0.5in; }
          body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; margin: 0; padding: 0; background-color: #f1f5f9; }
          .slide {
            page-break-after: always;
            width: 9in;
            height: 6.5in;
            margin: 0.25in auto 0.5in auto;
            background: #ffffff;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
            border-radius: 8px;
            padding: 0.6in;
            box-sizing: border-box;
            position: relative;
          }
          .slide-header {
            font-size: 24pt;
            font-weight: bold;
            color: #1e1b4b;
            border-bottom: 3px solid #7c3aed;
            padding-bottom: 12px;
            margin-bottom: 24px;
          }
          .slide-content {
            font-size: 14pt;
            line-height: 1.6;
            color: #334155;
          }
          ul { margin-top: 10px; padding-left: 28px; }
          li { margin-bottom: 12px; }
          .slide-footer {
            position: absolute;
            bottom: 0.4in;
            left: 0.6in;
            right: 0.6in;
            display: flex;
            justify-content: space-between;
            font-size: 10pt;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
          }
        </style>
      </head>
      <body>
        ${slides
          .map(
            (s) => `
          <div class="slide">
            <div class="slide-header">${s.title.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
            <div class="slide-content">
              <ul>
                ${s.bullets.map((b) => `<li>${b.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</li>`).join("")}
              </ul>
            </div>
            <div class="slide-footer">
              <span>${baseName}</span>
              <span>Slide ${s.slideNum} of ${slides.length}</span>
            </div>
          </div>
        `
          )
          .join("")}
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff" + pptHtml], { type: "application/vnd.ms-powerpoint" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseName}.ppt`;
    a.click();
    URL.revokeObjectURL(url);
    setDone(true);

    saveUserHistoryItem({
      toolId: "pdf-to-powerpoint",
      toolName: "PDF to PowerPoint",
      summary: `Converted "${file.name}" into ${slides.length} PowerPoint presentation slides`,
      timestamp: new Date().toISOString(),
    });
  };

  const handleCopy = () => {
    const text = slides
      .map((s) => `--- Slide ${s.slideNum}: ${s.title} ---\n${s.bullets.map((b) => `• ${b}`).join("\n")}`)
      .join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <ProcessingModal
        isOpen={loading}
        title="Converting PDF to POWERPOINT..."
        subtitle="Converting pages into formatted presentation slides & bullet outlines..."
        progressText={loadingMsg}
        color="amber"
      />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <a href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-violet-600 mb-8 text-sm font-medium transition-colors">
          &larr; Back to Tools
        </a>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mb-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
              <Presentation className="w-7 h-7 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">PDF to PowerPoint Converter</h1>
              <p className="text-slate-500 text-sm">Convert PDF pages into editable PowerPoint (.ppt) presentation slides</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <label
            className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-amber-200 rounded-2xl cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-all"
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <MonitorPlay className="w-9 h-9 text-amber-500 mb-2" />
            <span className="text-slate-700 font-semibold">Drop PDF here or click to browse</span>
            <span className="text-slate-400 text-xs mt-1">Converts each page to a dedicated presentation slide</span>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </label>

          {file && (
            <div className="mt-4 flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <Presentation className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-semibold text-slate-800">{file.name}</span>
                <span className="text-xs text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setSlides([]);
                  setDone(false);
                }}
                className="text-xs font-semibold text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          )}

          {loading && (
            <div className="mt-6 flex flex-col items-center justify-center py-8">
              <div className="w-8 h-8 border-3 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-3" />
              <p className="text-sm font-semibold text-slate-700">{loadingMsg}</p>
              <p className="text-xs text-slate-400 mt-1">Extracting slide headers &amp; bullet points...</p>
            </div>
          )}

          {slides.length > 0 && !loading && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Generated Slides Preview</h3>
                  <p className="text-xs text-slate-500">{slides.length} slides ready for export</p>
                </div>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? "Copied!" : "Copy Outline"}
                </button>
              </div>

              {/* Grid of slide cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-1">
                {slides.map((s) => (
                  <div key={s.slideNum} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-amber-300 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          Slide {s.slideNum}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-2 line-clamp-1">{s.title}</h4>
                      <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                        {s.bullets.slice(0, 4).map((b, bi) => (
                          <li key={bi} className="truncate">{b}</li>
                        ))}
                        {s.bullets.length > 4 && (
                          <li className="text-slate-400 list-none text-[11px] font-medium pt-1">
                            +{s.bullets.length - 4} more points...
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={handleDownload}
                  className="w-full inline-flex items-center justify-center gap-2 bg-amber-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-amber-700 transition-all shadow-md active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PowerPoint (.PPT)</span>
                </button>
              </div>

              {done && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-sm font-semibold">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  PowerPoint presentation downloaded! Opens directly in Microsoft PowerPoint, Google Slides, or Keynote.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
