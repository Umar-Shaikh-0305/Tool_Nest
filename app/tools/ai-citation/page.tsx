"use client";
import { useState } from "react";
import { Quote, Copy, Check, Loader2, Sparkles } from "lucide-react";
import { saveUserHistoryItem } from "@/lib/auth";
import { callAI } from "@/lib/ai-api";

const sourceTypes = ["Website", "Book", "Journal Article", "YouTube Video", "Newspaper"];
const citationStyles = ["APA (7th ed.)", "MLA (9th ed.)", "Chicago", "Harvard", "IEEE"];

interface Fields {
  [key: string]: string;
}

const fieldDefs: Record<string, { label: string; placeholder: string }[]> = {
  Website: [
    { label: "URL", placeholder: "https://example.com/article" },
    { label: "Website Name", placeholder: "BBC News" },
    { label: "Author", placeholder: "John Smith" },
    { label: "Date Accessed", placeholder: "October 25, 2024" },
    { label: "Publication Date", placeholder: "January 10, 2024" },
  ],
  Book: [
    { label: "Title", placeholder: "The Great Gatsby" },
    { label: "Author", placeholder: "F. Scott Fitzgerald" },
    { label: "Publisher", placeholder: "Scribner" },
    { label: "Year", placeholder: "1925" },
    { label: "Edition", placeholder: "2nd (optional)" },
  ],
  "Journal Article": [
    { label: "Article Title", placeholder: "Climate Change Effects on Biodiversity" },
    { label: "Author", placeholder: "Jane Doe, John Smith" },
    { label: "Journal Name", placeholder: "Nature" },
    { label: "Volume", placeholder: "42" },
    { label: "Issue", placeholder: "3" },
    { label: "Pages", placeholder: "112-130" },
    { label: "Year", placeholder: "2023" },
    { label: "DOI", placeholder: "10.1234/nature.2023.001" },
  ],
  "YouTube Video": [
    { label: "Video Title", placeholder: "How to Learn Coding in 2024" },
    { label: "Channel Name", placeholder: "TechWithTim" },
    { label: "URL", placeholder: "https://youtube.com/watch?v=..." },
    { label: "Upload Date", placeholder: "March 15, 2024" },
  ],
  Newspaper: [
    { label: "Headline", placeholder: "Scientists Discover New Planet" },
    { label: "Author", placeholder: "Sarah Johnson" },
    { label: "Publication Name", placeholder: "The New York Times" },
    { label: "Date", placeholder: "October 25, 2024" },
    { label: "Page", placeholder: "A1 (optional)" },
  ],
};

export default function AiCitationPage() {
  const [sourceType, setSourceType] = useState(sourceTypes[0]);
  const [citationStyle, setCitationStyle] = useState(citationStyles[0]);
  const [fields, setFields] = useState<Fields>({});
  const [citation, setCitation] = useState("");
  const [inText, setInText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleField = (label: string, value: string) => {
    setFields((prev) => ({ ...prev, [label]: value }));
  };

  const generate = async () => {
    setError("");
    setCitation("");
    setInText("");
    setLoading(true);
    const details = Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join(", ");
    try {
      const prompt = `Generate a ${citationStyle} style citation for this ${sourceType}: ${details}. Return the response in this format:\nFULL CITATION:\n[citation here]\n\nIN-TEXT CITATION:\n[in-text example here]`;
      const data = await callAI(prompt);

      const fullMatch = data.match(/FULL CITATION:\n([\s\S]*?)\n\nIN-TEXT/);
      const inTextMatch = data.match(/IN-TEXT CITATION:\n([\s\S]*)/);

      setCitation(fullMatch ? fullMatch[1].trim() : data.trim());
      setInText(inTextMatch ? inTextMatch[1].trim() : "");

      saveUserHistoryItem({
        toolId: "ai-citation",
        toolName: "AI Citation Generator",
        summary: `${citationStyle} citation for ${sourceType}`,
        timestamp: new Date().toISOString(),
      });
    } catch {
      setError("Could not generate citation. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(citation);
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
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center">
              <Quote className="w-7 h-7 text-violet-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">AI Citation Generator</h1>
                <span className="inline-flex items-center gap-1 bg-violet-100 text-violet-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" /> AI Powered
                </span>
              </div>
              <p className="text-slate-500 text-sm">Generate properly formatted citations in any academic style</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Source Type</label>
              <select value={sourceType} onChange={(e) => { setSourceType(e.target.value); setFields({}); }} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
                {sourceTypes.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Citation Style</label>
              <select value={citationStyle} onChange={(e) => setCitationStyle(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
                {citationStyles.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Source Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fieldDefs[sourceType].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{f.label}</label>
                  <input
                    type="text"
                    value={fields[f.label] || ""}
                    onChange={(e) => handleField(f.label, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

          <button onClick={generate} disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : <><Quote className="w-5 h-5" /> Generate Citation</>}
          </button>

          {citation && (
            <div className="space-y-4">
              <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-violet-700 uppercase tracking-wide">Full Citation ({citationStyle})</span>
                  <button onClick={copy} className="flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 font-medium transition-colors">
                    {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
                  </button>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed font-mono bg-white border border-violet-100 rounded-xl p-4">{citation}</p>
              </div>
              {inText && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">In-Text Citation Example</span>
                  <p className="text-slate-700 text-sm font-mono">{inText}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
