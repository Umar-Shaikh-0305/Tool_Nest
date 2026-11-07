"use client";
import { useState } from "react";
import { FileText, Copy, Check, Loader2, Sparkles, Download } from "lucide-react";
import { saveUserHistoryItem } from "@/lib/auth";
import { callAI } from "@/lib/ai-api";

const experienceLevels = ["Fresher/No experience", "1-2 years", "3-5 years", "5+ years"];

export default function AiCoverLetterPage() {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState(experienceLevels[0]);
  const [achievements, setAchievements] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!jobTitle.trim() || !company.trim() || !name.trim()) {
      setError("Please fill in Job Title, Company, and Your Name.");
      return;
    }
    setError("");
    setResult("");
    setLoading(true);
    try {
      const prompt = `Write a professional cover letter for a ${jobTitle} position at ${company}. Applicant name: ${name}. Experience level: ${experience}. Skills: ${skills || "Not specified"}. Key achievements: ${achievements || "Not specified"}. Make it compelling and 3-4 paragraphs.`;
      const data = await callAI(prompt);
      setResult(data);
      saveUserHistoryItem({
        toolId: "ai-cover-letter",
        toolName: "AI Cover Letter Generator",
        summary: `Cover letter for ${jobTitle} at ${company}`,
        timestamp: new Date().toISOString(),
      });
    } catch {
      setError("Could not generate cover letter. Please check your internet connection and try again.");
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
    a.download = `cover-letter-${company.replace(/\s+/g, "-")}.txt`;
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
              <FileText className="w-7 h-7 text-violet-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">AI Cover Letter Generator</h1>
                <span className="inline-flex items-center gap-1 bg-violet-100 text-violet-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" /> AI Powered
                </span>
              </div>
              <p className="text-slate-500 text-sm">Generate a compelling cover letter tailored to your job application</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Job Title <span className="text-red-400">*</span></label>
              <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Software Engineer" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Company Name <span className="text-red-400">*</span></label>
              <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Google" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Your Name <span className="text-red-400">*</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Experience Level</label>
              <select value={experience} onChange={(e) => setExperience(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
                {experienceLevels.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Your Skills <span className="text-slate-400 font-normal">(comma-separated)</span></label>
            <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. React, Node.js, TypeScript, Team Leadership" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Key Achievements <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea value={achievements} onChange={(e) => setAchievements(e.target.value)} rows={3} placeholder="e.g. Led a team of 5 engineers, Increased sales by 30%, Published 3 research papers..." className="w-full border border-slate-200 rounded-xl p-4 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none" />
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

          <button onClick={generate} disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : <><FileText className="w-5 h-5" /> Generate Cover Letter</>}
          </button>

          {result && (
            <div className="bg-violet-50 border border-violet-100 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-800">Your Cover Letter</h2>
                <div className="flex items-center gap-3">
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
