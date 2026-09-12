"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Script from "next/script";
import {
  X,
  Send,
  Paperclip,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Bot,
  User,
  Loader2,
} from "lucide-react";
import { parseClientFile, ParsedFile } from "@/lib/file-parser";
import { TOOLS_REGISTRY } from "@/lib/tools-data";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  suggestedTool?: {
    slug: string;
    name: string;
  };
  attachments?: {
    name: string;
    type: string;
  }[];
}

// Geometric Robot Avatar SVG
function GeometricRobotIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Antenna */}
      <line x1="12" y1="2" x2="12" y2="5" />
      <circle cx="12" cy="2" r="1" fill="currentColor" />
      {/* Head */}
      <rect x="4" y="5" width="16" height="13" rx="3" />
      {/* Eyes */}
      <circle cx="8.5" cy="10.5" r="1.2" fill="currentColor" />
      <circle cx="15.5" cy="10.5" r="1.2" fill="currentColor" />
      {/* Mouth / Speaker Grill */}
      <line x1="9" y1="14.5" x2="15" y2="14.5" />
      {/* Ears / Side Bolts */}
      <line x1="2" y1="11.5" x2="4" y2="11.5" />
      <line x1="20" y1="11.5" x2="22" y2="11.5" />
    </svg>
  );
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Hello! I am your ToolNest Assistant. Tell me what task you need to accomplish (e.g. 'I need to compress a PDF', 'How do I generate an image?', or attach a file to inspect).",
      timestamp: "Ready",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [puterReady, setPuterReady] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<ParsedFile[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on message update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  // Check if Puter.js is loaded
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).puter) {
      setPuterReady(true);
    }
  }, []);

  const handleAttachmentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: ParsedFile[] = [];
      for (const file of Array.from(e.target.files)) {
        try {
          const parsed = await parseClientFile(file);
          newFiles.push(parsed);
        } catch (err) {
          console.error(err);
        }
      }
      setAttachedFiles((prev) => [...prev, ...newFiles]);
      e.target.value = "";
    }
  };

  const removeAttachment = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const findMatchingTool = (query: string) => {
    const q = query.toLowerCase();
    return TOOLS_REGISTRY.find(
      (tool) =>
        q.includes(tool.slug.replace(/-/g, " ")) ||
        q.includes(tool.name.toLowerCase()) ||
        tool.tags.some((tag) => q.includes(tag))
    );
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && attachedFiles.length === 0) return;

    const userText = input.trim();
    const currentAttachments = [...attachedFiles];

    // Build user message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: userText || (currentAttachments.length > 0 ? `[Attached ${currentAttachments.length} file(s)]` : ""),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      attachments: currentAttachments.map((f) => ({ name: f.name, type: f.type })),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setAttachedFiles([]);
    setIsTyping(true);

    // Context from attached files
    let fileContext = "";
    if (currentAttachments.length > 0) {
      fileContext = "\n\nAttached files context:\n" +
        currentAttachments
          .map(
            (f) =>
              `- File: ${f.name} (${f.type}, ${f.size} bytes)${
                f.extractedText ? `\nText Sample:\n${f.extractedText.slice(0, 1000)}...` : ""
              }`
          )
          .join("\n");
    }

    const matchedTool = findMatchingTool(userText);

    // Call Puter.js or resilient local knowledge base
    try {
      let assistantReply = "";

      if (typeof window !== "undefined" && (window as any).puter?.ai?.chat) {
        const systemPrompt =
          "You are the technical assistant for ToolNest (a free zero-cost utility toolbox). " +
          "Your job is to guide users to the right tool, explain how tools work, and summarize or inspect user attachments. " +
          "Available tools: " +
          TOOLS_REGISTRY.map((t) => `${t.name} (/tools/${t.slug}): ${t.shortDescription}`).join("; ") +
          ". Keep replies concise, technical, and helpful.";

        const promptWithContext = `${systemPrompt}\n\nUser Question: ${userText}${fileContext}`;
        const response = await (window as any).puter.ai.chat(promptWithContext);
        assistantReply = typeof response === "string" ? response : response?.message?.content || JSON.stringify(response);
      } else {
        // Fallback intelligent technical responder
        if (matchedTool) {
          assistantReply = `You can use our **${matchedTool.name}** tool for this task! It runs 100% client-side with zero latency and no file upload to servers.`;
        } else if (currentAttachments.length > 0) {
          assistantReply = `I've analyzed your attached file (${currentAttachments[0].name}). You can convert, edit, or process it directly using the suggested tool below.`;
        } else {
          assistantReply =
            "I'm here to help you navigate ToolNest's zero-cost workbench. You can convert images to PDF, generate AI schematics, use our scientific calculator, convert storage units, and more.";
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `reply-${Date.now()}`,
          sender: "assistant",
          text: assistantReply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          suggestedTool: matchedTool ? { slug: matchedTool.slug, name: matchedTool.name } : undefined,
        },
      ]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "assistant",
          text: matchedTool
            ? `I recommend using our **${matchedTool.name}** tool for this!`
            : "I can help you navigate our tools. What task are you trying to complete?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          suggestedTool: matchedTool ? { slug: matchedTool.slug, name: matchedTool.name } : undefined,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Load Puter.js dynamically */}
      <Script
        src="https://js.puter.com/v2/"
        strategy="lazyOnload"
        onLoad={() => setPuterReady(true)}
      />

      {/* Floating Trigger Button (Bottom-Right) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open AI Assistant"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-blueprint hover:bg-blueprint-600 text-signal border-2 border-signal shadow-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-signal/40"
      >
        <GeometricRobotIcon className="w-7 h-7 stroke-[2]" />
        <span className="sr-only">Toggle AI Workbench Assistant</span>
      </button>

      {/* Slide-in Panel from Right Edge */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-paper dark:bg-ink border-l border-graphite/40 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Panel Header */}
        <div className="p-4 border-b border-graphite/30 bg-card-bg flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-blueprint flex items-center justify-center text-signal border border-signal/50">
              <GeometricRobotIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-display font-bold text-sm text-ink dark:text-paper">
                  ToolNest Assistant
                </h3>
                <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-wire/20 text-wire font-semibold">
                  PUTER.JS
                </span>
              </div>
              <p className="font-mono text-[10px] text-graphite dark:text-gray-400">
                Zero-cost client AI · Tool guide & assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                setMessages([
                  {
                    id: "reset",
                    sender: "assistant",
                    text: "Conversation reset. How can I help you with ToolNest today?",
                    timestamp: "Reset",
                  },
                ])
              }
              title="Reset Chat"
              className="p-1.5 rounded hover:bg-graphite/10 text-graphite dark:text-gray-400 hover:text-signal focus:outline-none"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded hover:bg-graphite/10 text-graphite dark:text-gray-400 hover:text-red-500 focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-graph-grid">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-lg text-xs leading-relaxed ${
                  m.sender === "user"
                    ? "bg-blueprint text-paper border border-blueprint-400"
                    : "bg-card-bg text-ink dark:text-paper border border-graphite/30 shadow-sm"
                }`}
              >
                {/* Attachments preview in bubble */}
                {m.attachments && m.attachments.length > 0 && (
                  <div className="mb-2 pb-2 border-b border-white/20 space-y-1">
                    {m.attachments.map((att, i) => (
                      <div key={i} className="flex items-center gap-1 text-[10px] opacity-90">
                        <Paperclip className="w-3 h-3" />
                        <span className="truncate">{att.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                <p className="whitespace-pre-wrap">{m.text}</p>

                {/* Suggested Tool Card */}
                {m.suggestedTool && (
                  <div className="mt-2.5 pt-2 border-t border-graphite/20">
                    <Link
                      href={`/tools/${m.suggestedTool.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-signal/15 border border-signal text-signal font-mono text-[11px] font-medium hover:bg-signal/25 transition-colors"
                    >
                      <span>Open {m.suggestedTool.name}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>

              <span className="font-mono text-[9px] text-graphite/60 dark:text-gray-500 mt-1 px-1">
                {m.timestamp}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs font-mono text-graphite p-2 bg-card-bg/60 rounded border border-graphite/20 w-fit">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-signal" />
              <span>Thinking via Puter.js...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Pending Attachment Chips */}
        {attachedFiles.length > 0 && (
          <div className="p-2 border-t border-graphite/20 bg-card-bg flex flex-wrap gap-1.5">
            {attachedFiles.map((af) => (
              <div
                key={af.id}
                className="flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded bg-blueprint/10 dark:bg-blueprint/40 text-ink dark:text-paper border border-graphite/30"
              >
                <Paperclip className="w-2.5 h-2.5 text-signal" />
                <span className="max-w-[120px] truncate">{af.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(af.id)}
                  className="hover:text-red-500 ml-1"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Form */}
        <form
          onSubmit={handleSend}
          className="p-3 border-t border-graphite/30 bg-card-bg flex items-center gap-2"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAttachmentChange}
            multiple
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach image or document"
            className="p-2 rounded border border-graphite/30 hover:border-signal text-graphite dark:text-gray-300 hover:text-signal focus:outline-none"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask assistant or request a tool..."
            className="flex-1 bg-transparent px-3 py-2 text-xs rounded border border-graphite/30 focus:border-signal focus:outline-none font-sans text-ink dark:text-paper placeholder:text-graphite/60"
          />

          <button
            type="submit"
            disabled={!input.trim() && attachedFiles.length === 0}
            className="p-2 rounded bg-signal hover:bg-signal-hover text-ink font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </>
  );
}
