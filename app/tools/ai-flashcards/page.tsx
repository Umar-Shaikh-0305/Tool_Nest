"use client";
import { useState } from "react";
import { Brain, ChevronLeft, ChevronRight, Loader2, Sparkles, RotateCcw } from "lucide-react";
import { saveUserHistoryItem } from "@/lib/auth";
import { callAI } from "@/lib/ai-api";

interface Flashcard {
  question: string;
  answer: string;
}

const countOptions = [5, 10, 15, 20];

export default function AiFlashcardsPage() {
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const [count, setCount] = useState(10);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!content.trim()) { setError("Please paste some study material."); return; }
    setError("");
    setCards([]);
    setCurrentIndex(0);
    setFlipped(false);
    setLoading(true);
    try {
      const subjectHint = subject ? ` The subject is: ${subject}.` : "";
      const prompt = `Create ${count} study flashcards from the following content.${subjectHint} Return ONLY a JSON array with objects having 'question' and 'answer' fields:\n\n${content}`;
      const data = await callAI(prompt);

      // Try to parse JSON from the response
      const jsonMatch = data.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("Could not parse flashcards from response");
      const parsed: Flashcard[] = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("No flashcards generated");
      setCards(parsed);
      saveUserHistoryItem({
        toolId: "ai-flashcards",
        toolName: "AI Flashcard Generator",
        summary: `Generated ${parsed.length} flashcards${subject ? ` for ${subject}` : ""}`,
        timestamp: new Date().toISOString(),
      });
    } catch (err: unknown) {
      setError("Could not generate flashcards. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const prev = () => { setCurrentIndex((i) => Math.max(0, i - 1)); setFlipped(false); };
  const next = () => { setCurrentIndex((i) => Math.min(cards.length - 1, i + 1)); setFlipped(false); };
  const progress = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <a href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-violet-600 mb-8 text-sm font-medium transition-colors">
          ← Back to Tools
        </a>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center">
              <Brain className="w-7 h-7 text-violet-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">AI Flashcard Generator</h1>
                <span className="inline-flex items-center gap-1 bg-violet-100 text-violet-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" /> AI Powered
                </span>
              </div>
              <p className="text-slate-500 text-sm">Turn your study material into interactive flashcards</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Study Material</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={7}
              placeholder="Paste your lecture notes, textbook content, or study material here..."
              className="w-full border border-slate-200 rounded-xl p-4 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Subject <span className="text-slate-400 font-normal">(optional)</span></label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Biology, World History" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Flashcards</label>
              <div className="flex gap-2">
                {countOptions.map((n) => (
                  <button key={n} onClick={() => setCount(n)} className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${count === n ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-200 hover:border-violet-400"}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

          <button onClick={generate} disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating Flashcards...</> : <><Brain className="w-5 h-5" /> Generate Flashcards</>}
          </button>

          {cards.length > 0 && (
            <div className="space-y-4">
              {/* Progress */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">Card {currentIndex + 1} of {cards.length}</span>
                <span className="text-violet-600 font-semibold">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>

              {/* Flip Card */}
              <div className="perspective-1000" style={{ perspective: "1000px" }}>
                <div
                  onClick={() => setFlipped((f) => !f)}
                  className="relative w-full cursor-pointer"
                  style={{ height: "240px", transformStyle: "preserve-3d", transition: "transform 0.6s", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
                >
                  {/* Front */}
                  <div className="absolute inset-0 bg-violet-600 rounded-2xl flex flex-col items-center justify-center p-8 text-white" style={{ backfaceVisibility: "hidden" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-3">Question</p>
                    <p className="text-center text-lg font-semibold leading-relaxed">{cards[currentIndex]?.question}</p>
                    <p className="mt-4 text-xs opacity-60">Click to reveal answer</p>
                  </div>
                  {/* Back */}
                  <div className="absolute inset-0 bg-white border-2 border-violet-200 rounded-2xl flex flex-col items-center justify-center p-8" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-violet-500 mb-3">Answer</p>
                    <p className="text-center text-slate-800 font-medium leading-relaxed">{cards[currentIndex]?.answer}</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button onClick={prev} disabled={currentIndex === 0} className="flex items-center gap-2 px-5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:border-violet-400 hover:text-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-sm">
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button onClick={() => { setFlipped(false); setCurrentIndex(0); }} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 font-medium transition-colors">
                  <RotateCcw className="w-4 h-4" /> Restart
                </button>
                <button onClick={next} disabled={currentIndex === cards.length - 1} className="flex items-center gap-2 px-5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:border-violet-400 hover:text-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-sm">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
