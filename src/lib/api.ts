import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
const globalStore = globalThis as typeof globalThis & { folioRateLimits?: Map<string, { count: number; reset: number }> };
const limits = globalStore.folioRateLimits ??= new Map();

export function guardRequest(request: Request, action: string, maximum = 15) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || new URL(request.url).host;
  if (origin) {
    try { if (new URL(origin).host !== host) throw new ApiError("Please submit this form from the folio website.", 403); }
    catch (error) { if (error instanceof ApiError) throw error; throw new ApiError("Invalid request origin.", 403); }
  }
  const key = `${action}:${request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local"}`;
  const now = Date.now();
  if (limits.size > 10000) { for (const [key, value] of limits) if (value.reset < now) limits.delete(key); }
  const current = limits.get(key);
  if (!current || current.reset < now) { limits.set(key, { count: 1, reset: now + 60_000 }); return; }
  if (current.count >= maximum) throw new ApiError("A little breather, please. Try again in a minute.", 429);
  current.count++;
}

export async function readPayload(request: Request): Promise<Record<string, unknown>> {
  const text = await request.text();
  if (text.length > 12000) throw new ApiError("That message is a little too long.", 413);
  try {
    const value: unknown = JSON.parse(text);
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value as Record<string, unknown>;
  } catch { throw new ApiError("We couldn’t read that request. Please try again."); }
}

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) return json({ error: error.message }, error.status);
  console.error("Folio request failed:", error);
  return json({ error: "Something didn’t quite go to plan. Please try again in a moment." }, 500);
}
