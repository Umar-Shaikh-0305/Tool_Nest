export interface ToolItem {
  id: string;
  slug: string;
  name: string;
  category: "Image Tools" | "PDF Tools" | "Calculators" | "Converters" | "Generators" | "Text Tools";
  shortDescription: string;
  icon: string;
  badge?: string;
  tags: string[];
  acceptedFileTypes?: string[];
  executionType: "CLIENT-SIDE" | "SERVERLESS-API";
  latency: string;
  featured?: boolean;
}

export const TOOLS_CATEGORIES = [
  "All",
  "Image Tools",
  "PDF Tools",
  "Calculators",
  "Converters",
  "Generators",
  "Text Tools",
] as const;

export const TOOLS_REGISTRY: ToolItem[] = [
  // Detailed 1: Image to PDF
  {
    id: "image-to-pdf",
    slug: "image-to-pdf",
    name: "Image to PDF Studio",
    category: "Image Tools",
    shortDescription: "Combine multiple images into PDF with crop, rotate, blur, and color adjustment workbench.",
    icon: "FileImage",
    badge: "CANVAS + JSPDF",
    tags: ["image", "pdf", "convert", "crop", "rotate", "canvas", "filter", "compress"],
    acceptedFileTypes: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"],
    executionType: "CLIENT-SIDE",
    latency: "< 50ms",
    featured: true,
  },
  // Detailed 2: AI Text to Image
  {
    id: "text-to-image",
    slug: "text-to-image",
    name: "AI Schematic & Image Gen",
    category: "Generators",
    shortDescription: "Zero-cost AI text-to-image generator using keyless Pollinations.ai engine with style presets.",
    icon: "Sparkles",
    badge: "POLLINATIONS.AI",
    tags: ["ai", "image", "generate", "art", "schematic", "blueprint", "prompt"],
    executionType: "SERVERLESS-API",
    latency: "~2-4s",
    featured: true,
  },
  // Detailed 3: Scientific Calculator
  {
    id: "scientific-calculator",
    slug: "scientific-calculator",
    name: "Scientific Calculator",
    category: "Calculators",
    shortDescription: "Full scientific function set (trig, log, factorial, powers) with memory ledger & calculation history.",
    icon: "Calculator",
    badge: "MATH.JS SAFE",
    tags: ["math", "calculator", "scientific", "trig", "logarithm", "memory", "history"],
    executionType: "CLIENT-SIDE",
    latency: "< 1ms",
    featured: true,
  },
  // Detailed 4: Digital Storage Converter
  {
    id: "storage-converter",
    slug: "storage-converter",
    name: "Digital Storage Converter",
    category: "Converters",
    shortDescription: "Live conversion between Bits, Bytes, KB, MB, GB, TB, PB with IEC 1024 vs SI 1000 standards.",
    icon: "HardDrive",
    badge: "IEC 1024 / SI 1000",
    tags: ["storage", "data", "bytes", "bits", "megabytes", "gigabytes", "kib", "converter"],
    executionType: "CLIENT-SIDE",
    latency: "< 1ms",
    featured: true,
  },
  // Additional: PDF Merge & Split
  {
    id: "pdf-merge-split",
    slug: "pdf-merge-split",
    name: "PDF Merge & Split",
    category: "PDF Tools",
    shortDescription: "Combine multiple PDF documents into one or extract specific page ranges securely client-side.",
    icon: "Layers",
    badge: "PDF-LIB",
    tags: ["pdf", "merge", "split", "extract", "combine", "pages"],
    acceptedFileTypes: [".pdf"],
    executionType: "CLIENT-SIDE",
    latency: "< 200ms",
  },
  // Additional: PDF Compress
  {
    id: "pdf-compress",
    slug: "pdf-compress",
    name: "PDF Optimizer / Compress",
    category: "PDF Tools",
    shortDescription: "Optimize and reduce PDF file size directly in your browser without external servers.",
    icon: "FileDown",
    badge: "IN-BROWSER",
    tags: ["pdf", "compress", "shrink", "optimize", "size"],
    acceptedFileTypes: [".pdf"],
    executionType: "CLIENT-SIDE",
    latency: "< 300ms",
  },
  // Additional: Image Compressor & Resizer
  {
    id: "image-compressor",
    slug: "image-compressor",
    name: "Image Compressor & Resizer",
    category: "Image Tools",
    shortDescription: "Lossless/lossy compression, dimension scaling, and quality optimization with live byte preview.",
    icon: "Minimize2",
    badge: "CANVAS WORKER",
    tags: ["image", "compress", "resize", "scale", "optimize", "jpeg", "png", "webp"],
    acceptedFileTypes: [".jpg", ".jpeg", ".png", ".webp"],
    executionType: "CLIENT-SIDE",
    latency: "< 80ms",
  },
  // Additional: Background Remover
  {
    id: "background-remover",
    slug: "background-remover",
    name: "Background Eraser",
    category: "Image Tools",
    shortDescription: "Client-side subject segmentation & background isolation with transparent PNG export.",
    icon: "Scissors",
    badge: "CLIENT-AI / CANVAS",
    tags: ["background", "remove", "transparent", "cutout", "chroma", "image"],
    acceptedFileTypes: [".jpg", ".jpeg", ".png", ".webp"],
    executionType: "CLIENT-SIDE",
    latency: "~500ms",
  },
  // Additional: QR Code Generator
  {
    id: "qr-code-generator",
    slug: "qr-code-generator",
    name: "QR Code Generator",
    category: "Generators",
    shortDescription: "Generate customized high-resolution QR codes from text or URLs with color controls & SVG export.",
    icon: "QrCode",
    badge: "SVG / PNG",
    tags: ["qr", "qrcode", "generator", "link", "matrix", "barcode"],
    executionType: "CLIENT-SIDE",
    latency: "< 5ms",
  },
  // Additional: Word & Character Counter
  {
    id: "word-counter",
    slug: "word-counter",
    name: "Word & Character Counter",
    category: "Text Tools",
    shortDescription: "Instant real-time metrics for word count, character count, syllables, reading time, and keyword density.",
    icon: "FileText",
    badge: "LIVE METRICS",
    tags: ["text", "word count", "character count", "reading time", "density", "essay"],
    acceptedFileTypes: [".txt", ".md", ".json"],
    executionType: "CLIENT-SIDE",
    latency: "< 1ms",
  },
  // Additional: Unit Converter
  {
    id: "unit-converter",
    slug: "unit-converter",
    name: "Engineering Unit Converter",
    category: "Converters",
    shortDescription: "Precision conversion for Length, Weight/Mass, Temperature, Speed, Area, and Volume.",
    icon: "Scale",
    badge: "SI & IMPERIAL",
    tags: ["unit", "convert", "length", "weight", "temperature", "speed", "metric", "imperial"],
    executionType: "CLIENT-SIDE",
    latency: "< 1ms",
  },
  // Additional: Percentage Calculator
  {
    id: "percentage-calculator",
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    category: "Calculators",
    shortDescription: "4-in-1 percentage workbench: X% of Y, what % is X of Y, percentage increase/decrease, margin/discount.",
    icon: "Percent",
    badge: "4 MODES",
    tags: ["percentage", "math", "discount", "margin", "increase", "decrease", "fraction"],
    executionType: "CLIENT-SIDE",
    latency: "< 1ms",
  },
  // Additional: BMI Calculator
  {
    id: "bmi-calculator",
    slug: "bmi-calculator",
    name: "Body Mass Index (BMI)",
    category: "Calculators",
    shortDescription: "Metric & imperial body mass index calculator with gauge indicator and healthy weight ranges.",
    icon: "Activity",
    badge: "METRIC & US",
    tags: ["bmi", "health", "weight", "height", "fitness", "calculator"],
    executionType: "CLIENT-SIDE",
    latency: "< 1ms",
  },
  // Additional: Age Calculator
  {
    id: "age-calculator",
    slug: "age-calculator",
    name: "Chronological Age Calculator",
    category: "Calculators",
    shortDescription: "Exact age broken down into years, months, days, minutes, plus next birthday live countdown.",
    icon: "Calendar",
    badge: "EXACT TIME",
    tags: ["age", "birthday", "time", "date", "calendar", "calculator"],
    executionType: "CLIENT-SIDE",
    latency: "< 1ms",
  },
  // Additional: Password Generator
  {
    id: "password-generator",
    slug: "password-generator",
    name: "Cryptographic Password Gen",
    category: "Generators",
    shortDescription: "Configurable password generator with entropy calculation, character toggles, and security rating.",
    icon: "KeyRound",
    badge: "ENTROPY METER",
    tags: ["password", "generator", "security", "entropy", "crypto", "random"],
    executionType: "CLIENT-SIDE",
    latency: "< 1ms",
  },
  // Additional: Color Picker & Palette
  {
    id: "color-picker",
    slug: "color-picker",
    name: "Color Matrix & Palettes",
    category: "Generators",
    shortDescription: "Eyedropper, Hex/RGB/HSL conversion, and harmonic palette generator (complementary, triadic, analogous).",
    icon: "Palette",
    badge: "EYEDROPPER API",
    tags: ["color", "palette", "hex", "rgb", "hsl", "eyedropper", "design", "css"],
    executionType: "CLIENT-SIDE",
    latency: "< 1ms",
  },
  // Additional: JSON Formatter & Validator
  {
    id: "json-formatter",
    slug: "json-formatter",
    name: "JSON Formatter & Inspector",
    category: "Text Tools",
    shortDescription: "Beautify, minify, validate syntax with line-by-line error location, and explore interactive JSON tree.",
    icon: "Code2",
    badge: "SYNTAX LINT",
    tags: ["json", "format", "beautify", "minify", "validate", "lint", "developer"],
    acceptedFileTypes: [".json", ".txt"],
    executionType: "CLIENT-SIDE",
    latency: "< 2ms",
  },
  // Additional: Base64 Converter
  {
    id: "base64-converter",
    slug: "base64-converter",
    name: "Base64 Encoder & Decoder",
    category: "Converters",
    shortDescription: "Encode and decode raw strings and binary files to Base64 with instant preview & download.",
    icon: "Binary",
    badge: "STRING & FILE",
    tags: ["base64", "encode", "decode", "binary", "data-url", "ascii"],
    acceptedFileTypes: ["*"],
    executionType: "CLIENT-SIDE",
    latency: "< 2ms",
  },
];
