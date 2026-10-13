/**
 * Universal File Import & Client-side Parser
 * Processes files 100% locally in the browser with zero server round-trips.
 */

export interface ParsedFile {
  id: string;
  name: string;
  size: number;
  type: "image" | "document" | "spreadsheet" | "code" | "other";
  mimeType: string;
  extension: string;
  previewUrl?: string;
  extractedText?: string;
  extractedData?: any;
  file: File;
  suggestedTools: { slug: string; name: string }[];
}

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB client limit

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function getFileCategory(extension: string, mime: string): ParsedFile["type"] {
  const ext = extension.toLowerCase();
  if (["jpg", "jpeg", "png", "webp", "gif", "bmp", "svg"].includes(ext) || mime.startsWith("image/")) {
    return "image";
  }
  if (["xlsx", "xls", "csv"].includes(ext)) {
    return "spreadsheet";
  }
  if (["json", "js", "ts", "html", "css", "xml", "py"].includes(ext)) {
    return "code";
  }
  if (["pdf", "docx", "doc", "txt", "md", "rtf"].includes(ext)) {
    return "document";
  }
  return "other";
}

export function getSmartToolSuggestions(fileType: ParsedFile["type"], extension: string): { slug: string; name: string }[] {
  const ext = extension.toLowerCase();
  switch (fileType) {
    case "image":
      return [
        { slug: "image-to-pdf", name: "Convert to PDF" },
        { slug: "image-compressor", name: "Compress Image" },
        { slug: "background-remover", name: "Erase Background" },
        { slug: "base64-converter", name: "Base64 Encode" },
      ];
    case "document":
      if (ext === "pdf") {
        return [
          { slug: "pdf-merge-split", name: "Merge / Split" },
          { slug: "pdf-compress", name: "Compress PDF" },
          { slug: "word-counter", name: "Word Count" },
        ];
      }
      return [
        { slug: "word-counter", name: "Analyze Text & Words" },
        { slug: "base64-converter", name: "Encode Base64" },
      ];
    case "spreadsheet":
      return [
        { slug: "storage-converter", name: "Storage Converter" },
        { slug: "word-counter", name: "Analyze Content" },
      ];
    case "code":
      if (ext === "json") {
        return [
          { slug: "json-formatter", name: "Format & Validate JSON" },
          { slug: "base64-converter", name: "Base64 Encode" },
        ];
      }
      return [
        { slug: "word-counter", name: "Count Lines & Words" },
        { slug: "base64-converter", name: "Base64 Encode" },
      ];
    default:
      return [
        { slug: "base64-converter", name: "Base64 Converter" },
        { slug: "storage-converter", name: "Storage Size Calculator" },
      ];
  }
}

export async function parseClientFile(file: File): Promise<ParsedFile> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File "${file.name}" exceeds the 20MB client-side limit.`);
  }

  const parts = file.name.split(".");
  const extension = parts.length > 1 ? parts.pop()!.toLowerCase() : "";
  const category = getFileCategory(extension, file.type);
  const suggestedTools = getSmartToolSuggestions(category, extension);

  let previewUrl: string | undefined = undefined;
  let extractedText: string | undefined = undefined;
  let extractedData: any = undefined;

  // 1. Image preview
  if (category === "image") {
    previewUrl = URL.createObjectURL(file);
  }

  // 2. Plain Text / Markdown / JSON
  if (["txt", "md", "json", "csv", "html", "css", "js", "ts", "py"].includes(extension)) {
    try {
      extractedText = await file.text();
    } catch (e) {
      console.warn("Failed to extract plain text", e);
    }
  }

  // 3. DOCX text via mammoth
  if (extension === "docx") {
    try {
      const mammoth = await import("mammoth");
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      extractedText = result.value;
    } catch (e) {
      console.warn("Failed to extract DOCX text via mammoth", e);
    }
  }

  // 4. XLSX / CSV via SheetJS
  if (["xlsx", "xls", "csv"].includes(extension)) {
    try {
      const XLSX = await import("xlsx");
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      extractedData = jsonData;
      extractedText = jsonData.map((row: any) => (Array.isArray(row) ? row.join(" | ") : String(row))).join("\n");
    } catch (e) {
      console.warn("Failed to parse spreadsheet via SheetJS", e);
    }
  }

  // 5. PDF basic client extraction
  if (extension === "pdf") {
    extractedText = `[PDF Document: ${file.name}, size: ${formatBytes(file.size)}]`;
  }

  return {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    name: file.name,
    size: file.size,
    type: category,
    mimeType: file.type || "application/octet-stream",
    extension,
    previewUrl,
    extractedText,
    extractedData,
    file,
    suggestedTools,
  };
}
