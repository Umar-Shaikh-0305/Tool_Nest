"use client";
import { useState, useRef } from "react";
import { Table, Upload, Download, CheckCircle, Copy, FileSpreadsheet } from "lucide-react";
import { saveUserHistoryItem } from "@/lib/auth";
import ProcessingModal from "@/components/ProcessingModal";

export default function PdfToExcelPage() {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<string[][]>([]);
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
    setRows([]);
    setLoadingMsg("Scanning spreadsheet cells...");

    const startTime = Date.now();

    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

      const arrayBuffer = await f.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      const extractedRows: string[][] = [];

      for (let i = 1; i <= numPages; i++) {
        setLoadingMsg(`Analyzing tabular content on page ${i} of ${numPages}...`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Sort items by vertical position descending (top of page to bottom), then by horizontal x ascending
        const items = (textContent.items as any[]).filter((it) => it.str && it.str.trim().length > 0);
        items.sort((a, b) => {
          const yDiff = b.transform[5] - a.transform[5];
          if (Math.abs(yDiff) > 4) return yDiff;
          return a.transform[4] - b.transform[4];
        });

        // Group into lines by similar Y coordinates (within 4pt)
        const lineGroups: any[][] = [];
        let currentLine: any[] = [];
        let currentY: number | null = null;

        for (const it of items) {
          const y = it.transform[5];
          if (currentY === null || Math.abs(y - currentY) <= 4) {
            currentLine.push(it);
            currentY = y;
          } else {
            lineGroups.push(currentLine);
            currentLine = [it];
            currentY = y;
          }
        }
        if (currentLine.length) lineGroups.push(currentLine);

        // Turn line groups into table cells
        for (const line of lineGroups) {
          // Sort items left to right
          line.sort((a, b) => a.transform[4] - b.transform[4]);

          // Detect columns by gap distance
          const cells: string[] = [];
          let currentCell = "";
          let lastX: number | null = null;
          let lastWidth = 0;

          for (const item of line) {
            const x = item.transform[4];
            const width = item.width || 0;

            if (lastX !== null && x - (lastX + lastWidth) > 14) {
              // Significant gap -> new column
              cells.push(currentCell.trim());
              currentCell = item.str;
            } else {
              currentCell += (currentCell.length > 0 ? " " : "") + item.str;
            }
            lastX = x;
            lastWidth = width;
          }
          if (currentCell.trim()) cells.push(currentCell.trim());

          if (cells.length > 0) {
            extractedRows.push(cells);
          }
        }
      }

      // Enforce 2.5s realistic processing time
      const elapsed = Date.now() - startTime;
      if (elapsed < 2500) {
        setLoadingMsg("Generating Excel rows and headers...");
        await new Promise((r) => setTimeout(r, 2500 - elapsed));
      }

      setRows(extractedRows.length ? extractedRows : [["No extractable table data found"]]);
    } catch (err: any) {
      console.error(err);
      setRows([["Error parsing PDF", err?.message || "Unknown error"]]);
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  };

  const handleDownload = () => {
    if (!rows.length || !file) return;

    // Build standard CSV
    const csvContent = rows
      .map((row) =>
        row
          .map((cell) => `"${cell.replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name.replace(/\.pdf$/i, "") + ".csv";
    a.click();
    URL.revokeObjectURL(url);
    setDone(true);

    saveUserHistoryItem({
      toolId: "pdf-to-excel",
      toolName: "PDF to Excel",
      summary: `Extracted ${rows.length} rows from "${file.name}" to CSV/Excel`,
      timestamp: new Date().toISOString(),
    });
  };

  const handleCopy = () => {
    const text = rows.map((r) => r.join("\t")).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <ProcessingModal
        isOpen={loading}
        title="Converting PDF to EXCEL..."
        subtitle="Detecting tables, columns, rows and cell coordinates..."
        progressText={loadingMsg}
        color="emerald"
      />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <a href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-violet-600 mb-8 text-sm font-medium transition-colors">
          &larr; Back to Tools
        </a>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mb-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <Table className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">PDF to Excel / CSV</h1>
              <p className="text-slate-500 text-sm">Extract tables and columns from PDF documents into Excel spreadsheets</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <label
            className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-emerald-200 rounded-2xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-all"
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <FileSpreadsheet className="w-9 h-9 text-emerald-500 mb-2" />
            <span className="text-slate-700 font-semibold">Drop PDF here or click to browse</span>
            <span className="text-slate-400 text-xs mt-1">Extracts actual tables, spreadsheets &amp; data grids</span>
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
                <Table className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-semibold text-slate-800">{file.name}</span>
                <span className="text-xs text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setRows([]);
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
              <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-3" />
              <p className="text-sm font-semibold text-slate-700">{loadingMsg}</p>
              <p className="text-xs text-slate-400 mt-1">Parsing tables by geometric layout coordinates...</p>
            </div>
          )}

          {rows.length > 0 && !loading && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Extracted Spreadsheet Rows</h3>
                  <p className="text-xs text-slate-500">{rows.length} rows recognized</p>
                </div>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? "Copied!" : "Copy Table"}
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 max-h-80 overflow-y-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <tbody>
                    {rows.slice(0, 100).map((row, ri) => (
                      <tr key={ri} className={ri === 0 ? "bg-emerald-50/80 font-bold text-emerald-900 border-b border-emerald-100" : "even:bg-slate-50/60 border-b border-slate-100"}>
                        <td className="px-3 py-2 text-[10px] text-slate-400 font-mono select-none w-10 border-r border-slate-100 bg-slate-50">
                          {ri + 1}
                        </td>
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-3 py-2 border-r border-slate-100 whitespace-nowrap text-slate-700 max-w-xs truncate">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rows.length > 100 && (
                <p className="text-xs text-slate-400 text-center">Previewing first 100 rows. All {rows.length} rows will be exported.</p>
              )}

              <div className="pt-2">
                <button
                  onClick={handleDownload}
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Excel (.CSV)</span>
                </button>
              </div>

              {done && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-sm font-semibold">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Spreadsheet downloaded! Open directly with Microsoft Excel, Google Sheets, or Numbers.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
