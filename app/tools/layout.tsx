"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getActiveUser, loginUser, signupUser, logoutUser, AuthUser } from "@/lib/auth";
import { Lock, ArrowRight, ShieldCheck, UserPlus, LogIn, X, Download, UserCheck, LogOut } from "lucide-react";

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);

  // Auth Modal state for downloads
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // Store the button that was clicked so we can resume download after login
  const pendingButtonRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const check = () => setUser(getActiveUser());
    check();
    window.addEventListener("toolnest_auth_change", check);
    return () => window.removeEventListener("toolnest_auth_change", check);
  }, []);

  // Intercept Download & Save clicks if unauthenticated
  const handleCaptureClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const btn = target.closest("button, a") as HTMLElement | null;
    if (!btn) return;

    // If marked as bypassed, let it execute freely
    if (btn.dataset.authBypassed === "true") {
      delete btn.dataset.authBypassed;
      return;
    }

    const text = (btn.textContent || "").toLowerCase().trim();
    const hasDownloadAttr = btn.hasAttribute("download");

    const isDownloadOrSaveAction =
      hasDownloadAttr ||
      text.includes("download") ||
      text.includes("save result") ||
      text.includes("save report") ||
      text.includes("save pdf") ||
      text.includes("save spec") ||
      text.includes("export") ||
      text.includes("save to history");

    // Don't intercept back buttons, navigation links, or format switcher radios
    const isNavigation = btn.getAttribute("href") === "/" || btn.closest("header") || btn.closest("nav");
    if (isNavigation) return;

    if (isDownloadOrSaveAction) {
      const currentUser = getActiveUser();
      if (!currentUser) {
        // Stop the download from triggering before auth
        e.preventDefault();
        e.stopPropagation();

        pendingButtonRef.current = btn;
        setAuthError("");
        setAuthSuccess("");
        setShowAuthModal(true);
      }
    }
  };

  // Resume download after successful auth or guest choice
  const resumePendingDownload = () => {
    const btn = pendingButtonRef.current;
    setShowAuthModal(false);
    if (btn) {
      btn.dataset.authBypassed = "true";
      setTimeout(() => {
        btn.click();
        pendingButtonRef.current = null;
      }, 100);
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (authMode === "login") {
      const res = loginUser(email, password);
      if (res.success && res.user) {
        setAuthSuccess("Signed in successfully! Downloading your file...");
        setTimeout(() => {
          resumePendingDownload();
        }, 500);
      } else {
        setAuthError(res.error || "Invalid email or password.");
      }
    } else {
      const res = signupUser(email, password, name);
      if (res.success && res.user) {
        setAuthSuccess("Account created successfully! Downloading your file...");
        setTimeout(() => {
          resumePendingDownload();
        }, 500);
      } else {
        setAuthError(res.error || "Failed to create account.");
      }
    }
  };

  const handleGuestDownload = () => {
    resumePendingDownload();
  };

  const handleModalLogout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <div onClickCapture={handleCaptureClick} className="min-h-full">
      {/* Tools are 100% accessible and usable freely without a blocking screen */}
      {children}

      {/* ── SIGN IN / SIGN UP MODAL ON DOWNLOAD ── */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-8 space-y-5 relative">
            
            {/* Close button */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Sign In to Save &amp; Download
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Save your file and keep your history safe under your ID
                </p>
              </div>
            </div>

            {/* If user is currently signed in, show option to continue or switch */}
            {user ? (
              <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Signed in as <strong>{user.email}</strong></span>
                  </div>
                  <button
                    onClick={handleModalLogout}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
                <button
                  onClick={resumePendingDownload}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95 text-sm"
                >
                  Continue &amp; Download File
                </button>
              </div>
            ) : (
              <>
                {/* Mode Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login");
                      setAuthError("");
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      authMode === "login"
                        ? "bg-white text-violet-700 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signup");
                      setAuthError("");
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      authMode === "signup"
                        ? "bg-white text-violet-700 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleAuthSubmit} className="space-y-3 pt-1">
                  {authMode === "signup" && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  {authError && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                      {authError}
                    </div>
                  )}

                  {authSuccess && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
                      {authSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95 text-sm flex items-center justify-center gap-2"
                  >
                    {authMode === "login" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    <span>{authMode === "login" ? "Sign In & Download" : "Create Account & Download"}</span>
                  </button>
                </form>

                {/* Or Continue as Guest */}
                <div className="pt-2 border-t border-slate-100 flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGuestDownload}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline underline-offset-2"
                  >
                    Download as Guest (Without saving history)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
