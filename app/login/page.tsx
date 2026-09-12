"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { ArrowLeft, Lock, Mail, Shield, AlertCircle, Check } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      // Demo simulated login
      setTimeout(() => {
        setIsLoading(false);
        setSuccess("Demo mode: Supabase not configured in .env.local. Simulating login...");
        setTimeout(() => router.push("/account"), 1000);
      }, 600);
      return;
    }

    try {
      const { error: authErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authErr) {
        throw authErr;
      }

      setSuccess("Authenticated! Redirecting to account...");
      router.push("/account");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured || !supabase) {
      alert("Google OAuth requires configuring NEXT_PUBLIC_SUPABASE_URL and Google OAuth credentials in Supabase.");
      return;
    }

    try {
      const { error: authErr } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/account`,
        },
      });
      if (authErr) throw authErr;
    } catch (err: any) {
      setError(err.message || "Google sign in error");
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
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="font-display font-bold text-xl text-ink dark:text-paper">
            ToolNest Workbench Access
          </h1>
          <p className="text-graphite text-[11px]">
            Sign in to access your synchronized conversion history and elevated AI generation limits.
          </p>
        </div>

        {/* Supabase status notice if unconfigured */}
        {!isSupabaseConfigured && (
          <div className="p-3 rounded bg-blueprint/10 border border-blueprint/20 text-[11px] text-blueprint dark:text-wire space-y-1">
            <p className="font-bold">Dev Sandbox Notice:</p>
            <p>
              Supabase keys are not set in <code>.env.local</code>. Logging in will grant instant demo access.
            </p>
          </div>
        )}

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

        <form onSubmit={handleEmailLogin} className="space-y-4">
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
            <label className="text-graphite font-bold block">PASSWORD</label>
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded bg-signal hover:bg-signal-hover text-ink font-bold font-mono text-xs shadow-sm transition-colors disabled:opacity-50"
          >
            {isLoading ? "AUTHENTICATING..." : "SIGN IN WITH EMAIL"}
          </button>
        </form>

        <div className="relative flex items-center justify-center py-2">
          <div className="border-t border-graphite/20 w-full" />
          <span className="bg-card-bg px-2 text-[10px] text-graphite absolute">OR</span>
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full py-2 rounded border border-graphite/30 hover:border-signal text-ink dark:text-paper hover:text-signal transition-colors flex items-center justify-center gap-2"
        >
          <span>Continue with Google OAuth</span>
        </button>

        <div className="text-center text-[11px] text-graphite pt-2">
          Don&apos;t have an account yet?{" "}
          <Link href="/signup" className="text-signal hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
