"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  ArrowLeft,
  User,
  History,
  LogOut,
  ShieldCheck,
  Sparkles,
  FileText,
  Clock,
  Trash2,
} from "lucide-react";

interface HistoryRecord {
  id: string;
  tool_slug: string;
  title: string;
  metadata?: any;
  created_at: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("engineer@toolnest.local");
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    // Load persisted history from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem("toolnest_saved_history") || "[]");
      if (saved && Array.isArray(saved) && saved.length > 0) {
        setHistory(saved);
      } else {
        // Fallback starter records if empty
        setHistory([
          {
            id: "demo-1",
            tool_slug: "image-to-pdf",
            title: "Saved Image to PDF Spec Sheet & Document",
            created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          },
          {
            id: "demo-2",
            tool_slug: "scientific-calculator",
            title: "Saved Scientific Calculation Ledger & Memory",
            created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          },
          {
            id: "demo-3",
            tool_slug: "text-to-image",
            title: "Saved AI Schematic Spec Sheet & High-Res PNG",
            created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
          },
        ]);
      }
    } catch (e) {
      console.warn(e);
    }

    if (isSupabaseConfigured && supabase) {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user?.email) {
          setUserEmail(data.user.email);
        }
      });
    }
  }, []);

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    router.push("/");
  };

  const clearHistory = () => {
    try {
      localStorage.removeItem("toolnest_saved_history");
    } catch (e) {}
    setHistory([]);
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
            Account &amp; History Dashboard
          </h1>
          <p className="font-mono text-xs text-slate-800 dark:text-slate-300 font-medium">
            Persisted execution ledger, tool usage analytics, and saved date-stamped records.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded border border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10 font-mono text-xs flex items-center gap-1.5 transition-colors font-bold"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>SIGN OUT</span>
        </button>
      </div>

      {/* User Status Bar */}
      <div className="p-6 rounded-lg border border-graphite/40 bg-card-bg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blueprint flex items-center justify-center text-signal border border-signal/40">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="font-extrabold text-slate-900 dark:text-paper text-sm">{userEmail}</p>
            <div className="flex items-center gap-2 text-[11px] text-slate-800 dark:text-slate-200 font-semibold">
              <span className="w-2 h-2 rounded-full bg-wire inline-block" />
              <span>TIER: UNLIMITED COMMUNITY (ZERO-COST)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-800 dark:text-slate-200 text-xs font-bold">
          <div>
            <span>DAILY AI QUOTA: </span>
            <strong className="text-signal font-extrabold">UNRESTRICTED</strong>
          </div>
          <span>·</span>
          <div>
            <span>PRIVACY: </span>
            <strong className="text-wire font-extrabold">100% IN-BROWSER</strong>
          </div>
        </div>
      </div>

      {/* History Ledger */}
      <div className="p-6 rounded-lg border border-graphite/40 bg-card-bg space-y-4 font-mono text-xs shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-graphite/30">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-signal" />
            <span className="font-extrabold text-slate-900 dark:text-paper text-sm">SAVED FUNCTION &amp; TOOL RECORDS</span>
          </div>

          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-red-500 hover:underline flex items-center gap-1 text-xs font-bold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12 text-slate-800 dark:text-slate-200 font-medium">
            No history recorded yet. Use the Save / Download option on any tool to record it here.
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((record) => (
              <div
                key={record.id}
                className="p-3.5 rounded border border-graphite/30 hover:border-signal bg-graphite/5 flex items-center justify-between gap-4 transition-all"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blueprint text-paper dark:text-wire text-[10px] font-extrabold">
                      {record.tool_slug.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-slate-800 dark:text-slate-200 font-bold">
                      {new Date(record.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      ·{" "}
                      {new Date(record.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-slate-900 dark:text-paper font-bold text-xs truncate">
                    {record.title}
                  </p>
                </div>

                <Link
                  href={`/tools/${record.tool_slug.replace("-spec", "").replace("-report", "")}`}
                  className="px-3 py-1.5 rounded bg-signal hover:bg-signal-hover text-slate-950 font-extrabold text-xs whitespace-nowrap shadow-sm"
                >
                  Open Tool →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
