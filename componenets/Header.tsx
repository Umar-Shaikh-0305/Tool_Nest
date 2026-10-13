"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getActiveUser, logoutUser, AuthUser } from "@/lib/auth";
import { Wrench, Menu, X, User, LogOut, LogIn, UserPlus } from "lucide-react";

const NAV_LINKS = [
  { label: "PDF Tools", href: "/?cat=PDF+Tools" },
  { label: "Image Tools", href: "/?cat=Image+Tools" },
  { label: "Calculators", href: "/?cat=Calculators" },
  { label: "Converters", href: "/?cat=Converters" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const syncUser = () => setUser(getActiveUser());
    syncUser();
    window.addEventListener("toolnest_auth_change", syncUser);
    return () => window.removeEventListener("toolnest_auth_change", syncUser);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-lg"
          onClick={() => setMenuOpen(false)}
        >
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shadow-sm">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">ToolNest</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-violet-600 hover:bg-violet-50 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Authentication Controls */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/account"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-violet-50 text-slate-700 hover:text-violet-700 text-sm font-semibold transition-colors border border-slate-200"
                title="View your saved history"
              >
                <div className="w-6 h-6 rounded-lg bg-violet-600 text-white flex items-center justify-center text-xs font-bold">
                  {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate">{user.name || user.email}</span>
                <span className="text-xs text-violet-600 font-bold hidden md:inline">· History</span>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-slate-700 hover:text-violet-600 hover:bg-slate-50 text-sm font-semibold transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/signup"
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up</span>
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-violet-700 bg-violet-50"
                >
                  <User className="w-4 h-4" />
                  <span>My History ({user.email})</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold text-white bg-violet-600 text-center"
                >
                  Sign Up Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
