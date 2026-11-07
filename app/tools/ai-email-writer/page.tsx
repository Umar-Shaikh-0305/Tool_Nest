"use client";
import { useState } from "react";
import { Mail, Copy, Check, Loader2, Sparkles } from "lucide-react";
import { saveUserHistoryItem } from "@/lib/auth";
import { callAI } from "@/lib/ai-api";

const purposes = ["Professional Request", "Follow-up", "Apology", "Thank You", "Complaint", "Job Application", "Meeting Request", "Cold Outreach"];
const tones = ["Formal", "Friendly", "Assertive", "Polite"];
const recipients = ["To a boss", "To a colleague", "To a client", "To HR", "To a professor", "Custom"];

export default function AiEmailWriterPage() {
  const [purpose, setPurpose] = useState(purposes[0]);
  const [keyPoints, setKeyPoints] = useState("");
  const [tone, setTone] = useState(tones[0]);
  const [recipient, setRecipient] = useState(recipients[0]);
  const [customRecipient, setCustomRecipient] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const writeEmail = async () => {
    if (!keyPoints.trim()) { setError("Please add some key points for the email."); return; }
    setError("");
    setResult("");
    setLoading(true);
    const recipientLabel = recipient === "Custom" ? customRecipient || "someone" : recipient;
    try {
      const prompt = `Write a ${tone} email for the purpose of '${purpose}' to ${recipientLabel}. Key points to include: ${keyPoints}. Include subject line, greeting, body, and sign-off.`;
      const data = await callAI(prompt);
      setResult(data);
      saveUserHistoryItem({
        toolId: "ai-email-writer",
        toolName: "AI Email Writer",
        summary: `${purpose} email (${tone}) to ${recipientLabel}`,
        timestamp: new Date().toISOString(),
      });
    } catch {
      setError("Could not generate email. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract subject line for highlighting
  const subjectMatch = result.match(/subject[:\s]+(.+)/i);
  const subjectLine = subjectMatch ? subjectMatch[1].trim() : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <a href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-violet-600 mb-8 text-sm font-medium transition-colors">
          ← Back to Tools
        </a>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center">
              <Mail className="w-7 h-7 text-violet-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">AI Email Writer</h1>
                <span className="inline-flex items-center gap-1 bg-violet-100 text-violet-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" /> AI Powered
                </span>
              </div>
              <p className="text-slate-500 text-sm">Generate professional emails for any situation</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Purpose</label>
              <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
                {purposes.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tone</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
                {tones.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Recipient</label>
            <div className="flex gap-2 flex-wrap">
              {recipients.map((r) => (
                <button
                  key={r}
                  onClick={() => setRecipient(r)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${recipient === r ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-200 hover:border-violet-400"}`}
                >
                  {r}
                </button>
              ))}
            </div>
            {recipient === "Custom" && (
              <input
                type="text"
                value={customRecipient}
                onChange={(e) => setCustomRecipient(e.target.value)}
                placeholder="Describe your recipient..."
                className="mt-3 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Key Points</label>
            <textarea
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              rows={4}
              placeholder="What should the email say? (e.g., bullet points or brief notes)&#10;- Request a meeting for next week&#10;- Discuss Q4 project timeline&#10;- Ask for feedback on proposal"
              className="w-full border border-slate-200 rounded-xl p-4 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            />
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

          <button
            onClick={writeEmail}
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Writing Email...</> : <><Mail className="w-5 h-5" /> Write Email</>}
          </button>

          {result && (
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              {subjectLine && (
                <div className="bg-violet-600 text-white px-6 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wide opacity-80">Subject</span>
                  <p className="font-semibold mt-0.5">{subjectLine}</p>
                </div>
              )}
              <div className="bg-violet-50 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-slate-800">Your Email</h2>
                  <button onClick={copy} className="flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 font-medium transition-colors">
                    {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
                  </button>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{result}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
