"use client";
import React, { useState, useMemo, useEffect } from "react";
import ToolCard from "@/components/ToolCard";
import { TOOLS_REGISTRY, TOOLS_CATEGORIES } from "@/lib/tools-data";
import { Search, ShieldCheck, Lock, User, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { getActiveUser, AuthUser } from "@/lib/auth";

const CATEGORY_EMOJIS: Record<string, string> = {
  "All": "🧰",
  "Image Tools": "🖼️",
  "PDF Tools": "📄",
  "Calculators": "🔢",
  "Converters": "🔄",
  "Generators": "✨",
  "Text Tools": "📝",
  "Writing Tools": "✍️",
  "Fun Tools": "🎲",
};

function HomeContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const syncUser = () => setUser(getActiveUser());
    syncUser();
    window.addEventListener("toolnest_auth_change", syncUser);
    return () => window.removeEventListener("toolnest_auth_change", syncUser);
  }, []);

  useEffect(() => {
    const cat = searchParams.get("cat");
    if (cat && TOOLS_CATEGORIES.includes(cat as any)) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  const filteredTools = useMemo(() => {
    return TOOLS_REGISTRY.filter((tool) => {
      const matchesCategory = selectedCategory === "All" || tool.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.shortDescription.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 text-center">
          {user ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-800 text-xs font-semibold mb-6 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-violet-600" />
              <span>Signed In: <strong>{user.name || user.email}</strong> · History Isolated &amp; Saved</span>
              <Link href="/account" className="ml-1 underline text-violet-700 hover:text-violet-900 font-bold">
                My History →
              </Link>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold mb-6">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>Sign In Required to Run Tools · History Preserved Under Your ID</span>
              <Link href="/login" className="ml-1 underline text-violet-700 hover:text-violet-900 font-bold">
                Sign In
              </Link>
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
            Free Online Tools<br className="hidden sm:block" />
            <span className="text-violet-600"> All in One Place</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            PDF tools, image editors, calculators, converters and more — 100% private in-browser processing with your calculation &amp; export history safely tied to your personal user account.
          </p>

          {/* Big Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools... (pdf, qr code, calculator)"
              className="w-full pl-12 pr-4 py-3.5 sm:py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-base focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 shadow-sm transition-all"
            />
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {TOOLS_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
                  active
                    ? "bg-violet-600 text-white shadow-md"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-violet-300 hover:text-violet-600"
                }`}
              >
                <span>{CATEGORY_EMOJIS[cat] ?? "🔧"}</span>
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{filteredTools.length}</span> of {TOOLS_REGISTRY.length} tools
            {selectedCategory !== "All" && <> in <span className="text-violet-600 font-semibold">{selectedCategory}</span></>}
          </p>
          {(searchQuery || selectedCategory !== "All") && (
            <button
              onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
              className="text-sm text-violet-600 hover:text-violet-800 font-medium underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Tool Grid */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-lg font-semibold text-slate-700">No tools found</p>
            <p className="text-sm text-slate-400 mt-1 mb-4">Try a different search term or category</p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
              className="px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors"
            >
              Show all tools
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><span className="text-slate-400">Loading...</span></div>}>
      <HomeContent />
    </Suspense>
  );
}
