"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  Download,
  Copy,
  RefreshCw,
  AlertCircle,
  Check,
  Cpu,
  Info,
  FileDown,
} from "lucide-react";
import { downloadTextReport } from "@/lib/export-utils";

const STYLE_PRESETS = [
  { id: "blueprint", name: "Technical Blueprint", prompt: "cyanotype blueprint, technical drafting, schematic diagrams, crisp white grid lines on deep prussian blue background" },
  { id: "cad", name: "CAD Wireframe", prompt: "orthographic 3D CAD schematic, precision wireframe, mechanical engineering render, dark mode, high fidelity" },
  { id: "patent", name: "Vintage Patent Sketch", prompt: "vintage 19th century patent illustration, engraved line work, aged technical parchment, calligraphic annotations" },
  { id: "photoreal", name: "Photorealistic", prompt: "ultra-realistic 8k studio photography, crisp optics, sharp focus, natural volumetric lighting" },
  { id: "cyberpunk", name: "Cyberpunk Schematic", prompt: "futuristic HUD interface, glowing neon amber and teal vectors, dark obsidian background, telemetry data" },
  { id: "none", name: "None (Raw)", prompt: "" },
];

export default function TextToImagePage() {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<string>("blueprint");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16">("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const getDimensions = () => {
    switch (aspectRatio) {
      case "16:9":
        return { width: 1024, height: 576 };
      case "9:16":
        return { width: 576, height: 1024 };
      default:
        return { width: 800, height: 800 };
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setError(null);
    setIsGenerating(true);

    const dims = getDimensions();
    const styleObj = STYLE_PRESETS.find((s) => s.id === selectedStyle);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style: styleObj?.prompt || "",
          width: dims.width,
          height: dims.height,
          seed: Math.floor(Math.random() * 1000000),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image.");
      }

      setGeneratedImage(data.imageUrl);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while generating.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = generatedImage;
    link.download = `toolnest-ai-${dateStr}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSpec = () => {
    const styleObj = STYLE_PRESETS.find((s) => s.id === selectedStyle);
    const dims = getDimensions();
    downloadTextReport(
      "ai-image-generation-record",
      "AI Schematic & Image Generator",
      {
        "Prompt": prompt,
        "Style Preset": styleObj?.name || "None",
        "Aspect Ratio": aspectRatio,
        "Render Resolution": `${dims.width} x ${dims.height} px`,
        "Engine": "Pollinations.ai Free Tier",
        "Has Generated Image": generatedImage ? "YES" : "NO",
        "Generated Date": new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        "Generated Time": new Date().toLocaleTimeString("en-US"),
      }
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-graphite/40 pb-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-800 text-slate-800 hover:text-signal mb-1 transition-colors font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO UTILITY WORKBENCH</span>
          </Link>
          <h1 className="font-display font-extrabold text-2xl text-slate-900 text-slate-900">
            AI Schematic &amp; Image Generator
          </h1>
          <p className="font-mono text-xs text-slate-800 text-slate-800 font-medium">
            Zero-cost text-to-image engine powered by Pollinations.ai with style presets &amp; serverless rate-limiting.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-900 text-slate-800 font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-wire" />
          <span>POLLINATIONS: KEYLESS FREE TIER</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Prompt & Controls */}
        <div className="lg:col-span-5 space-y-5">
          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Prompt Input */}
            <div className="p-4 rounded-lg border border-graphite/30 bg-card-bg space-y-2">
              <label className="font-mono text-xs font-semibold text-slate-900 text-slate-900 flex items-center justify-between">
                <span>GENERATION PROMPT</span>
                {prompt && (
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="text-[10px] text-slate-700 hover:text-signal flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3 text-wire" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                )}
              </label>

              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your schematic, concept, or scene (e.g. 'A futuristic fusion reactor core with hydraulic cooling pipes')..."
                className="w-full bg-white bg-white border border-graphite/30 rounded-lg p-3 text-xs font-sans focus:border-signal outline-none text-slate-900 text-slate-900 resize-none"
              />
            </div>

            {/* Style Presets */}
            <div className="p-4 rounded-lg border border-graphite/30 bg-card-bg space-y-2">
              <label className="font-mono text-xs font-semibold text-slate-900 text-slate-900 block">
                STYLE PRESETS
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STYLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedStyle(preset.id)}
                    className={`px-3 py-2 rounded text-left font-mono text-xs border transition-all ${
                      selectedStyle === preset.id
                        ? "border-signal bg-signal/15 text-signal font-semibold"
                        : "border-graphite/30 hover:border-graphite/60 text-slate-700 text-slate-700"
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="p-4 rounded-lg border border-graphite/30 bg-card-bg space-y-2">
              <label className="font-mono text-xs font-semibold text-slate-900 text-slate-900 block">
                ASPECT RATIO
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["1:1", "16:9", "9:16"] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-1.5 rounded text-center font-mono text-xs border ${
                      aspectRatio === ratio
                        ? "border-signal bg-signal/15 text-signal font-semibold"
                        : "border-graphite/30 text-slate-700 text-slate-700"
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-signal hover:bg-signal-hover text-slate-900 font-mono font-bold text-xs shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>SYNTHESIZING SCHEMATIC...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>GENERATE IMAGE</span>
                </>
              )}
            </button>
          </form>

          {/* Info Banner */}
          <div className="p-3 rounded-lg border border-graphite/20 bg-card-bg text-[11px] font-mono text-slate-700 text-slate-700 space-y-1">
            <div className="flex items-center gap-1.5 text-blueprint text-emerald-700 font-semibold">
              <Info className="w-3.5 h-3.5" />
              <span>Pollinations.ai Free Tier Notice</span>
            </div>
            <p>
              Anonymous requests are rate-limited to ~1 request every 15 seconds. If higher velocity is required, configure a free token in your project environment.
            </p>
          </div>
        </div>

        {/* Right Column: Image Viewport */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex-1 min-h-[460px] rounded-lg border border-graphite/30 bg-card-bg bg-graph-grid flex flex-col items-center justify-center p-4 relative">
            {error && (
              <div className="max-w-md p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 font-mono text-xs space-y-2 text-center">
                <AlertCircle className="w-6 h-6 mx-auto" />
                <p className="font-semibold">Generation Failed</p>
                <p>{error}</p>
              </div>
            )}

            {!error && isGenerating && (
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="w-16 h-16 rounded-full border-4 border-signal/20 border-t-signal animate-spin" />
                <div className="space-y-1">
                  <p className="font-display font-semibold text-sm text-slate-900 text-slate-900">
                    Rendering via Pollinations.ai...
                  </p>
                  <p className="font-mono text-xs text-slate-700">
                    Generating high-resolution image data
                  </p>
                </div>
              </div>
            )}

            {!error && !isGenerating && generatedImage && (
              <div className="w-full flex flex-col items-center space-y-4">
                <div className="max-h-[500px] overflow-hidden rounded border border-graphite/30 shadow-lg">
                  <img
                    src={generatedImage}
                    alt="Generated schematic"
                    className="max-h-[480px] w-auto object-contain rounded"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 rounded bg-signal hover:bg-signal-hover text-slate-900 font-mono font-bold text-xs transition-colors shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>DOWNLOAD HIGH-RES</span>
                  </button>

                  <button
                    onClick={handleSaveSpec}
                    className="flex items-center gap-2 px-4 py-2 rounded border border-graphite/40 hover:border-signal text-slate-900 text-slate-900 font-mono font-bold text-xs transition-colors shadow-sm bg-card-bg"
                    title="Download generation prompt and parameters with timestamp"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>SAVE / DOWNLOAD SPEC</span>
                  </button>

                  <button
                    onClick={() => handleGenerate()}
                    className="flex items-center gap-2 px-4 py-2 rounded border border-graphite/40 hover:border-signal text-slate-700 text-slate-700 font-mono text-xs transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>RE-ROLL</span>
                  </button>
                </div>
              </div>
            )}

            {!error && !isGenerating && !generatedImage && (
              <div className="text-center p-8 space-y-2">
                <Cpu className="w-12 h-12 text-slate-700 mx-auto opacity-30" />
                <p className="font-display font-medium text-slate-900 text-slate-900">
                  Waiting for prompt submission
                </p>
                <p className="font-mono text-xs text-slate-700">
                  Enter a description on the left and select a preset to generate.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
