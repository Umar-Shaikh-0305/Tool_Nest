"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getActiveUser, AuthUser } from "@/lib/auth";
import { Lock, ArrowRight, ShieldCheck, UserPlus, LogIn } from "lucide-react";

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const check = () => {
      setUser(getActiveUser());
      setChecked(true);
    };
    check();
    window.addEventListener("toolnest_auth_change", check);
    return () => window.removeEventListener("toolnest_auth_change", check);
  }, []);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
    const signupUrl = `/signup?redirect=${encodeURIComponent(pathname)}`;

    return (
      <div className="min-h-[85vh] bg-slate-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-violet-100 border border-violet-200 flex items-center justify-center mx-auto text-violet-600">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Authentication Required
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Sign In to Access Tools
            </h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Please sign in or create an account to use this tool. Your operations, files, and calculation ledger will be safely stored under your personal ID.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href={loginUrl}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition-all shadow-md active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Continue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={signupUrl}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition-all border border-slate-200"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create New Free Account</span>
            </Link>

            <Link
              href="/"
              className="block text-xs font-medium text-slate-400 hover:text-slate-600 pt-2 transition-colors"
            >
              ← Back to Tools Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
