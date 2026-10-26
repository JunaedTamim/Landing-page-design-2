import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { ApiError, guardRequest, handleApiError, json, readPayload } from "@/lib/api";
import { isEmail } from "@/lib/product";

export async function POST(request: Request) {
  try {
    guardRequest(request, "contact", 5);
    const body = await readPayload(request);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (name.length < 2 || name.length > 120) throw new ApiError("Please let us know your name (2–120 characters).");
    if (!isEmail(email)) throw new ApiError("Please enter a valid email so we can get back to you.");
    if (message.length < 10 || message.length > 5000) throw new ApiError("A little more detail? Your message should be between 10 and 5,000 characters.");
    if (!process.env.DATABASE_URL) return json({ success: true });
    await db.insert(contactMessages).values({ name, email, message });
    return json({ success: true });
  } catch (error) { return handleApiError(error); }
}
