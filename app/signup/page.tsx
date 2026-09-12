"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { ArrowLeft, Lock, Mail, UserPlus, AlertCircle, Check } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      setTimeout(() => {
        setIsLoading(false);
        setSuccess("Demo mode: Account registered in sandbox! Redirecting...");
        setTimeout(() => router.push("/account"), 1200);
      }, 700);
      return;
    }

    try {
      const { error: authErr } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authErr) throw authErr;

      setSuccess("Account created! Check your email to confirm registration.");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-graphite hover:text-signal transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>BACK TO UTILITY WORKBENCH</span>
      </Link>

      <div className="p-6 rounded-xl border border-graphite/30 bg-card-bg space-y-5 shadow-sm font-mono text-xs">
        <div className="space-y-1 text-center">
          <div className="w-10 h-10 rounded-full bg-blueprint flex items-center justify-center mx-auto text-signal border border-signal/50 mb-2">
            <UserPlus className="w-5 h-5" />
          </div>
          <h1 className="font-display font-bold text-xl text-ink dark:text-paper">
            Create ToolNest Credentials
          </h1>
          <p className="text-graphite text-[11px]">
            Unlock saved execution history, custom tool shortcuts, and elevated AI quotas.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-500 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded bg-wire/10 border border-wire/30 text-wire-dark dark:text-wire flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1">
            <label className="text-graphite font-bold block">EMAIL ADDRESS</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-graphite" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineer@domain.com"
                className="w-full pl-9 pr-3 py-2 rounded bg-paper dark:bg-ink border border-graphite/30 outline-none focus:border-signal text-ink dark:text-paper"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-graphite font-bold block">PASSWORD (MIN 6 CHARS)</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-graphite" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded bg-paper dark:bg-ink border border-graphite/30 outline-none focus:border-signal text-ink dark:text-paper"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-graphite font-bold block">CONFIRM PASSWORD</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-graphite" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded bg-paper dark:bg-ink border border-graphite/30 outline-none focus:border-signal text-ink dark:text-paper"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded bg-signal hover:bg-signal-hover text-ink font-bold font-mono text-xs shadow-sm transition-colors disabled:opacity-50"
          >
            {isLoading ? "CREATING PROFILE..." : "CREATE FREE ACCOUNT"}
          </button>
        </form>

        <div className="text-center text-[11px] text-graphite pt-2">
          Already registered?{" "}
          <Link href="/login" className="text-signal hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
