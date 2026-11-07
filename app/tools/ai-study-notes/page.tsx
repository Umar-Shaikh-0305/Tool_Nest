"use client";
import { useState } from "react";
import { NotebookPen, Copy, Check, Loader2, Sparkles, Download } from "lucide-react";
import { saveUserHistoryItem } from "@/lib/auth";
import { callAI } from "@/lib/ai-api";

const formats = ["Bullet Points", "Numbered List", "Cornell Notes format", "Mind Map outline"];

export default function AiStudyNotesPage() {
  const [content, setContent] = useState("");
  const [format, setFormat] = useState(formats[0]);
  const [subject, setSubject] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!content.trim()) { setError("Please paste some content to create notes from."); return; }
    setError("");
    setResult("");
    setLoading(true);
    try {
      const subjectHint = subject ? ` Subject/Topic: ${subject}.` : "";
      const prompt = `Create well-organized study notes from the following content in ${format} format.${subjectHint} Highlight key terms, main concepts, and important details:\n\n${content}`;
      const data = await callAI(prompt);
      setResult(data);
      saveUserHistoryItem({
        toolId: "ai-study-notes",
        toolName: "AI Study Notes Maker",
        summary: `Study notes in ${format} format${subject ? ` for ${subject}` : ""}`,
        timestamp: new Date().toISOString(),
      });
    } catch {
      setError("Could not generate notes. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `study-notes-${(subject || "notes").replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <a href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-violet-600 mb-8 text-sm font-medium transition-colors">
          ← Back to Tools
        </a>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center">
              <NotebookPen className="w-7 h-7 text-violet-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">AI Study Notes Maker</h1>
                <span className="inline-flex items-center gap-1 bg-violet-100 text-violet-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" /> AI Powered
                </span>
              </div>
              <p className="text-slate-500 text-sm">Transform lecture content into organized, structured study notes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Lecture / Study Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Paste your lecture notes, textbook chapter, or any study material here..."
              className="w-full border border-slate-200 rounded-xl p-4 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Notes Format</label>
              <div className="space-y-2">
                {formats.map((f) => (
                  <label key={f} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${format === f ? "border-violet-400 bg-violet-50" : "border-slate-200 hover:border-violet-300"}`}>
                    <input type="radio" name="format" value={f} checked={format === f} onChange={() => setFormat(f)} className="accent-violet-600" />
                    <span className="text-sm font-medium text-slate-700">{f}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Subject / Topic <span className="text-slate-400 font-normal">(optional)</span></label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Organic Chemistry, World War II"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
              <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-xs text-blue-700 font-semibold mb-1">💡 Tips for best results</p>
                <ul className="text-xs text-blue-600 space-y-1">
                  <li>• Include full paragraphs, not fragments</li>
                  <li>• Cornell Notes work best for lectures</li>
                  <li>• Mind Map outline is great for concepts</li>
                  <li>• More content = more detailed notes</li>
                </ul>
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

          <button onClick={generate} disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating Notes...</> : <><NotebookPen className="w-5 h-5" /> Generate Notes</>}
          </button>

          {result && (
            <div className="bg-violet-50 border border-violet-100 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-slate-800">Study Notes</h2>
                  <span className="text-xs bg-violet-200 text-violet-800 px-2 py-0.5 rounded-full font-semibold">{format}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={download} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-violet-700 font-medium transition-colors">
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button onClick={copy} className="flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 font-medium transition-colors">
                    {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
                  </button>
                </div>
              </div>
              <div className="bg-white border border-violet-100 rounded-xl p-5">
                <pre className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-sans">{result}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
