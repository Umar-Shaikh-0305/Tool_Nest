"use client";
import { useState } from "react";
import { RefreshCw, Copy, Check, Loader2, Sparkles } from "lucide-react";
import { saveUserHistoryItem } from "@/lib/auth";
import { callAI } from "@/lib/ai-api";

const styles = ["Standard", "Formal", "Casual", "Creative", "Academic"];

function wordCount(str: string) {
  return str.trim() ? str.trim().split(/\s+/).length : 0;
}

export default function AiParaphraserPage() {
  const [text, setText] = useState("");
  const [style, setStyle] = useState(styles[0]);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const paraphrase = async () => {
    if (!text.trim()) { setError("Please enter some text to paraphrase."); return; }
    setError("");
    setResult("");
    setLoading(true);
    try {
      const prompt = `Rewrite the following text in a ${style} style, keeping the same meaning but using different words and sentence structures:\n\n${text}`;
      const data = await callAI(prompt);
      setResult(data);
      saveUserHistoryItem({
        toolId: "ai-paraphraser",
        toolName: "AI Paraphraser",
        summary: `Paraphrased text in ${style} style`,
        timestamp: new Date().toISOString(),
      });
    } catch {
      setError("Could not paraphrase. Please check your internet connection and try again.");
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
      <div className="max-w-5xl mx-auto px-4 py-10">
        <a href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-violet-600 mb-8 text-sm font-medium transition-colors">
          ← Back to Tools
        </a>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center">
              <RefreshCw className="w-7 h-7 text-violet-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">AI Paraphraser</h1>
                <span className="inline-flex items-center gap-1 bg-violet-100 text-violet-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" /> AI Powered
                </span>
              </div>
              <p className="text-slate-500 text-sm">Rewrite text in different styles while preserving meaning</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Writing Style</label>
            <div className="flex flex-wrap gap-2">
              {styles.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${style === s ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-200 hover:border-violet-400"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-700">Original Text</label>
                <span className="text-xs text-slate-400">{wordCount(text)} words</span>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={10}
                placeholder="Paste the text you want to paraphrase..."
                className="w-full border border-slate-200 rounded-xl p-4 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-700">Paraphrased Text</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{wordCount(result)} words</span>
                  {result && (
                    <button onClick={copy} className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 font-medium transition-colors">
                      {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                    </button>
                  )}
                </div>
              </div>
              <div className={`w-full h-[calc(100%-2rem)] min-h-[200px] border rounded-xl p-4 text-sm leading-relaxed ${loading ? "bg-violet-50 border-violet-200 animate-pulse" : result ? "bg-violet-50 border-violet-100 text-slate-700" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => <div key={i} className="h-4 bg-violet-200 rounded animate-pulse" style={{ width: `${70 + (i % 3) * 10}%` }} />)}
                  </div>
                ) : result ? (
                  <p className="whitespace-pre-wrap">{result}</p>
                ) : (
                  <p>Your paraphrased text will appear here...</p>
                )}
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

          <button
            onClick={paraphrase}
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Paraphrasing...</> : <><RefreshCw className="w-5 h-5" /> Paraphrase</>}
          </button>
        </div>
      </div>
    </div>
  );
}
