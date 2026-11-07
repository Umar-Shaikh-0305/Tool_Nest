"use client";
import { useState } from "react";
import { BookOpen, Copy, Check, Loader2, Sparkles, Download } from "lucide-react";
import { saveUserHistoryItem } from "@/lib/auth";
import { callAI } from "@/lib/ai-api";

const essayTypes = ["Argumentative", "Descriptive", "Expository", "Narrative"];
const wordCounts = ["250", "500", "1000", "1500"];
const gradeLevels = ["Middle School", "High School", "College", "University"];

function countWords(str: string) {
  return str.trim() ? str.trim().split(/\s+/).length : 0;
}

export default function AiEssayWriterPage() {
  const [topic, setTopic] = useState("");
  const [essayType, setEssayType] = useState(essayTypes[0]);
  const [wordCount, setWordCount] = useState(wordCounts[1]);
  const [gradeLevel, setGradeLevel] = useState(gradeLevels[1]);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const writeEssay = async () => {
    if (!topic.trim()) { setError("Please enter an essay topic."); return; }
    setError("");
    setResult("");
    setLoading(true);
    try {
      const prompt = `Write a ${essayType} essay about '${topic}' for ${gradeLevel} level, approximately ${wordCount} words. Include an introduction, body paragraphs, and conclusion.`;
      const data = await callAI(prompt);
      setResult(data);
      saveUserHistoryItem({
        toolId: "ai-essay-writer",
        toolName: "AI Essay Writer",
        summary: `${essayType} essay about "${topic}" (${wordCount} words, ${gradeLevel})`,
        timestamp: new Date().toISOString(),
      });
    } catch {
      setError("Could not generate essay. Please check your internet connection and try again.");
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
    a.download = `essay-${topic.slice(0, 30).replace(/\s+/g, "-")}.txt`;
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
              <BookOpen className="w-7 h-7 text-violet-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">AI Essay Writer</h1>
                <span className="inline-flex items-center gap-1 bg-violet-100 text-violet-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" /> AI Powered
                </span>
              </div>
              <p className="text-slate-500 text-sm">Generate well-structured essays on any topic instantly</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Essay Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. The impact of social media on mental health"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Essay Type</label>
              <select value={essayType} onChange={(e) => setEssayType(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
                {essayTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Target Word Count</label>
              <select value={wordCount} onChange={(e) => setWordCount(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
                {wordCounts.map((w) => <option key={w}>{w} words</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Grade Level</label>
              <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
                {gradeLevels.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

          <button
            onClick={writeEssay}
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Writing Essay...</> : <><BookOpen className="w-5 h-5" /> Write Essay</>}
          </button>

          {result && (
            <div className="bg-violet-50 border border-violet-100 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold text-slate-800">Your Essay</h2>
                  <span className="text-xs bg-violet-200 text-violet-800 px-2 py-0.5 rounded-full font-semibold">{countWords(result)} words</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={download} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-violet-700 font-medium transition-colors">
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button onClick={copy} className="flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 font-medium transition-colors">
                    {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
                  </button>
                </div>
              </div>
              <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{result}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
