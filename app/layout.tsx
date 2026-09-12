import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import ChatbotWidget from "@/components/ChatbotWidget";

export const metadata: Metadata = {
  title: "ToolNest | Zero-Cost Technical Utility Workbench",
  description:
    "Free multi-purpose utility hub running 100% on client-side and free-tier infrastructure. PDF tools, image studio, AI generators, scientific calculator, converters, and engineering utilities.",
  keywords: [
    "utility workbench",
    "pdf merge",
    "image to pdf",
    "scientific calculator",
    "storage converter",
    "background remover",
    "free online tools",
  ],
  authors: [{ name: "ToolNest Engineering" }],
  openGraph: {
    title: "ToolNest | Technical Utility Workbench",
    description: "Free multi-purpose utility hub. Zero cost, client-side execution, no paywalls.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased font-sans selection:bg-signal selection:text-ink">
        <Header />
        <main className="flex-1">{children}</main>

        {/* Global Blueprint Footer */}
        <footer className="border-t border-graphite/30 bg-paper dark:bg-ink py-8 px-4 text-center font-mono text-xs text-graphite dark:text-gray-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-wire inline-block" />
              <span>TOOLNEST INFRASTRUCTURE: 100% ZERO-COST TIER</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span>POWERED BY NEXT.JS + SUPABASE + PUTER.JS + POLLINATIONS</span>
              <span>·</span>
              <span>NO PAID APIS</span>
            </div>
          </div>
        </footer>

        {/* Global AI Assistant Drawer */}
        <ChatbotWidget />
      </body>
    </html>
  );
}
