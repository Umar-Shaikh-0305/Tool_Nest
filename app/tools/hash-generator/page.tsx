"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Download } from "lucide-react";
import { downloadTextReport } from "@/lib/export-utils";

async function sha(algorithm: string, text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function HashGeneratorPage() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const [sha1, sha256, sha512] = await Promise.all([
      sha("SHA-1", input),
      sha("SHA-256", input),
      sha("SHA-512", input),
    ]);
    setHashes({ "SHA-1": sha1, "SHA-256": sha256, "SHA-512": sha512 });
    setLoading(false);
  };

  const copy = async (val: string, key: string) => {
    await navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const save = () => downloadTextReport("hash-generator", "Hash Generator", { Input: input, ...hashes });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Tools
        </Link>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Hash Generator</h1>
          <p className="text-slate-500 text-sm mb-6">Generate cryptographic hashes (SHA-1, SHA-256, SHA-512) directly in your browser.</p>

          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to hash..."
            rows={4}
            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none mb-4" />

          <button onClick={generate} disabled={!input.trim() || loading}
            className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold text-sm transition-colors mb-5">
            {loading ? "Generating..." : "Generate Hashes"}
          </button>

          {Object.keys(hashes).length > 0 && (
            <div className="space-y-3">
              {Object.entries(hashes).map(([alg, val]) => (
                <div key={alg} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">{alg}</span>
                    <button onClick={() => copy(val, alg)}
                      className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 font-semibold">
                      <Copy className="w-3.5 h-3.5" />{copied === alg ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="font-mono text-xs text-slate-800 break-all leading-relaxed">{val}</p>
                </div>
              ))}
              <button onClick={save}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-violet-50 text-slate-700 hover:text-violet-600 text-sm font-semibold transition-colors border border-slate-200 mt-2">
                <Download className="w-4 h-4" /> Save All Hashes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
