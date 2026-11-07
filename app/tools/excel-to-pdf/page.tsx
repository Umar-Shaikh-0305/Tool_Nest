"use client";
import { useState } from "react";
import { TableProperties, Upload, Download, AlertCircle, CheckCircle } from "lucide-react";
import { saveUserHistoryItem } from "@/lib/auth";

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  for (const line of lines) {
    const cells: string[] = [];
    let inQuote = false;
    let cell = "";
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { cell += '"'; i++; }
        else inQuote = !inQuote;
      } else if (ch === "," && !inQuote) {
        cells.push(cell); cell = "";
      } else {
        cell += ch;
      }
    }
    cells.push(cell);
    rows.push(cells);
  }
  return rows;
}

export default function ExcelToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [tableData, setTableData] = useState<string[][]>([]);
  const [isXlsx, setIsXlsx] = useState(false);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [done, setDone] = useState(false);

  const handleFile = async (f: File) => {
    setFile(f);
    setDone(false);
    setLoading(true);
    setTableData([]);
    const ext = f.name.split(".").pop()?.toLowerCase();
    setIsXlsx(ext === "xlsx" || ext === "xls");

    if (ext === "csv") {
      const text = await f.text();
      const rows = parseCsv(text);
      setTableData(rows);
    } else {
      // Demo mode for xlsx/xls
      setTableData([
        ["File", "Format", "Size (KB)", "Status"],
        [f.name, (ext ?? "").toUpperCase(), (f.size / 1024).toFixed(1), "Demo mode"],
        ["", "", "", "Full xlsx parsing requires a server-side library"],
      ]);
    }
    setLoading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleConvert = async () => {
    if (!file || tableData.length === 0) return;
    setConverting(true);
    try {
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();
      const headerFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const pageWidth = 842; // A4 landscape
      const pageHeight = 595;
      const margin = 40;
      const cellPad = 8;
      const rowHeight = 22;
      const headerFontSize = 10;
      const bodyFontSize = 9;

      const colCount = tableData[0]?.length ?? 1;
      const colWidth = (pageWidth - margin * 2) / colCount;

      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin;

      for (let r = 0; r < tableData.length; r++) {
        if (y < margin + rowHeight) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
        }
        const row = tableData[r];
        const isHeader = r === 0;

        if (isHeader) {
          page.drawRectangle({ x: margin, y: y - rowHeight, width: pageWidth - margin * 2, height: rowHeight, color: rgb(0.48, 0.23, 0.93) });
        } else {
          page.drawRectangle({ x: margin, y: y - rowHeight, width: pageWidth - margin * 2, height: rowHeight, color: r % 2 === 0 ? rgb(0.97, 0.97, 0.99) : rgb(1, 1, 1), borderColor: rgb(0.85, 0.85, 0.9), borderWidth: 0.5 });
        }

        for (let c = 0; c < colCount; c++) {
          const cellText = (row[c] ?? "").slice(0, 40);
          page.drawText(cellText, {
            x: margin + c * colWidth + cellPad,
            y: y - rowHeight + cellPad,
            size: isHeader ? headerFontSize : bodyFontSize,
            font: isHeader ? headerFont : bodyFont,
            color: isHeader ? rgb(1, 1, 1) : rgb(0.1, 0.1, 0.1),
            maxWidth: colWidth - cellPad * 2,
          });
        }
        y -= rowHeight;
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.(xlsx?|csv)$/i, "") + ".pdf";
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
      saveUserHistoryItem({
        toolId: "excel-to-pdf",
        toolName: "Excel to PDF",
        summary: `Converted ${file.name} to PDF`,
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
              <TableProperties className="w-7 h-7 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Excel to PDF</h1>
              <p className="text-slate-500 text-sm">Convert Excel spreadsheets and CSV files to PDF</p>
            </div>
          </div>
        </div>

        {isXlsx && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-amber-800 text-sm">
              <strong>Demo Mode for XLS/XLSX:</strong> Full Excel parsing requires a server-side library. CSV files are fully supported.
            </p>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <label
            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-violet-200 rounded-2xl cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-all"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <Upload className="w-8 h-8 text-violet-400 mb-2" />
            <span className="text-slate-600 font-medium">Drop file here or click to upload</span>
            <span className="text-slate-400 text-sm mt-1">Accepted: .xls, .xlsx, .csv</span>
            <input type="file" className="hidden" accept=".xls,.xlsx,.csv" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </label>

          {file && (
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
              <TableProperties className="w-4 h-4 text-violet-500" />
              <span>{file.name}</span>
              <span className="text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}

          {loading && (
            <div className="mt-6 flex items-center gap-3 text-violet-600">
              <div className="w-5 h-5 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
              <span className="text-sm font-medium">Parsing file...</span>
            </div>
          )}

          {tableData.length > 0 && !loading && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">
                Preview ({tableData.length} rows × {tableData[0]?.length ?? 0} columns)
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-64 overflow-y-auto mb-4">
                <table className="w-full text-sm">
                  <thead className="sticky top-0">
                    <tr className="bg-violet-600">
                      {tableData[0]?.map((cell, j) => (
                        <th key={j} className="px-3 py-2 text-left font-semibold text-white border-b border-violet-500 whitespace-nowrap">{cell}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.slice(1).map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        {row.map((cell, j) => (
                          <td key={j} className="px-3 py-1.5 text-slate-700 border-b border-slate-100 whitespace-nowrap max-w-xs truncate">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
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
