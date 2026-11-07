"use client";
import { useState } from "react";
import { Languages, Copy, Check, Loader2, Sparkles, ArrowLeftRight } from "lucide-react";
import { saveUserHistoryItem } from "@/lib/auth";
import { callAI } from "@/lib/ai-api";

const languageOptions = [
  "Auto-detect", "English", "Urdu", "Arabic", "French", "Spanish",
  "German", "Chinese", "Hindi", "Turkish", "Portuguese", "Japanese",
  "Russian", "Italian", "Korean", "Bengali", "Swahili",
];

export default function AiTranslatorPage() {
  const [sourceLang, setSourceLang] = useState("Auto-detect");
  const [targetLang, setTargetLang] = useState("Urdu");
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const swap = () => {
    if (sourceLang === "Auto-detect") return;
    const tmp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tmp);
    setText(result);
    setResult("");
  };

  const translate = async () => {
    if (!text.trim()) { setError("Please enter some text to translate."); return; }
    setError("");
    setResult("");
    setLoading(true);
    try {
      const from = sourceLang === "Auto-detect" ? "the detected language" : sourceLang;
      const prompt = `Translate the following text from ${from} to ${targetLang}. Return only the translated text:\n\n${text}`;
      const data = await callAI(prompt);
      setResult(data);
      saveUserHistoryItem({
        toolId: "ai-translator",
        toolName: "AI Translator",
        summary: `Translated from ${sourceLang} to ${targetLang}`,
        timestamp: new Date().toISOString(),
      });
    } catch {
      setError("Could not translate. Please check your internet connection and try again.");
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
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center">
              <Languages className="w-7 h-7 text-violet-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">AI Translator</h1>
                <span className="inline-flex items-center gap-1 bg-violet-100 text-violet-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" /> AI Powered
                </span>
              </div>
              <p className="text-slate-500 text-sm">Translate text between 17+ languages instantly</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6">
          {/* Language selectors */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">From</label>
              <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-400">
                {languageOptions.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <button
              onClick={swap}
              disabled={sourceLang === "Auto-detect"}
              title={sourceLang === "Auto-detect" ? "Cannot swap when source is Auto-detect" : "Swap languages"}
              className="mt-5 p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:border-violet-400 hover:text-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">To</label>
              <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-400">
                {languageOptions.filter((l) => l !== "Auto-detect").map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-700">Source Text</label>
              <span className="text-xs text-slate-400">{text.length} characters</span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={7}
              placeholder="Type or paste text to translate..."
              className="w-full border border-slate-200 rounded-xl p-4 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            />
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

          <button onClick={translate} disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Translating...</> : <><Languages className="w-5 h-5" /> Translate</>}
          </button>

          {/* Output */}
          {(result || loading) && (
            <div className="bg-violet-50 border border-violet-100 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800">Translation</span>
                  <span className="text-xs text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full font-medium">{targetLang}</span>
                </div>
                {result && (
                  <button onClick={copy} className="flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 font-medium transition-colors">
                    {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
                  </button>
                )}
              </div>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-4 bg-violet-200 rounded animate-pulse" style={{ width: `${60 + (i % 4) * 10}%` }} />)}
                </div>
              ) : (
                <p
                  dir={["Urdu", "Arabic"].includes(targetLang) ? "rtl" : "ltr"}
                  className={`text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap ${
                    ["Urdu", "Arabic"].includes(targetLang) ? "text-right font-medium" : "text-left"
                  }`}
                >
                  {result}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
