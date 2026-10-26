import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { ApiError, guardRequest, handleApiError, json, readPayload } from "@/lib/api";
import { isEmail } from "@/lib/product";

export async function POST(request: Request) {
  try {
    guardRequest(request, "subscribe", 8);
    const body = await readPayload(request);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!isEmail(email)) throw new ApiError("That email looks a little off. Could you double-check it?");
    if (!process.env.DATABASE_URL) return json({ success: true });
    await db.insert(subscribers).values({ email }).onConflictDoNothing({ target: subscribers.email });
    return json({ success: true });
  } catch (error) { return handleApiError(error); }
}
