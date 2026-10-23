"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, Copy, Check, RefreshCw, ShieldCheck, FileDown } from "lucide-react";
import { downloadTextReport } from "@/lib/export-utils";

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState<number>(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    let charset = "";
    if (useLower) charset += "abcdefghijklmnopqrstuvwxyz";
    if (useUpper) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (useNumbers) charset += "0123456789";
    if (useSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (avoidAmbiguous) {
      charset = charset.replace(/[il1Lo0O]/g, "");
    }

    if (!charset) {
      setPassword("");
      return;
    }

    let generated = "";
    const array = new Uint32Array(length);
    if (typeof window !== "undefined" && window.crypto) {
      window.crypto.getRandomValues(array);
      for (let i = 0; i < length; i++) {
        generated += charset[array[i] % charset.length];
      }
    } else {
      for (let i = 0; i < length; i++) {
        generated += charset[Math.floor(Math.random() * charset.length)];
      }
    }

    setPassword(generated);
  };

  useEffect(() => {
    generatePassword();
  }, [length, useUpper, useLower, useNumbers, useSymbols, avoidAmbiguous]);

  // Calculate Shannon Entropy
  const calculateEntropy = () => {
    let poolSize = 0;
    if (useLower) poolSize += 26;
    if (useUpper) poolSize += 26;
    if (useNumbers) poolSize += 10;
    if (useSymbols) poolSize += 30;
    if (poolSize === 0) return 0;

    return Math.round(length * Math.log2(poolSize));
  };

  const entropy = calculateEntropy();

  const getStrengthRating = (ent: number) => {
    if (ent < 40) return { label: "Weak", color: "text-red-500", bar: "w-1/4 bg-red-500" };
    if (ent < 60) return { label: "Moderate", color: "text-signal", bar: "w-2/4 bg-signal" };
    if (ent < 80) return { label: "Strong", color: "text-wire", bar: "w-3/4 bg-wire" };
    return { label: "Unbreakable", color: "text-wire-dark text-emerald-700", bar: "w-full bg-wire" };
  };

  const strength = getStrengthRating(entropy);

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSaveKey = () => {
    if (!password) return;

    downloadTextReport(
      "security-key-record",
      "Cryptographic Password Generator",
      {
        "Generated Key Length": `${length} characters`,
        "Shannon Entropy": `${entropy} Bits`,
        "Security Classification": strength.label.toUpperCase(),
        "Include Uppercase": useUpper ? "YES" : "NO",
        "Include Lowercase": useLower ? "YES" : "NO",
        "Include Numbers": useNumbers ? "YES" : "NO",
        "Include Special Symbols": useSymbols ? "YES" : "NO",
        "Avoid Ambiguous Chars": avoidAmbiguous ? "YES" : "NO",
      },
      `GENERATED SECURITY CREDENTIAL:\n${password}`
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
            Cryptographic Password Generator
          </h1>
          <p className="font-mono text-xs text-slate-800 text-slate-800 font-medium">
            Hardware WebCrypto API pseudo-random key generation with live entropy rating.
          </p>
        </div>

        <button
          onClick={handleSaveKey}
          disabled={!password}
          className="px-4 py-2 rounded bg-signal hover:bg-signal-hover text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-40"
          title="Download secure key record file"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>SAVE / DOWNLOAD KEY</span>
        </button>
      </div>

      <div className="p-6 rounded-lg border border-graphite/30 bg-card-bg space-y-6 font-mono text-xs">
        {/* Password Display Box */}
        <div className="p-4 rounded-lg bg-white bg-white border border-graphite/30 flex items-center justify-between gap-4">
          <span className="font-mono text-base sm:text-xl font-bold tracking-wider text-signal break-all">
            {password || "Select at least one character set"}
          </span>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={generatePassword}
              className="p-2 rounded border border-graphite/30 hover:border-signal text-slate-700 hover:text-signal"
              title="Regenerate"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded bg-signal hover:bg-signal-hover text-slate-900 font-bold flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-wire-dark" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "COPIED" : "COPY"}</span>
            </button>
          </div>
        </div>

        {/* Strength & Entropy Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-700">
              ENTROPY: <strong className="text-slate-900 text-slate-900">{entropy} BITS</strong>
            </span>
            <span className={`font-bold ${strength.color}`}>{strength.label.toUpperCase()}</span>
          </div>
          <div className="h-2 w-full bg-graphite/20 rounded-full overflow-hidden">
            <div className={`h-full ${strength.bar} transition-all duration-300`} />
          </div>
        </div>

        {/* Options */}
        <div className="space-y-4 pt-4 border-t border-graphite/20">
          <div className="space-y-1">
            <div className="flex justify-between text-slate-700">
              <span>PASSWORD LENGTH</span>
              <span className="font-bold text-slate-900 text-slate-900">{length} characters</span>
            </div>
            <input
              type="range"
              min="6"
              max="64"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-signal"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useUpper}
                onChange={(e) => setUseUpper(e.target.checked)}
                className="w-4 h-4 accent-signal"
              />
              <span>Uppercase Letters (A-Z)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useLower}
                onChange={(e) => setUseLower(e.target.checked)}
                className="w-4 h-4 accent-signal"
              />
              <span>Lowercase Letters (a-z)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useNumbers}
                onChange={(e) => setUseNumbers(e.target.checked)}
                className="w-4 h-4 accent-signal"
              />
              <span>Numbers (0-9)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useSymbols}
                onChange={(e) => setUseSymbols(e.target.checked)}
                className="w-4 h-4 accent-signal"
              />
              <span>Symbols (!@#$%^&amp;*)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer sm:col-span-2">
              <input
                type="checkbox"
                checked={avoidAmbiguous}
                onChange={(e) => setAvoidAmbiguous(e.target.checked)}
                className="w-4 h-4 accent-signal"
              />
              <span>Avoid Ambiguous Characters (l, 1, I, O, 0)</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
