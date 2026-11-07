"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getActiveUser, logoutUser, getUserHistory, clearUserHistory, AuthUser } from "@/lib/auth";
import {
  ArrowLeft,
  User,
  History,
  LogOut,
  ShieldCheck,
  Sparkles,
  Trash2,
  Lock,
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const active = getActiveUser();
    if (!active) {
      router.push("/login?redirect=/account");
      return;
    }
    setUser(active);
    const records = getUserHistory(active.email);
    setHistory(records);
    setLoaded(true);
  }, [router]);

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  const handleClearHistory = () => {
    if (!user) return;
    if (confirm("Are you sure you want to clear your saved history?")) {
      clearUserHistory(user.email);
      setHistory([]);
    }
  };

  if (!loaded || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 mb-1.5 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Tools</span>
            </Link>
            <h1 className="font-bold text-2xl sm:text-3xl text-slate-900">
              Account &amp; History Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Your personal calculation ledger and generated records safely stored under your ID.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* User Identity Card */}
        <div className="p-6 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-700 text-xl font-bold shrink-0 shadow-inner">
              {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-slate-900 text-lg">{user.name || "ToolNest User"}</p>
                <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-extrabold uppercase">
                  Verified ID
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium">{user.email}</p>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">User ID: {user.id}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600 border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto">
            <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-normal">Stored Records: </span>
              <span className="text-violet-700 font-bold">{history.length}</span>
            </div>
            <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-normal">Security: </span>
              <span className="text-emerald-600 font-bold">Isolated to ID</span>
            </div>
          </div>
        </div>

        {/* History Ledger */}
        <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-violet-600" />
              <span className="font-bold text-slate-900 text-base">
                Your Saved History ({history.length})
              </span>
            </div>

            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-red-500 hover:text-red-700 flex items-center gap-1.5 text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <History className="w-6 h-6" />
              </div>
              <p className="font-semibold text-slate-600">No records saved yet under this account.</p>
              <p className="text-xs text-slate-400">
                Whenever you use a tool and click &quot;Save Results&quot; or download an export, it will be securely recorded here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((record) => (
                <div
                  key={record.id}
                  className="p-4 rounded-xl border border-slate-100 hover:border-violet-200 bg-slate-50/80 hover:bg-violet-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[11px] font-bold uppercase">
                        {record.tool_slug.replace("-spec", "").replace("-report", "")}
                      </span>
                      <span className="text-xs text-slate-400">
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
                    <p className="text-slate-900 font-semibold text-sm truncate">
                      {record.title}
                    </p>
                  </div>

                  <Link
                    href={`/tools/${record.tool_slug.replace("-spec", "").replace("-report", "")}`}
                    className="self-start sm:self-auto px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs whitespace-nowrap shadow-sm transition-colors"
                  >
                    Open Tool →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
