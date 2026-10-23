import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

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
        <main className="flex-1">{children}</main>
        <footer className="bg-white border-t border-slate-200 py-6 px-4 mt-12">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
            <span className="font-semibold text-slate-700">ToolNest</span>
            <span className="text-center">{new Date().getFullYear()} · Professional browser tools · Isolated history saved under your ID</span>
            <span className="text-slate-400 text-xs">Fast &amp; Secure</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
