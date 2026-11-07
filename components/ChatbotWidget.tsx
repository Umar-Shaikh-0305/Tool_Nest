"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  X,
  Send,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react";
import { TOOLS_REGISTRY, ToolItem } from "@/lib/tools-data";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  suggestedTools?: ToolItem[];
}

// Cleans markdown asterisks and symbols so plain direct text is shown
function cleanText(str: string): string {
  if (!str) return "";
  return str
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .trim();
}

// Highly detailed, friendly 3D-styled Robot Avatar SVG
export function RoboAvatar({ className = "w-10 h-10", glow = true }: { className?: string; glow?: boolean }) {
  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}>
      <svg
        viewBox="0 0 72 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="roboBody" x1="12" y1="14" x2="60" y2="62" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7C3AED" />
            <stop offset="0.5" stopColor="#6366F1" />
            <stop offset="1" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id="roboScreen" x1="18" y1="24" x2="54" y2="52" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0F172A" />
            <stop offset="1" stopColor="#1E293B" />
          </linearGradient>
          <linearGradient id="eyeGlow" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#38BDF8" />
            <stop offset="1" stopColor="#06B6D4" />
          </linearGradient>
          <linearGradient id="earPlate" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#A78BFA" />
            <stop offset="1" stopColor="#6D28D9" />
          </linearGradient>
          <filter id="neon" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Antenna Stem */}
        <rect x="34" y="6" width="4" height="10" rx="2" fill="#8B5CF6" />
        
        {/* Antenna Bulb with Neon Glow */}
        <circle cx="36" cy="6" r="4.5" fill="#38BDF8" filter="url(#neon)" />
        <circle cx="36" cy="6" r="2.5" fill="#FFFFFF" />

        {/* Left Ear Muff */}
        <rect x="7" y="27" width="6" height="18" rx="3" fill="url(#earPlate)" />
        <rect x="10" y="30" width="2" height="12" rx="1" fill="#DDD6FE" />

        {/* Right Ear Muff */}
        <rect x="59" y="27" width="6" height="18" rx="3" fill="url(#earPlate)" />
        <rect x="60" y="30" width="2" height="12" rx="1" fill="#DDD6FE" />

        {/* Head Shell */}
        <rect x="12" y="16" width="48" height="42" rx="14" fill="url(#roboBody)" stroke="#DDD6FE" strokeWidth="1.5" />

        {/* Face Visor Display */}
        <rect x="17" y="22" width="38" height="30" rx="9" fill="url(#roboScreen)" stroke="#475569" strokeWidth="1" />

        {/* Left Glowing Eye */}
        <circle cx="28" cy="34" r="4.5" fill="url(#eyeGlow)" filter="url(#neon)" />
        <circle cx="27" cy="33" r="1.5" fill="#FFFFFF" />

        {/* Right Glowing Eye */}
        <circle cx="44" cy="34" r="4.5" fill="url(#eyeGlow)" filter="url(#neon)" />
        <circle cx="43" cy="33" r="1.5" fill="#FFFFFF" />

        {/* Robot Smile */}
        <path
          d="M30 43.5C32 46.5 40 46.5 42 43.5"
          stroke="#38BDF8"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Blush Dots */}
        <circle cx="21" cy="41" r="2" fill="#F43F5E" opacity="0.6" />
        <circle cx="51" cy="41" r="2" fill="#F43F5E" opacity="0.6" />

        {/* Neck collar */}
        <rect x="28" y="58" width="16" height="5" rx="2.5" fill="#6366F1" />
      </svg>
      {glow && (
        <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white" />
        </span>
      )}
    </div>
  );
}

const QUICK_PROMPTS = [
  "How many PDF tools do we have?",
  "What tools are best for students?",
  "How to convert PDF to Word?",
  "What tools are best for office work?",
];

