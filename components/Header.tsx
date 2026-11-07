"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getActiveUser, logoutUser, AuthUser } from "@/lib/auth";
import {
  Wrench, Menu, X, User, LogOut, LogIn, UserPlus, ChevronDown,
  FileText, Presentation, Table, Image as ImageIcon,
  RotateCw, Stamp, PenTool, PenLine, FileDown, Layers,
  Scissors, Sparkles, SpellCheck, RefreshCw, BookOpen,
  Mail, FileCheck, Layers as LayersIcon, Quote, Languages,
  NotebookPen, Calculator, Percent, Activity, Calendar,
  HardDrive, Scale, Binary, QrCode, KeyRound, Palette,
  Grid
} from "lucide-react";

interface SubItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  badge?: string;
}

interface NavSection {
  title: string;
  items: SubItem[];
}

interface MegaMenu {
  id: string;
  label: string;
  sections: NavSection[];
}

const MEGA_MENUS: MegaMenu[] = [
  {
    id: "all-tools",
    label: "All Tools",
    sections: [
      {
        title: "POPULAR PDF TOOLS",
        items: [
          { name: "PDF to Word", href: "/tools/pdf-to-word", icon: FileText, iconColor: "text-blue-600" },
          { name: "Word to PDF", href: "/tools/word-to-pdf", icon: FileText, iconColor: "text-blue-500" },
          { name: "Compress PDF", href: "/tools/pdf-compress", icon: FileDown, iconColor: "text-red-500" },
          { name: "Merge & Split PDF", href: "/tools/pdf-merge-split", icon: Layers, iconColor: "text-violet-600" },
          { name: "Sign PDF", href: "/tools/sign-pdf", icon: PenTool, iconColor: "text-teal-600" },
        ],
      },
      {
        title: "AI WORKBENCH",
        items: [
          { name: "AI Essay Writer", href: "/tools/ai-essay-writer", icon: BookOpen, iconColor: "text-violet-600", badge: "AI" },
          { name: "AI Email Writer", href: "/tools/ai-email-writer", icon: Mail, iconColor: "text-blue-600", badge: "AI" },
          { name: "AI Summarizer", href: "/tools/ai-summarizer", icon: Sparkles, iconColor: "text-amber-600", badge: "AI" },
          { name: "AI Grammar Checker", href: "/tools/ai-grammar-checker", icon: SpellCheck, iconColor: "text-emerald-600", badge: "AI" },
          { name: "AI Flashcards", href: "/tools/ai-flashcards", icon: LayersIcon, iconColor: "text-indigo-600", badge: "AI" },
        ],
      },
      {
        title: "IMAGE TOOLS",
        items: [
          { name: "Background Remover", href: "/tools/background-remover", icon: Scissors, iconColor: "text-rose-600" },
          { name: "Image Compressor", href: "/tools/image-compressor", icon: FileDown, iconColor: "text-sky-600" },
          { name: "JPG to PDF", href: "/tools/jpg-to-pdf", icon: ImageIcon, iconColor: "text-purple-600" },
          { name: "AI Image Generator", href: "/tools/text-to-image", icon: Sparkles, iconColor: "text-fuchsia-600", badge: "AI" },
        ],
      },
      {
        title: "CALCULATORS & CONVERTERS",
        items: [
          { name: "Scientific Calculator", href: "/tools/scientific-calculator", icon: Calculator, iconColor: "text-emerald-600" },
          { name: "Percentage Calculator", href: "/tools/percentage-calculator", icon: Percent, iconColor: "text-emerald-600" },
          { name: "Storage Converter", href: "/tools/storage-converter", icon: HardDrive, iconColor: "text-amber-600" },
          { name: "QR Code Generator", href: "/tools/qr-code-generator", icon: QrCode, iconColor: "text-violet-600" },
        ],
      },
    ],
  },
  {
    id: "pdf",
    label: "PDF Tools",
    sections: [
      {
        title: "CONVERT TO PDF",
        items: [
          { name: "Word to PDF", href: "/tools/word-to-pdf", icon: FileText, iconColor: "text-blue-500" },
          { name: "PowerPoint to PDF", href: "/tools/powerpoint-to-pdf", icon: Presentation, iconColor: "text-orange-500" },
          { name: "Excel to PDF", href: "/tools/excel-to-pdf", icon: Table, iconColor: "text-emerald-500" },
          { name: "JPG to PDF", href: "/tools/jpg-to-pdf", icon: ImageIcon, iconColor: "text-amber-500" },
          { name: "Image to PDF", href: "/tools/image-to-pdf", icon: ImageIcon, iconColor: "text-purple-500" },
        ],
      },
      {
        title: "CONVERT FROM PDF",
        items: [
          { name: "PDF to Word", href: "/tools/pdf-to-word", icon: FileText, iconColor: "text-blue-600" },
          { name: "PDF to Excel", href: "/tools/pdf-to-excel", icon: Table, iconColor: "text-emerald-600" },
          { name: "PDF to PowerPoint", href: "/tools/pdf-to-powerpoint", icon: Presentation, iconColor: "text-orange-600" },
          { name: "PDF to JPG", href: "/tools/pdf-to-jpg", icon: ImageIcon, iconColor: "text-amber-600" },
        ],
      },
      {
        title: "EDIT PDF",
        items: [
          { name: "Rotate PDF", href: "/tools/rotate-pdf", icon: RotateCw, iconColor: "text-purple-600" },
          { name: "Edit PDF", href: "/tools/edit-pdf", icon: PenLine, iconColor: "text-indigo-600" },
          { name: "Add Watermark", href: "/tools/watermark-pdf", icon: Stamp, iconColor: "text-rose-600" },
          { name: "Merge & Split PDF", href: "/tools/pdf-merge-split", icon: Layers, iconColor: "text-violet-600" },
        ],
      },
      {
        title: "PDF SECURITY & OPTIMIZE",
        items: [
          { name: "Sign PDF", href: "/tools/sign-pdf", icon: PenTool, iconColor: "text-teal-600" },
          { name: "Compress PDF", href: "/tools/pdf-compress", icon: FileDown, iconColor: "text-red-500" },
        ],
      },
    ],
  },
  {
    id: "ai",
    label: "AI Tools",
    sections: [
      {
        title: "STUDENT ESSENTIALS",
        items: [
          { name: "AI Essay Writer", href: "/tools/ai-essay-writer", icon: BookOpen, iconColor: "text-violet-600", badge: "AI" },
          { name: "AI Flashcards", href: "/tools/ai-flashcards", icon: LayersIcon, iconColor: "text-indigo-600", badge: "AI" },
          { name: "AI Study Notes", href: "/tools/ai-study-notes", icon: NotebookPen, iconColor: "text-purple-600", badge: "AI" },
          { name: "AI Citation Maker", href: "/tools/ai-citation", icon: Quote, iconColor: "text-pink-600", badge: "AI" },
        ],
      },
      {
        title: "OFFICE & PRODUCTIVITY",
        items: [
          { name: "AI Email Writer", href: "/tools/ai-email-writer", icon: Mail, iconColor: "text-blue-600", badge: "AI" },
          { name: "AI Cover Letter", href: "/tools/ai-cover-letter", icon: FileCheck, iconColor: "text-teal-600", badge: "AI" },
          { name: "AI Text Summarizer", href: "/tools/ai-summarizer", icon: Sparkles, iconColor: "text-amber-600", badge: "AI" },
          { name: "AI Grammar Checker", href: "/tools/ai-grammar-checker", icon: SpellCheck, iconColor: "text-emerald-600", badge: "AI" },
        ],
      },
      {
        title: "WRITING & TRANSLATION",
        items: [
          { name: "AI Paraphraser", href: "/tools/ai-paraphraser", icon: RefreshCw, iconColor: "text-cyan-600", badge: "AI" },
          { name: "AI Translator", href: "/tools/ai-translator", icon: Languages, iconColor: "text-sky-600", badge: "AI" },
          { name: "AI Image Generator", href: "/tools/text-to-image", icon: Sparkles, iconColor: "text-fuchsia-600", badge: "AI" },
        ],
      },
    ],
  },
  {
    id: "utilities",
    label: "Calculators & Converters",
    sections: [
      {
        title: "CALCULATORS",
        items: [
          { name: "Scientific Calculator", href: "/tools/scientific-calculator", icon: Calculator, iconColor: "text-emerald-600" },
          { name: "Percentage Calculator", href: "/tools/percentage-calculator", icon: Percent, iconColor: "text-emerald-600" },
          { name: "BMI Calculator", href: "/tools/bmi-calculator", icon: Activity, iconColor: "text-teal-600" },
          { name: "Age Calculator", href: "/tools/age-calculator", icon: Calendar, iconColor: "text-cyan-600" },
        ],
      },
      {
        title: "CONVERTERS",
        items: [
          { name: "Storage Converter", href: "/tools/storage-converter", icon: HardDrive, iconColor: "text-amber-600" },
          { name: "Unit Converter", href: "/tools/unit-converter", icon: Scale, iconColor: "text-amber-600" },
          { name: "Base64 Encoder/Decoder", href: "/tools/base64-converter", icon: Binary, iconColor: "text-orange-600" },
        ],
      },
      {
        title: "IMAGE TOOLS & GENERATORS",
        items: [
          { name: "Background Remover", href: "/tools/background-remover", icon: Scissors, iconColor: "text-rose-600" },
          { name: "Image Compressor", href: "/tools/image-compressor", icon: FileDown, iconColor: "text-sky-600" },
          { name: "QR Code Generator", href: "/tools/qr-code-generator", icon: QrCode, iconColor: "text-violet-600" },
          { name: "Password Generator", href: "/tools/password-generator", icon: KeyRound, iconColor: "text-indigo-600" },
        ],
      },
    ],
  },
];

