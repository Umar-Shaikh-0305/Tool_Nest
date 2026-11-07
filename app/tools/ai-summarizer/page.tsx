"use client";
import { useState, useRef } from "react";
import { FileText, Upload, Copy, Check, Loader2, Sparkles } from "lucide-react";
import { saveUserHistoryItem } from "@/lib/auth";
import { callAI } from "@/lib/ai-api";

const lengths = ["Short (1-2 sentences)", "Medium (paragraph)", "Detailed (key points list)"];
const languages = ["English", "Urdu", "Arabic", "French", "Spanish"];

export default function AiSummarizerPage() {
  const [text, setText] = useState("");
  const [length, setLength] = useState(lengths[0]);
  const [language, setLanguage] = useState(languages[0]);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setText(ev.target?.result as string);
    reader.readAsText(file);
  };

  const summarize = async () => {
    if (!text.trim()) { setError("Please enter some text to summarize."); return; }
    setError("");
    setResult("");
    setLoading(true);
    try {
      const prompt = `Summarize the following text in ${length} format in ${language}:\n\n${text}`;
      const data = await callAI(prompt);
      setResult(data);
      saveUserHistoryItem({
        toolId: "ai-summarizer",
        toolName: "AI Text Summarizer",
        summary: `Summarized text in ${length} format (${language})`,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      setError("Could not summarize. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              <FileText className="w-7 h-7 text-violet-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">AI Text Summarizer</h1>
                <span className="inline-flex items-center gap-1 bg-violet-100 text-violet-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" /> AI Powered
                </span>
              </div>
              <p className="text-slate-500 text-sm">Paste or upload text and get an instant AI-generated summary</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Input Text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder="Paste your long text here..."
              className="w-full border border-slate-200 rounded-xl p-4 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            />
            <div className="mt-2">
              <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-violet-200 rounded-xl cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-all">
                <Upload className="w-5 h-5 text-violet-400 mb-1" />
                <span className="text-slate-500 text-xs font-medium">Or upload a .txt file</span>
                <input ref={fileRef} type="file" className="hidden" accept=".txt" onChange={handleFile} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Summary Length</label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                {lengths.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Output Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                {languages.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

          <button
            onClick={summarize}
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Summarizing...</> : <><Sparkles className="w-5 h-5" /> Summarize</>}
          </button>

          {result && (
            <div className="bg-violet-50 border border-violet-100 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-slate-800">Summary</h2>
                <button onClick={copy} className="flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 font-medium transition-colors">
                  {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
                </button>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{result}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
