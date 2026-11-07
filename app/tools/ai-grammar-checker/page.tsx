"use client";
import { useState } from "react";
import { CheckCircle, Copy, Check, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { saveUserHistoryItem } from "@/lib/auth";
import { callAI } from "@/lib/ai-api";

export default function AiGrammarCheckerPage() {
  const [text, setText] = useState("");
  const [issues, setIssues] = useState<string[]>([]);
  const [corrected, setCorrected] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [checked, setChecked] = useState(false);

  const checkGrammar = async () => {
    if (!text.trim()) { setError("Please enter some text to check."); return; }
    setError("");
    setIssues([]);
    setCorrected("");
    setChecked(false);
    setLoading(true);
    try {
      const prompt = `Check the grammar in the following text. List each error found with the correction and explanation. Then show the corrected full text:\n\n${text}\n\nFormat your response as:\nISSUES:\n- [error description and correction]\n...\n\nCORRECTED TEXT:\n[full corrected text]`;
      const data = await callAI(prompt);

      const issuesMatch = data.match(/ISSUES:\n([\s\S]*?)\n\nCORRECTED TEXT:/);
      const correctedMatch = data.match(/CORRECTED TEXT:\n([\s\S]*)/);

      if (issuesMatch) {
        const issueLines = issuesMatch[1].split("\n").filter((l) => l.trim().startsWith("-")).map((l) => l.replace(/^-\s*/, ""));
        setIssues(issueLines);
      }
      if (correctedMatch) {
        setCorrected(correctedMatch[1].trim());
      } else {
        setCorrected(data);
      }
      setChecked(true);
      saveUserHistoryItem({
        toolId: "ai-grammar-checker",
        toolName: "AI Grammar Checker",
        summary: `Grammar checked: ${text.slice(0, 60)}...`,
        timestamp: new Date().toISOString(),
      });
    } catch {
      setError("Could not check grammar. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(corrected);
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
              <CheckCircle className="w-7 h-7 text-violet-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">AI Grammar Checker</h1>
                <span className="inline-flex items-center gap-1 bg-violet-100 text-violet-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" /> AI Powered
                </span>
              </div>
              <p className="text-slate-500 text-sm">Find and fix grammar errors with AI-powered analysis</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Your Text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder="Paste or type your text here to check grammar..."
              className="w-full border border-slate-200 rounded-xl p-4 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            />
            <p className="text-xs text-slate-400 mt-1 text-right">{text.length} characters</p>
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

          <button
            onClick={checkGrammar}
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Checking Grammar...</> : <><CheckCircle className="w-5 h-5" /> Check Grammar</>}
          </button>

          {checked && (
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <h2 className="font-semibold text-slate-800">Issues Found</h2>
                  <span className="ml-auto bg-amber-200 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {issues.length} {issues.length === 1 ? "issue" : "issues"}
                  </span>
                </div>
                {issues.length > 0 ? (
                  <ul className="space-y-2">
                    {issues.map((issue, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="mt-1 w-4 h-4 flex-shrink-0 bg-amber-400 text-white rounded-full text-xs flex items-center justify-center font-bold">{i + 1}</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-green-600 text-sm font-medium">No grammar errors found! Your text looks great.</p>
                )}
              </div>

              <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <h2 className="font-semibold text-slate-800">Corrected Text</h2>
                  </div>
                  <button onClick={copy} className="flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 font-medium transition-colors">
                    {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
                  </button>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{corrected}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
