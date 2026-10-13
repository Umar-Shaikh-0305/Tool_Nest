/**
 * ToolNest Export & Save Utilities
 * Allows users to download timestamped technical spec sheets and save to local history.
 */

import { saveUserHistoryItem } from "@/lib/auth";

export interface ExportData {
  toolName: string;
  toolSlug: string;
  summary: string;
  details: Record<string, string | number | boolean | null | undefined>;
}

export function downloadTextReport(
  filename: string,
  toolName: string,
  details: Record<string, any>,
  extraContent?: string
) {
  const now = new Date();
  const dateFormatted = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeFormatted = now.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const divider = "=".repeat(76);
  const thinDivider = "-".repeat(76);

  let report = `${divider}\n`;
  report += `TOOLNEST ENGINEERING WORKBENCH · TECHNICAL RECORD\n`;
  report += `${divider}\n`;
  report += `MODULE:        ${toolName.toUpperCase()}\n`;
  report += `DATE:          ${dateFormatted}\n`;
  report += `TIMESTAMP:     ${timeFormatted} (Local Time)\n`;
  report += `EXECUTION:     100% Client-Side Private Computation\n`;
  report += `${thinDivider}\n\n`;

  report += `[ PARAMETERS & RESULTS ]\n\n`;
  for (const [key, value] of Object.entries(details)) {
    const paddedKey = (key + ":").padEnd(24, " ");
    report += `  ${paddedKey} ${value}\n`;
  }

  if (extraContent) {
    report += `\n${thinDivider}\n`;
    report += `[ PAYLOAD DATA ]\n\n`;
    report += `${extraContent}\n`;
  }

  report += `\n${divider}\n`;
  report += `ToolNest Precision Multi-Tool Hub · Zero-Cost Infrastructure\n`;
  report += `${divider}\n`;

  const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${now.toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Save to account history in localStorage so it appears in /account
  try {
    const historyItem = {
      id: `save-${Date.now()}`,
      tool_slug: filename,
      title: `Saved ${toolName} Record (${dateFormatted})`,
      created_at: now.toISOString(),
      metadata: details,
    };
    saveUserHistoryItem(historyItem);
    const existing = JSON.parse(localStorage.getItem("toolnest_saved_history") || "[]");
    localStorage.setItem("toolnest_saved_history", JSON.stringify([historyItem, ...existing.slice(0, 49)]));
  } catch (e) {
    console.warn("Could not write to localStorage history", e);
  }
}
