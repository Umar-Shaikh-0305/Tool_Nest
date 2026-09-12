"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Copy, Trash2, Check, Clock, Mic, FileDown } from "lucide-react";
import { downloadTextReport } from "@/lib/export-utils";

export default function WordCounterPage() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const raw = text.trim();
    if (!raw) {
      return {
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        readingTimeMinutes: 0,
        speakingTimeMinutes: 0,
        keywords: [] as { word: string; count: number }[],
      };
    }

    const wordsArray = raw.split(/\s+/).filter(Boolean);
    const words = wordsArray.length;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const sentences = raw.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
    const paragraphs = raw.split(/\n+/).filter((p) => p.trim().length > 0).length;

    // Reading time: 200 words / min, Speaking time: 130 words / min
    const readingTimeMinutes = Math.ceil(words / 200);
    const speakingTimeMinutes = Math.ceil(words / 130);

    // Keyword density
    const freqMap: Record<string, number> = {};
    wordsArray.forEach((w) => {
      const clean = w.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (clean.length > 2) {
        freqMap[clean] = (freqMap[clean] || 0) + 1;
      }
    });

    const keywords = Object.entries(freqMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word, count]) => ({ word, count }));

    return {
      words,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      readingTimeMinutes,
      speakingTimeMinutes,
      keywords,
    };
  }, [text]);

  const handleSaveReport = () => {
    const keywordList = stats.keywords.map((k) => `${k.word}: ${k.count}`).join(", ");
    downloadTextReport(
      "word-analysis-report",
      "Word & Text Analyzer",
      {
        "Total Words": stats.words,
        "Total Characters": stats.characters,
        "Characters (No Spaces)": stats.charactersNoSpaces,
        "Sentences": stats.sentences,
        "Paragraphs": stats.paragraphs,
        "Estimated Reading Time": `~${stats.readingTimeMinutes} minute(s)`,
        "Estimated Speaking Time": `~${stats.speakingTimeMinutes} minute(s)`,
        "Top Keywords": keywordList || "None",
      },
      text ? `ANALYZED TEXT SNIPPET:\n${text.slice(0, 3000)}${text.length > 3000 ? "\n...[truncated]" : ""}` : undefined
    );
  };

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-graphite/40 pb-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-800 dark:text-slate-200 hover:text-signal mb-1 transition-colors font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO UTILITY WORKBENCH</span>
          </Link>
          <h1 className="font-display font-extrabold text-2xl text-slate-900 dark:text-paper">
            Word &amp; Text Analyzer
          </h1>
          <p className="font-mono text-xs text-slate-800 dark:text-slate-300 font-medium">
            Real-time lexical density, readability timing, character distributions, and token analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={handleSaveReport}
            disabled={!text}
            className="px-3.5 py-1.5 rounded bg-signal hover:bg-signal-hover text-slate-950 font-bold flex items-center gap-1.5 disabled:opacity-30 transition-colors shadow-sm"
            title="Download full lexical analysis report"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>SAVE / DOWNLOAD REPORT</span>
          </button>

          <button
            onClick={handleCopy}
            disabled={!text}
            className="px-3 py-1.5 rounded border border-graphite/40 hover:border-signal text-slate-900 dark:text-slate-100 font-bold flex items-center gap-1 disabled:opacity-30 bg-card-bg"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-wire" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Text"}</span>
          </button>
          <button
            onClick={() => setText("")}
            disabled={!text}
            className="px-3 py-1.5 rounded border border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10 flex items-center gap-1 disabled:opacity-30 font-bold bg-card-bg"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 rounded-lg border border-graphite/30 bg-card-bg text-center font-mono">
          <span className="text-[10px] text-graphite block">WORDS</span>
          <span className="text-xl font-bold text-signal">{stats.words}</span>
        </div>
        <div className="p-3 rounded-lg border border-graphite/30 bg-card-bg text-center font-mono">
          <span className="text-[10px] text-graphite block">CHARS</span>
          <span className="text-xl font-bold text-ink dark:text-paper">{stats.characters}</span>
        </div>
        <div className="p-3 rounded-lg border border-graphite/30 bg-card-bg text-center font-mono">
          <span className="text-[10px] text-graphite block">NO SPACES</span>
          <span className="text-xl font-bold text-ink dark:text-paper">{stats.charactersNoSpaces}</span>
        </div>
        <div className="p-3 rounded-lg border border-graphite/30 bg-card-bg text-center font-mono">
          <span className="text-[10px] text-graphite block">SENTENCES</span>
          <span className="text-xl font-bold text-ink dark:text-paper">{stats.sentences}</span>
        </div>
        <div className="p-3 rounded-lg border border-graphite/30 bg-card-bg text-center font-mono">
          <span className="text-[10px] text-graphite block">PARAGRAPHS</span>
          <span className="text-xl font-bold text-ink dark:text-paper">{stats.paragraphs}</span>
        </div>
        <div className="p-3 rounded-lg border border-graphite/30 bg-card-bg text-center font-mono">
          <span className="text-[10px] text-graphite block">READ TIME</span>
          <span className="text-xl font-bold text-wire">~{stats.readingTimeMinutes}m</span>
        </div>
      </div>

      {/* Main Text Editor & Keywords */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-9">
          <textarea
            rows={14}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or write your essay, technical document, or code snippet here for live lexical analysis..."
            className="w-full p-4 rounded-lg border border-graphite/30 bg-card-bg text-ink dark:text-paper outline-none focus:border-signal font-mono text-xs leading-relaxed resize-none shadow-sm"
          />
        </div>

        {/* Keywords side panel */}
        <div className="lg:col-span-3 p-4 rounded-lg border border-graphite/30 bg-card-bg space-y-3 font-mono text-xs">
          <span className="font-bold text-ink dark:text-paper block pb-2 border-b border-graphite/20">
            TOP KEYWORDS
          </span>
          {stats.keywords.length === 0 ? (
            <p className="text-graphite text-[11px]">Type text to calculate frequency.</p>
          ) : (
            <div className="space-y-1.5">
              {stats.keywords.map((kw, i) => (
                <div key={i} className="flex items-center justify-between text-[11px]">
                  <span className="text-ink dark:text-paper">{kw.word}</span>
                  <span className="px-1.5 py-0.2 rounded bg-signal/15 text-signal font-bold">
                    {kw.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
