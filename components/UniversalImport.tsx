"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { parseClientFile, ParsedFile, formatBytes, MAX_FILE_SIZE } from "@/lib/file-parser";
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  FileCode,
  File,
  X,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";

interface UniversalImportProps {
  onFilesParsed?: (files: ParsedFile[]) => void;
  compact?: boolean;
  enableGlobalDragDrop?: boolean;
}

export default function UniversalImport({
  onFilesParsed,
  compact = false,
  enableGlobalDragDrop = true,
}: UniversalImportProps) {
  const router = useRouter();
  const [files, setFiles] = useState<ParsedFile[]>([]);
  const [isDraggingGlobal, setIsDraggingGlobal] = useState(false);
  const [isHoveringZone, setIsHoveringZone] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Global window drag-and-drop listener
  useEffect(() => {
    if (!enableGlobalDragDrop) return;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current += 1;
      if (e.dataTransfer && e.dataTransfer.types.includes("Files")) {
        setIsDraggingGlobal(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current -= 1;
      if (dragCounter.current <= 0) {
        setIsDraggingGlobal(false);
        dragCounter.current = 0;
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDraggingGlobal(false);
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        await processFileList(Array.from(e.dataTransfer.files));
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [enableGlobalDragDrop]);

  const processFileList = async (incomingFiles: File[]) => {
    setErrorMessage(null);
    setIsProcessing(true);
    const parsedList: ParsedFile[] = [];

    for (const file of incomingFiles) {
      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage(`"${file.name}" exceeds the 20MB client limit.`);
        continue;
      }

      try {
        const parsed = await parseClientFile(file);
        parsedList.push(parsed);
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to process file");
      }
    }

    if (parsedList.length > 0) {
      const updated = [...files, ...parsedList];
      setFiles(updated);
      if (onFilesParsed) {
        onFilesParsed(updated);
      }
    }

    setIsProcessing(false);
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFileList(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const removeFile = (id: string) => {
    const updated = files.filter((f) => f.id !== id);
    setFiles(updated);
    if (onFilesParsed) {
      onFilesParsed(updated);
    }
  };

  const renderFileIcon = (file: ParsedFile) => {
    switch (file.type) {
      case "image":
        return <ImageIcon className="w-4 h-4 text-blueprint text-emerald-700" />;
      case "spreadsheet":
        return <FileSpreadsheet className="w-4 h-4 text-wire" />;
      case "code":
        return <FileCode className="w-4 h-4 text-signal" />;
      case "document":
        return <FileText className="w-4 h-4 text-blueprint text-emerald-700" />;
      default:
        return <File className="w-4 h-4 text-slate-700" />;
    }
  };

  return (
    <>
      {/* Full Window Drag Overlay */}
      {isDraggingGlobal && (
        <div className="fixed inset-0 z-50 bg-blueprint/90 bg-white/95 backdrop-blur-sm border-4 border-dashed border-signal flex flex-col items-center justify-center pointer-events-none p-6 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-signal/20 border-2 border-signal flex items-center justify-center mb-4 animate-bounce">
            <UploadCloud className="w-10 h-10 text-signal" />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">
            DROP FILES ANYWHERE ON WORKBENCH
          </h2>
          <p className="font-mono text-xs text-wire max-w-md">
            Universal file parser: Images, PDFs, DOCX, XLSX, TXT, JSON. Instant client-side inspection.
          </p>
        </div>
      )}

      {/* Main Import Component Container */}
      <div className={`w-full ${compact ? "" : "space-y-4"}`}>
        {/* Hidden File Picker */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          multiple
          accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.docx,.txt,.csv,.xlsx,.json,.md"
          className="hidden"
        />

        {/* Drop Zone Box */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsHoveringZone(true);
          }}
          onDragLeave={() => setIsHoveringZone(false)}
          onDrop={async (e) => {
            e.preventDefault();
            setIsHoveringZone(false);
            if (e.dataTransfer && e.dataTransfer.files) {
              await processFileList(Array.from(e.dataTransfer.files));
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer text-center ${
            compact ? "p-4" : "p-8"
          } ${
            isHoveringZone
              ? "border-signal bg-signal/5"
              : "border-graphite/30 hover:border-blueprint dark:hover:border-signal bg-card-bg/60"
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blueprint/10 dark:bg-blueprint/40 border border-blueprint/30 flex items-center justify-center text-blueprint text-emerald-700">
              <UploadCloud className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <p className="font-display font-medium text-sm text-slate-900 text-slate-900">
                <span className="text-signal underline decoration-signal/50 underline-offset-4">
                  Click to import
                </span>{" "}
                or drag and drop files anywhere
              </p>
              <p className="font-mono text-[11px] text-slate-700 text-slate-700">
                Supports Images, PDF, DOCX, XLSX, CSV, JSON, TXT · Up to 20MB per file
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-center gap-2 text-xs font-mono p-3 rounded bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* LLM-style Attachment Chips / Cards */}
        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-700 text-slate-700">
              <span>ATTACHED FILES ({files.length})</span>
              <button
                type="button"
                onClick={() => {
                  setFiles([]);
                  if (onFilesParsed) onFilesParsed([]);
                }}
                className="hover:text-red-400 underline underline-offset-2"
              >
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {files.map((f) => (
                <div
                  key={f.id}
                  className="relative p-3 rounded border border-graphite/30 bg-card-bg flex flex-col justify-between gap-2 shadow-sm"
                >
                  {/* Card Header: Preview & Metadata */}
                  <div className="flex items-start gap-3">
                    {f.type === "image" && f.previewUrl ? (
                      <div className="w-12 h-12 rounded border border-graphite/20 overflow-hidden flex-shrink-0 bg-graphite/10">
                        <img
                          src={f.previewUrl}
                          alt={f.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded border border-graphite/20 flex items-center justify-center flex-shrink-0 bg-graphite/10">
                        {renderFileIcon(f)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-mono font-medium text-slate-900 text-slate-900 truncate">
                        {f.name}
                      </p>
                      <p className="text-[10px] font-mono text-slate-700 text-slate-700">
                        {formatBytes(f.size)} · {f.extension.toUpperCase()}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(f.id);
                      }}
                      className="p-1 rounded hover:bg-graphite/10 text-slate-700 hover:text-red-500 focus:outline-none"
                      title="Remove attachment"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Smart Routing Tool Suggestions */}
                  {f.suggestedTools.length > 0 && (
                    <div className="pt-2 border-t border-graphite/20 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[9px] font-mono text-slate-700 uppercase">
                        Route to:
                      </span>
                      {f.suggestedTools.map((st) => (
                        <button
                          key={st.slug}
                          type="button"
                          onClick={() => {
                            // Store in sessionStorage so target tool can retrieve it
                            try {
                              sessionStorage.setItem(
                                "toolnest_pending_file_name",
                                f.name
                              );
                              if (f.previewUrl) {
                                sessionStorage.setItem(
                                  "toolnest_pending_file_data",
                                  f.previewUrl
                                );
                              }
                              if (f.extractedText) {
                                sessionStorage.setItem(
                                  "toolnest_pending_file_text",
                                  f.extractedText
                                );
                              }
                            } catch (e) {
                              console.warn("sessionStorage limit", e);
                            }
                            router.push(`/tools/${st.slug}`);
                          }}
                          className="flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-blueprint/30 bg-blueprint/5 dark:bg-blueprint/20 text-blueprint text-emerald-700 hover:border-signal hover:text-signal transition-colors"
                        >
                          <span>{st.name}</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Privacy Default Banner */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-700 text-slate-700 px-1">
          <ShieldCheck className="w-3.5 h-3.5 text-wire flex-shrink-0" />
          <span>
            Privacy Default: Files are processed transiently in your browser memory and are never uploaded or stored on servers.
          </span>
        </div>
      </div>
    </>
  );
}
