"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signupUser } from "@/lib/auth";
import { ArrowLeft, Lock, Mail, User, UserPlus, AlertCircle, Check } from "lucide-react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setIsLoading(true);
    const res = signupUser(email, password, name);

    if (!res.success) {
      setError(res.error || "Failed to create account");
      setIsLoading(false);
      return;
    }

    setSuccess("Account created successfully! Redirecting...");
    setTimeout(() => {
      router.push(redirectUrl);
    }, 600);
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tools</span>
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto text-violet-600 shadow-inner">
              <UserPlus className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Create Your Account
            </h1>
            <p className="text-sm text-slate-500">
              Free registration to securely store and access your tool history.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2.5">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-700 tracking-wider block">
                Your Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Smith"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-700 tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-700 tracking-wider block">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 4 characters"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-700 tracking-wider block">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-semibold text-sm transition-all shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isLoading ? "Creating Account..." : "Create Account"}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center text-sm text-slate-500">
            Already registered?{" "}
            <Link
              href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
              className="text-violet-600 font-bold hover:underline"
            >
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <SignupForm />
    </Suspense>
  );
}
