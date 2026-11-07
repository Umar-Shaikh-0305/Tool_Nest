"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Download, RefreshCw } from "lucide-react";
import { downloadTextReport } from "@/lib/export-utils";

const LOREM_WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum".split(" ");

function generateWords(n: number) {
  const result: string[] = [];
  for (let i = 0; i < n; i++) result.push(LOREM_WORDS[i % LOREM_WORDS.length]);
  return result.join(" ");
}

function generateSentences(n: number) {
  const sentences: string[] = [];
  for (let i = 0; i < n; i++) {
    const len = 8 + (i % 7);
    const w = generateWords(len);
    sentences.push(w.charAt(0).toUpperCase() + w.slice(1) + ".");
  }
  return sentences.join(" ");
}

function generateParagraphs(n: number) {
  const paras: string[] = [];
  for (let i = 0; i < n; i++) paras.push(generateSentences(4 + (i % 3)));
  return paras.join("\n\n");
}

export default function LoremIpsumPage() {
  const [type, setType] = useState<"words" | "sentences" | "paragraphs">("paragraphs");
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = () => {
    if (type === "words") setOutput(generateWords(count));
    else if (type === "sentences") setOutput(generateSentences(count));
    else setOutput(generateParagraphs(count));
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const save = () => downloadTextReport("lorem-ipsum", "Lorem Ipsum Generator", { Type: type, Count: count }, output);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Tools
        </Link>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Lorem Ipsum Generator</h1>
          <p className="text-slate-500 text-sm mb-6">Generate placeholder text for your designs and layouts.</p>

          <div className="flex flex-col sm:flex-row gap-4 mb-5">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Type</label>
              <div className="grid grid-cols-3 rounded-xl border border-slate-200 overflow-hidden">
                {(["words", "sentences", "paragraphs"] as const).map((t) => (
                  <button key={t} onClick={() => setType(t)}
                    className={`py-2.5 text-sm font-semibold capitalize transition-colors text-center ${
                      type === t ? "bg-violet-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="sm:w-32">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Count</label>
              <input type="number" min="1" max="100" value={count} onChange={(e) => setCount(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 text-center" />
            </div>
          </div>

          <button onClick={generate}
            className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors mb-4">
            <RefreshCw className="w-4 h-4" /> Generate
          </button>

          {output && (
            <>
              <div className="relative">
                <textarea readOnly value={output} rows={8}
                  className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm leading-relaxed resize-none focus:outline-none" />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-3">
                <button onClick={copy}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-violet-50 text-slate-700 hover:text-violet-600 text-sm font-semibold transition-colors border border-slate-200">
                  <Copy className="w-4 h-4" /> {copied ? "Copied!" : "Copy"}
                </button>
                <button onClick={save}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-violet-50 text-slate-700 hover:text-violet-600 text-sm font-semibold transition-colors border border-slate-200">
                  <Download className="w-4 h-4" /> Save
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