// Helper to look up a tool by slug
function getToolBySlug(slug: string): ToolItem | undefined {
  return TOOLS_REGISTRY.find((t) => t.slug === slug);
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPREHENSIVE INTELLIGENCE ENGINE FOR TOOLNEST
// Gives distinct, accurate, and non-repetitive answers for any question
// ─────────────────────────────────────────────────────────────────────────────
function generateAccurateToolNestResponse(rawQuery: string): { text: string; tools?: ToolItem[] } {
  const q = rawQuery.toLowerCase().trim();

  // 1. GREETINGS & CASUAL CONVERSATION
  if (/^(hi|hello|hey|hola|greetings|good morning|good afternoon|good evening|yo)\b/i.test(q)) {
    return {
      text: "Hello! I am your ToolNest AI Assistant. I have full knowledge of all 48 tools on our website.\n\nWhether you need to convert files (PDF, Word, Excel, PowerPoint), write essays or emails with AI, calculate values, or format data, ask me anything!",
      tools: [getToolBySlug("pdf-to-word"), getToolBySlug("ai-essay-writer"), getToolBySlug("image-to-pdf")].filter(Boolean) as ToolItem[],
    };
  }

  if (/^(thanks|thank you|thx|great|awesome|perfect|good job|nice)\b/i.test(q)) {
    return {
      text: "You are very welcome! If you have any other questions about ToolNest or need help with a document or calculation, I am always here to assist.",
    };
  }

  if (q.includes("who are you") || q.includes("your name") || q === "what are you") {
    return {
      text: "I am Robo, the official AI Assistant for ToolNest. I know everything about our 48 online tools and can guide you with step-by-step instructions, recommend tools, or help solve your questions.",
    };
  }

  if (q === "what is toolnest" || q.includes("about toolnest") || q.includes("what does toolnest do")) {
    return {
      text: "ToolNest is an all-in-one free online utility platform featuring 48 tools across 9 categories. It lets you convert PDF, Word, Excel, and PowerPoint files, use AI writing tools, calculate mathematical formulas, format text, and optimize images — all running directly in your browser with zero latency and full privacy.",
      tools: [getToolBySlug("pdf-to-word"), getToolBySlug("ai-essay-writer"), getToolBySlug("scientific-calculator")].filter(Boolean) as ToolItem[],
    };
  }

  // 2. HOW MANY / COUNT QUESTIONS
  if (q.includes("how many") || q.includes("number of") || q.includes("count of") || q.includes("total number")) {
    if (q.includes("pdf")) {
      const pdfTools = TOOLS_REGISTRY.filter((t) => t.category === "PDF Tools");
      const list = pdfTools.map((t, i) => `${i + 1}. ${t.name}`).join("\n");
      return {
        text: `ToolNest has 14 dedicated PDF tools (plus Image to PDF, making 15 PDF tools in total):\n\n${list}\n\nAll of them run client-side with instant single-click launch.`,
        tools: pdfTools.slice(0, 4),
      };
    }

    if (q.includes("ai")) {
      const aiTools = TOOLS_REGISTRY.filter((t) => t.category === "AI Tools");
      const list = aiTools.map((t, i) => `${i + 1}. ${t.name} - ${t.shortDescription}`).join("\n");
      return {
        text: `ToolNest has ${aiTools.length} AI-powered tools:\n\n${list}`,
        tools: aiTools.slice(0, 4),
      };
    }

    if (q.includes("calc")) {
      const calcs = TOOLS_REGISTRY.filter((t) => t.category === "Calculators");
      const list = calcs.map((t, i) => `${i + 1}. ${t.name} (${t.shortDescription})`).join("\n");
      return {
        text: `ToolNest has ${calcs.length} calculators:\n\n${list}`,
        tools: calcs,
      };
    }

    if (q.includes("convert")) {
      const convs = TOOLS_REGISTRY.filter((t) => t.category === "Converters");
      const list = convs.map((t, i) => `${i + 1}. ${t.name} (${t.shortDescription})`).join("\n");
      return {
        text: `ToolNest has ${convs.length} converters in the Converters category (plus 8 document converters in PDF tools):\n\n${list}`,
        tools: convs,
      };
    }

    if (q.includes("image")) {
      const imgs = TOOLS_REGISTRY.filter((t) => t.category === "Image Tools");
      const list = imgs.map((t, i) => `${i + 1}. ${t.name} (${t.shortDescription})`).join("\n");
      return {
        text: `ToolNest has ${imgs.length} image tools:\n\n${list}`,
        tools: imgs,
      };
    }

    // Total count across website
    return {
      text: `ToolNest features 48 tools in total across 9 categories:\n\n` +
        `• 14 PDF Tools (PDF to Word, Word to PDF, Excel, PowerPoint, Compress, Merge, Sign, etc.)\n` +
        `• 10 AI Tools (Essay Writer, Email Writer, Summarizer, Grammar, Flashcards, etc.)\n` +
        `• 5 Calculators (Scientific, Percentage, BMI, Age, Tip)\n` +
        `• 4 Image Tools (Background Remover, Compressor, Image to PDF, AI Image Generator)\n` +
        `• 3 Converters (Storage, Unit, Base64)\n` +
        `• 4 Generators (QR Code, Password, Color Picker, CSS Gradient)\n` +
        `• 3 Text Tools (Word Counter, JSON Formatter, Case Converter)\n` +
        `• 2 Writing Tools (Lorem Ipsum, Hash Generator)\n` +
        `• 3 Fun Tools (Random Number, Countdown Timer, Invoice Generator)\n\n` +
        `Which category would you like to explore?`,
      tools: [getToolBySlug("pdf-to-word"), getToolBySlug("ai-essay-writer"), getToolBySlug("scientific-calculator"), getToolBySlug("background-remover")].filter(Boolean) as ToolItem[],
    };
  }

  // 3. TARGET AUDIENCE QUESTIONS (STUDENTS / OFFICE WORKERS)
  if (q.includes("student") || q.includes("college") || q.includes("school") || q.includes("study") || q.includes("homework") || q.includes("exam")) {
    const studentTools = [
      getToolBySlug("ai-essay-writer"),
      getToolBySlug("ai-flashcards"),
      getToolBySlug("ai-study-notes"),
      getToolBySlug("ai-citation"),
      getToolBySlug("scientific-calculator"),
      getToolBySlug("word-counter"),
    ].filter(Boolean) as ToolItem[];

    return {
      text: "ToolNest has specialized tools designed for school and college students:\n\n" +
        "1. AI Essay Writer - Generates structured essays with introduction, body paragraphs, and arguments based on your grade level.\n" +
        "2. AI Flashcards - Converts your lecture notes into interactive flip revision cards.\n" +
        "3. AI Study Notes Maker - Transforms textbook content into Cornell notes or structured bullet summaries.\n" +
        "4. AI Citation Maker - Generates APA, MLA, Chicago, and IEEE bibliographies.\n" +
        "5. Scientific Calculator - Full trigonometry, logarithms, and powers for math and engineering homework.\n" +
        "6. Word Counter - Live character, word, sentence, and reading-time analyzer.",
      tools: studentTools.slice(0, 4),
    };
  }

  if (q.includes("office") || q.includes("work") || q.includes("business") || q.includes("job") || q.includes("resume") || q.includes("corporate")) {
    const officeTools = [
      getToolBySlug("pdf-to-word"),
      getToolBySlug("ai-email-writer"),
      getToolBySlug("ai-cover-letter"),
      getToolBySlug("excel-to-pdf"),
      getToolBySlug("sign-pdf"),
      getToolBySlug("invoice-generator"),
    ].filter(Boolean) as ToolItem[];

    return {
      text: "Here are the top ToolNest tools for office and professional work:\n\n" +
        "1. PDF to Word - Extracts text and layout into editable Word (.doc) documents.\n" +
        "2. AI Email Writer - Drafts professional requests, follow-ups, apologies, or client outreach.\n" +
        "3. AI Cover Letter - Generates tailored application letters matching your skills and job title.\n" +
        "4. Excel to PDF - Converts spreadsheet sheets and CSV tables into styled PDF tables.\n" +
        "5. Sign PDF - Draw your signature on a canvas and stamp it directly onto documents.\n" +
        "6. Invoice Generator - Creates professional PDF client invoices with custom pricing and branding.",
      tools: officeTools.slice(0, 4),
    };
  }

  // 4. SIGN-IN, ACCOUNTS, DOWNLOADS & PRIVACY
  if (q.includes("sign in") || q.includes("login") || q.includes("account") || q.includes("history") || q.includes("sign up")) {
    return {
      text: "On ToolNest, you can use any tool 100% freely without signing in upfront. When you finish your work and click Download or Save, an option appears to Sign In or Create an Account so your files and computation records are saved safely in your personal history. You can also click 'Download as Guest' if you want to download without creating an account.",
    };
  }

  if (q.includes("free") || q.includes("cost") || q.includes("price") || q.includes("pay") || q.includes("subscription")) {
    return {
      text: "Yes, ToolNest is completely free. There are no subscriptions, payment tiers, or hidden fees. All 48 tools can be used with unlimited runs directly in your web browser.",
    };
  }

  if (q.includes("safe") || q.includes("privacy") || q.includes("secure") || q.includes("upload server")) {
    return {
      text: "Your privacy is protected on ToolNest. All document processing (PDFs, images, calculations) runs client-side directly within your browser. Your files are not uploaded to external servers, and your history is isolated to your personal device and account.",
    };
  }

  // 5. SPECIFIC HOW-TO PROCESS INQUIRIES
  if (q.includes("pdf to word") || (q.includes("pdf") && q.includes("word") && !q.includes("word to pdf"))) {
    return {
      text: "To convert PDF to Word on ToolNest:\n\n" +
        "1. Open the PDF to Word tool.\n" +
        "2. Drop or select your PDF file.\n" +
        "3. The tool analyzes headings, paragraphs, and alignments page by page.\n" +
        "4. Preview your document and click 'Download Word (.doc)' to open it in Microsoft Word or Google Docs.",
      tools: [getToolBySlug("pdf-to-word")!].filter(Boolean),
    };
  }

  if (q.includes("word to pdf") || (q.includes("doc") && q.includes("pdf") && !q.includes("pdf to word"))) {
    return {
      text: "To convert Word documents to PDF:\n\n" +
        "1. Open the Word to PDF tool.\n" +
        "2. Upload your .doc or .docx file.\n" +
        "3. The engine parses the document text and wraps it into standard PDF page dimensions.\n" +
        "4. Click 'Convert & Download' to receive your PDF file.",
      tools: [getToolBySlug("word-to-pdf")!].filter(Boolean),
    };
  }

  if (q.includes("excel") || q.includes("spreadsheet") || q.includes("csv")) {
    return {
      text: "ToolNest has two spreadsheet tools:\n\n" +
        "• PDF to Excel: Detects tabular structures, column coordinates, and extracts table data into an Excel-ready CSV file.\n" +
        "• Excel to PDF: Formats Excel and CSV data grids into styled PDF landscape tables with headers and alternating row shading.",
      tools: [getToolBySlug("pdf-to-excel"), getToolBySlug("excel-to-pdf")].filter(Boolean) as ToolItem[],
    };
  }

  if (q.includes("powerpoint") || q.includes("ppt") || q.includes("slides")) {
    return {
      text: "ToolNest provides two presentation tools:\n\n" +
        "• PDF to PowerPoint: Detects slide headings and bullet points from PDF pages and structures them into an editable .ppt presentation.\n" +
        "• PowerPoint to PDF: Takes your slide presentations and exports them into landscape PDF format.",
      tools: [getToolBySlug("pdf-to-powerpoint"), getToolBySlug("powerpoint-to-pdf")].filter(Boolean) as ToolItem[],
    };
  }

  if (q.includes("compress pdf") || q.includes("shrink pdf") || q.includes("reduce pdf")) {
    return {
      text: "To compress a PDF:\n\n" +
        "1. Open the PDF Compressor tool.\n" +
        "2. Upload your PDF.\n" +
        "3. The browser strips redundant object streams, deduplicates font dictionaries, and linearizes structure.\n" +
        "4. Preview the percentage reduction and download the optimized PDF.",
      tools: [getToolBySlug("pdf-compress")!].filter(Boolean),
    };
  }

  if (q.includes("merge") || q.includes("combine") || q.includes("split")) {
    return {
      text: "Our PDF Merge & Split tool handles both operations:\n\n" +
        "• Merge Tab: Drag and drop multiple PDF files, reorder them, and combine into a single unified PDF.\n" +
        "• Split Tab: Select specific page ranges (e.g. 1-3, 5) and extract them into individual PDF documents.",
      tools: [getToolBySlug("pdf-merge-split")!].filter(Boolean),
    };
  }

  if (q.includes("sign") || q.includes("signature")) {
    return {
      text: "To digitally sign a PDF:\n\n" +
        "1. Open the Sign PDF tool and upload your document.\n" +
        "2. Draw your signature on the interactive canvas pad using your mouse or finger.\n" +
        "3. Select your ink color (black, blue, red) and adjust thickness.\n" +
        "4. Choose which page and position to place your signature, then click 'Add Signature & Download'.",
      tools: [getToolBySlug("sign-pdf")!].filter(Boolean),
    };
  }

  if (q.includes("watermark")) {
    return {
      text: "Our Watermark PDF tool lets you stamp custom diagonal text (like 'CONFIDENTIAL', 'DRAFT', or your company name) across every page of your PDF with live opacity, font size, and color controls.",
      tools: [getToolBySlug("watermark-pdf")!].filter(Boolean),
    };
  }

  if (q.includes("rotate")) {
    return {
      text: "Use the Rotate PDF tool to rotate pages by 90 degrees clockwise, 180 degrees, or 90 degrees counter-clockwise to fix upside-down or sideways scans.",
      tools: [getToolBySlug("rotate-pdf")!].filter(Boolean),
    };
  }

  if (q.includes("background") || q.includes("cutout") || q.includes("transparent png")) {
    return {
      text: "To remove an image background:\n\n" +
        "1. Open Background Remover.\n" +
        "2. Drop your image (.jpg, .png, .webp).\n" +
        "3. The tool performs luminance and chroma segmentation to separate the subject from the background.\n" +
        "4. Download your crisp cutout with a transparent background.",
      tools: [getToolBySlug("background-remover")!].filter(Boolean),
    };
  }

  if (q.includes("compress image") || q.includes("resize image")) {
    return {
      text: "Our Image Compressor lets you compress JPEG, PNG, and WebP files with an adjustable quality slider and live side-by-side file size preview.",
      tools: [getToolBySlug("image-compressor")!].filter(Boolean),
    };
  }

  if (q.includes("qr code") || q.includes("barcode")) {
    return {
      text: "To generate a custom QR code:\n\n" +
        "1. Open QR Code Generator.\n" +
        "2. Type or paste your URL, Wi-Fi details, or text.\n" +
        "3. Customize foreground/background colors and resolution.\n" +
        "4. Download the ready-to-print QR code as a PNG.",
      tools: [getToolBySlug("qr-code-generator")!].filter(Boolean),
    };
  }

  if (q.includes("password") || q.includes("security")) {
    return {
      text: "The Password Generator creates high-entropy secure passwords with uppercase, lowercase, numbers, and symbols, showing you the exact entropy score and crack resistance.",
      tools: [getToolBySlug("password-generator")!].filter(Boolean),
    };
  }

  if (q.includes("essay")) {
    return {
      text: "To write an essay with AI:\n\n" +
        "1. Open AI Essay Writer.\n" +
        "2. Enter your topic and select your essay type (Argumentative, Expository, Narrative, Descriptive).\n" +
        "3. Choose your grade level (Middle School to University) and word count target.\n" +
        "4. Click 'Write Essay' to receive a complete structured essay with introduction, supporting body arguments, and conclusion.",
      tools: [getToolBySlug("ai-essay-writer")!].filter(Boolean),
    };
  }

  if (q.includes("email")) {
    return {
      text: "Our AI Email Writer crafts professional emails for any purpose: follow-ups, meeting requests, job inquiries, apologies, or complaints. You can customize the tone to formal, friendly, assertive, or polite.",
      tools: [getToolBySlug("ai-email-writer")!].filter(Boolean),
    };
  }

  if (q.includes("grammar") || q.includes("spell")) {
    return {
      text: "The AI Grammar Checker inspects your text for spelling, punctuation, and structural mistakes. It displays a list of detected issues alongside an explanation and provides a clean, corrected version.",
      tools: [getToolBySlug("ai-grammar-checker")!].filter(Boolean),
    };
  }

  if (q.includes("paraphrase") || q.includes("rewrite") || q.includes("rephrase")) {
    return {
      text: "Use the AI Paraphraser to rewrite text in different styles: Standard, Formal, Casual, Academic, or Creative, while preserving the original meaning.",
      tools: [getToolBySlug("ai-paraphraser")!].filter(Boolean),
    };
  }

  if (q.includes("flashcard") || q.includes("study card")) {
    return {
      text: "The AI Flashcard Generator extracts key concepts from your notes and converts them into interactive flip-cards with question and answer sides for quick revision.",
      tools: [getToolBySlug("ai-flashcards")!].filter(Boolean),
    };
  }

  if (q.includes("citation") || q.includes("apa") || q.includes("mla") || q.includes("bibliography")) {
    return {
      text: "The AI Citation Generator formats citations for websites, books, journals, newspapers, and videos in APA (7th ed.), MLA (9th ed.), Chicago, Harvard, and IEEE styles.",
      tools: [getToolBySlug("ai-citation")!].filter(Boolean),
    };
  }

  if (q.includes("translate") || q.includes("language") || q.includes("urdu") || q.includes("arabic") || q.includes("french") || q.includes("spanish")) {
    return {
      text: "Our AI Translator supports fast translation between over 17 languages including English, Urdu, Arabic, French, Spanish, German, Hindi, and Chinese.",
      tools: [getToolBySlug("ai-translator")!].filter(Boolean),
    };
  }

  if (q.includes("bmi") || q.includes("weight") || q.includes("height") || q.includes("fitness")) {
    return {
      text: "Our BMI Calculator determines your Body Mass Index with support for both metric and imperial units, providing healthy weight range recommendations.",
      tools: [getToolBySlug("bmi-calculator")!].filter(Boolean),
    };
  }

  if (q.includes("age") || q.includes("birthday")) {
    return {
      text: "The Age Calculator calculates your exact age down to years, months, days, and shows a live countdown to your next birthday.",
      tools: [getToolBySlug("age-calculator")!].filter(Boolean),
    };
  }

  if (q.includes("tip") || q.includes("split bill") || q.includes("restaurant bill")) {
    return {
      text: "Our Tip Calculator splits restaurant bills, calculates custom tip percentages, and divides totals per person.",
      tools: [getToolBySlug("tip-calculator")!].filter(Boolean),
    };
  }

  if (q.includes("json")) {
    return {
      text: "The JSON Formatter beautifies, minifies, and validates JSON data with syntax error detection and indentation controls.",
      tools: [getToolBySlug("json-formatter")!].filter(Boolean),
    };
  }

  // 6. DIRECT MATH EVALUATION (if user asks e.g. "what is 20% of 500", "50 * 4", etc.)
  const percentMatch = q.match(/(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)/i);
  if (percentMatch) {
    const p = parseFloat(percentMatch[1]);
    const total = parseFloat(percentMatch[2]);
    const result = (p / 100) * total;
    return {
      text: `${p}% of ${total} is ${result}.\n\nFor more complex calculations (like percentage increase/decrease or discount margins), you can use our Percentage Calculator tool.`,
      tools: [getToolBySlug("percentage-calculator")!].filter(Boolean),
    };
  }

  // 7. INTELLIGENT KEYWORD SEARCH FALLBACK
  // Match tools by tags or category
  const words = q.split(/\s+/).filter((w) => w.length > 2);
  const matched = TOOLS_REGISTRY.filter((t) => {
    return words.some(
      (w) =>
        t.name.toLowerCase().includes(w) ||
        t.slug.toLowerCase().includes(w) ||
        t.tags.some((tag) => tag.toLowerCase() === w)
    );
  }).slice(0, 3);

  if (matched.length > 0) {
    const toolNames = matched.map((m) => m.name).join(", ");
    return {
      text: `Based on your question, here are the most relevant ToolNest tools:\n\n` +
        matched.map((m) => `• ${m.name}: ${m.shortDescription}`).join("\n") +
        `\n\nClick any tool below to launch it immediately with a single click.`,
      tools: matched,
    };
  }

  // 8. GENERAL HELPFUL CLOSURE
  return {
    text: "I am here to help you navigate ToolNest's 48 free online tools. You can ask me how to convert specific files (like PDF to Word, Excel, PowerPoint), write essays or emails with AI, calculate values, or ask about any feature on our website.",
    tools: [getToolBySlug("pdf-to-word"), getToolBySlug("ai-essay-writer"), getToolBySlug("image-to-pdf")].filter(Boolean) as ToolItem[],
  };
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "assistant",
      text: "👋 Hi there! I am your ToolNest AI Assistant.\n\nI can help you convert files, generate essays, write office emails, format data, or find any tool you need. What can I do for you today?",
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const sendMessage = (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isTyping) return;

    setHasInteracted(true);
    setInput("");

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Dynamic processing delay (300-600ms) for natural conversational feel
    setTimeout(() => {
      const response = generateAccurateToolNestResponse(text);

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "assistant",
          text: cleanText(response.text),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          suggestedTools: response.tools,
        },
      ]);
      setIsTyping(false);
    }, 450);
  };

  const handleReset = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "assistant",
        text: "👋 Chat reset! I am your ToolNest AI Assistant, ready for your next task. How can I help you?",
        timestamp: "Just now",
      },
    ]);
  };

  return (
    <>
      {/* ── FLOATING TRIGGER BUTTON (Bottom-Right with cute Robo picture) ── */}
      <div className="fixed bottom-14 right-6 z-50 flex items-center gap-3">
        {!isOpen && !hasInteracted && (
          <div
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-violet-100 text-xs font-semibold text-slate-700 cursor-pointer hover:border-violet-300 hover:shadow-2xl transition-all animate-bounce"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-600 animate-pulse" />
            <span>Need help? Chat with Robo!</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle AI Chatbot Assistant"
          className="group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-blue-500 p-1 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-violet-300 flex items-center justify-center cursor-pointer"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-sky-400 opacity-60 blur-md group-hover:opacity-100 transition-opacity" />

          <div className="relative w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
            <RoboAvatar className="w-10 h-10 sm:w-11 sm:h-11" glow={false} />
          </div>

          <span className="absolute bottom-0.5 right-0.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white" />
          </span>
        </button>
      </div>

      {/* ── CHATBOT SLIDE-UP / POPUP WINDOW ── */}
      {isOpen && (
        <div className="fixed bottom-32 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[410px] h-[560px] max-h-[75vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 p-4 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md p-1 border border-white/20 flex items-center justify-center">
                <RoboAvatar className="w-8 h-8" glow={false} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base tracking-tight leading-none">Robo AI</h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-xs text-violet-100 mt-1">ToolNest AI Assistant &amp; Guide</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Reset conversation"
                className="p-1.5 rounded-xl hover:bg-white/10 text-violet-200 hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 rounded-xl hover:bg-white/10 text-violet-200 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "assistant" && (
                  <div className="w-7 h-7 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <RoboAvatar className="w-5 h-5" glow={false} />
                  </div>
                )}

                <div className="max-w-[82%] space-y-2">
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                      m.sender === "user"
                        ? "bg-violet-600 text-white rounded-tr-none font-medium"
                        : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{cleanText(m.text)}</p>
                  </div>

                  {/* 1-Click Launch Cards */}
                  {m.suggestedTools && m.suggestedTools.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Zap className="w-3 h-3 text-violet-600" /> Suggested Tools:
                      </p>
                      {m.suggestedTools.map((tool) => (
                        <Link
                          key={tool.id}
                          href={`/tools/${tool.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-violet-100 hover:border-violet-400 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                              ⚡
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 group-hover:text-violet-700 truncate">
                                {tool.name}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {tool.category} &bull; 1-Click Launch
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-violet-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 flex-shrink-0">
                            Open <ArrowRight className="w-3 h-3" />
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  <span className="block text-[10px] text-slate-400 px-1">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 items-center">
                <div className="w-7 h-7 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <RoboAvatar className="w-5 h-5" glow={false} />
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span className="text-xs text-slate-400 font-medium ml-1.5">Robo is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(prompt)}
                  className="whitespace-nowrap px-2.5 py-1.5 bg-slate-100 hover:bg-violet-50 text-slate-700 hover:text-violet-700 text-xs font-semibold rounded-full border border-slate-200 transition-colors flex-shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Robo anything about ToolNest..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