export default function Header() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncUser = () => setUser(getActiveUser());
    syncUser();
    window.addEventListener("toolnest_auth_change", syncUser);
    return () => window.removeEventListener("toolnest_auth_change", syncUser);
  }, []);

  // Handle hover enter with immediate open
  const handleMouseEnter = (menuId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveMenu(menuId);
  };

  // Handle hover leave with smooth delay so user can comfortably move mouse into dropdown
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 180);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setMenuOpen(false);
  };

  return (
    <header
      className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm"
      ref={navContainerRef}
      onMouseLeave={handleMouseLeave}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-lg"
          onClick={() => {
            setMenuOpen(false);
            setActiveMenu(null);
          }}
        >
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shadow-sm">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">ToolNest</span>
        </Link>

        {/* Desktop Navigation: "All Tools" on the extreme left, followed by specific menus */}
        <nav className="hidden md:flex items-center gap-1">
          {MEGA_MENUS.map((menu) => {
            const isOpen = activeMenu === menu.id;
            return (
              <div
                key={menu.id}
                className="relative py-2"
                onMouseEnter={() => handleMouseEnter(menu.id)}
              >
                <button
                  type="button"
                  onClick={() => setActiveMenu(isOpen ? null : menu.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isOpen
                      ? "text-violet-700 bg-violet-50 shadow-sm"
                      : "text-slate-700 hover:text-violet-600 hover:bg-slate-50"
                  }`}
                >
                  {menu.id === "all-tools" && <Grid className="w-4 h-4 text-violet-600" />}
                  <span>{menu.label}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-violet-600" : "text-slate-400"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </nav>

        {/* Right Authentication Controls */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/account"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-violet-50 text-slate-700 hover:text-violet-700 text-sm font-semibold transition-colors border border-slate-200"
                title="View your saved history"
                onClick={() => setActiveMenu(null)}
              >
                <div className="w-6 h-6 rounded-lg bg-violet-600 text-white flex items-center justify-center text-xs font-bold">
                  {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate">{user.name || user.email}</span>
                <span className="text-xs text-violet-600 font-bold hidden md:inline">&bull; History</span>
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

      {/* FULL-WIDTH TABULAR MEGA DROPDOWN (Hover-Activated) */}
      {activeMenu && (
        <div
          className="hidden md:block absolute left-0 right-0 top-16 bg-white border-b border-slate-200 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150"
          onMouseEnter={() => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
          }}
          onMouseLeave={handleMouseLeave}
        >
          <div className="max-w-7xl mx-auto px-6 py-8">
            {MEGA_MENUS.find((m) => m.id === activeMenu)?.sections && (
              <div
                className={`grid gap-8 ${
                  MEGA_MENUS.find((m) => m.id === activeMenu)?.sections.length === 4
                    ? "grid-cols-4"
                    : "grid-cols-3"
                }`}
              >
                {MEGA_MENUS.find((m) => m.id === activeMenu)?.sections.map((section) => (
                  <div key={section.title} className="space-y-4">
                    {/* Column Heading */}
                    <h4 className="text-xs font-black tracking-wider text-slate-400 uppercase pb-2 border-b border-slate-100">
                      {section.title}
                    </h4>

                    {/* Links */}
                    <ul className="space-y-1.5">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              onClick={() => setActiveMenu(null)}
                              className="group flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-violet-50 flex items-center justify-center transition-colors">
                                  <Icon className={`w-4 h-4 ${item.iconColor}`} />
                                </div>
                                <span className="text-sm font-semibold text-slate-700 group-hover:text-violet-700 transition-colors">
                                  {item.name}
                                </span>
                              </div>
                              {item.badge && (
                                <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Nav Drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {MEGA_MENUS.map((menu) => (
            <div key={menu.id} className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-600 block px-2">
                {menu.label}
              </span>
              <div className="space-y-1 pl-2">
                {menu.sections.flatMap((s) => s.items).slice(0, 5).map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-600"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
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
