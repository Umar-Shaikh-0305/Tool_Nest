import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import ChatbotWidget from "@/components/ChatbotWidget";

export const metadata: Metadata = {
  title: "ToolNest | Free Online Tools",
  description:
    "Free online tools for PDF, images, calculators, converters, generators and more. All tools run securely with isolated history saved under your personal ID.",
  keywords: [
    "free online tools", "pdf tools", "image tools",
    "calculator", "converter", "generator", "toolnest"
  ],
  openGraph: {
    title: "ToolNest | Free Online Tools",
    description: "Free online tools — PDF, images, calculators, converters, and more.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
        <Header />
        <main className="flex-1 pb-16">{children}</main>
        <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2.5 px-4 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm text-slate-500">
            {/* Left: Fast & Secure */}
            <div className="flex items-center gap-1.5 font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-xs shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Fast &amp; Secure</span>
            </div>

            {/* Center: Status / Year & History */}
            <span className="text-center text-slate-500 text-xs hidden md:inline truncate">
              {new Date().getFullYear()} &bull; Professional browser tools &bull; Isolated history saved under your ID
            </span>

            {/* Right: Developed by: Muhammad Umar */}
            <div className="flex items-center gap-1 text-xs text-slate-700 shrink-0">
              <span className="text-slate-500">Developed by:</span>
              <span className="font-bold text-slate-900">Muhammad Umar</span>
            </div>
          </div>
        </footer>
        <ChatbotWidget />
      </body>
    </html>
  );
}
