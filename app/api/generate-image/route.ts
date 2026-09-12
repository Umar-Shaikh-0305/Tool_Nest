import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

/**
 * AI Image Generation Endpoint via Pollinations.ai
 *
 * Free keyless endpoint: https://image.pollinations.ai/prompt/{prompt}
 * Rate-limits: anonymous ~1 req/15s.
 * Optional POLLINATIONS_TOKEN in env to lift limits.
 */

// In-memory fallback rate-limiter when Supabase is not connected
const ipCache = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_WINDOW = 15 * 1000; // 15 seconds
const MAX_PER_WINDOW = 2; // 2 requests per 15s window for anonymous

export async function POST(req: NextRequest) {
  try {
    const { prompt, style, width = 1024, height = 1024, seed } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing required prompt parameter" }, { status: 400 });
    }

    // Identify client IP
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
    const rateKey = `rate:pollinations:${ip}`;

    // 1. Try persistent Supabase rate limiting if configured
    const supabase = getServerSupabase();
    let isAllowed = true;

    if (supabase) {
      try {
        const { data, error } = await supabase.rpc("increment_and_check", {
          p_key: rateKey,
          p_window_seconds: 15,
          p_max_requests: 2,
        });
        if (!error && data !== null) {
          isAllowed = Boolean(data);
        }
      } catch (err) {
        console.warn("Supabase rate limit RPC unavailable, falling back to memory:", err);
      }
    } else {
      // Memory fallback
      const now = Date.now();
      const existing = ipCache.get(ip);
      if (!existing || now - existing.windowStart > RATE_LIMIT_WINDOW) {
        ipCache.set(ip, { count: 1, windowStart: now });
      } else {
        if (existing.count >= MAX_PER_WINDOW) {
          isAllowed = false;
        } else {
          existing.count += 1;
        }
      }
    }

    if (!isAllowed) {
      return NextResponse.json(
        {
          error: "Rate limit reached (~1 request per 15 seconds on free tier). Please wait a few seconds and try again.",
        },
        { status: 429 }
      );
    }

    // Build the final prompt with style modifiers
    let finalPrompt = prompt.trim();
    if (style && style !== "default") {
      finalPrompt = `${finalPrompt}, ${style}`;
    }

    const encodedPrompt = encodeURIComponent(finalPrompt);
    const token = process.env.POLLINATIONS_TOKEN;

    // Construct Pollinations URL with options
    let targetUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true`;
    if (seed) {
      targetUrl += `&seed=${seed}`;
    }
    if (token) {
      targetUrl += `&token=${token}`;
    }

    // Fetch the generated image
    const pollinationsResponse = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": "ToolNest/1.0",
      },
    });

    if (!pollinationsResponse.ok) {
      return NextResponse.json(
        { error: `Pollinations API responded with status ${pollinationsResponse.status}` },
        { status: 502 }
      );
    }

    const imageArrayBuffer = await pollinationsResponse.arrayBuffer();
    const base64Image = Buffer.from(imageArrayBuffer).toString("base64");
    const mimeType = pollinationsResponse.headers.get("content-type") || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    return NextResponse.json({
      success: true,
      imageUrl: dataUrl,
      prompt: finalPrompt,
      width,
      height,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate image" },
      { status: 500 }
    );
  }
}
