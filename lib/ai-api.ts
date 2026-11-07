/**
 * ToolNest AI API utility
 * Calls our own /api/ai server route (which proxies Pollinations server-side).
 * This avoids browser CORS restrictions and 402 rate-limit blocks.
 */

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

/**
 * Call the ToolNest AI proxy with automatic retry on failure.
 * @param prompt  The user prompt text
 * @returns       The AI-generated text string
 * @throws        Error with human-readable message if all retries fail
 */
export async function callAI(prompt: string): Promise<string> {
  let lastError: string = "Request failed";

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const json = await response.json();

      if (!response.ok) {
        // Retry on 502 (upstream AI failure)
        lastError = json?.error || `Server error ${response.status}`;
        if (attempt <= MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
          continue;
        }
        throw new Error(lastError);
      }

      const text: string = json?.result;
      if (!text || text.trim().length === 0) {
        lastError = "AI returned an empty response";
        if (attempt <= MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
          continue;
        }
        throw new Error(lastError);
      }

      return text.trim();
    } catch (err) {
      if (err instanceof Error && !err.message.includes("fetch")) {
        // Re-throw non-network errors immediately (logic errors)
        throw err;
      }
      lastError = err instanceof Error ? err.message : "Network error";
      if (attempt <= MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }
  }

  throw new Error(lastError);
}
