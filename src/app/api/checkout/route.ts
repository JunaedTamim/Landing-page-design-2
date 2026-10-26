import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, subscribers } from "@/db/schema";
import { ApiError, guardRequest, handleApiError, json, readPayload } from "@/lib/api";
import { calculatePrice, COUNTRIES, isEmail, isLicense, isUuid, PRODUCT } from "@/lib/product";
import { getStripe } from "@/lib/payments";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    guardRequest(request, "checkout", 15);
    const body = await readPayload(request);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const country = typeof body.country === "string" ? body.country : "";
    const { license, requestKey } = body;
    if (name.length < 2 || name.length > 120) throw new ApiError("Please enter your full name (2–120 characters).");
    if (!isEmail(email)) throw new ApiError("Please enter a valid email address.");
    if (!COUNTRIES.includes(country)) throw new ApiError("Please choose your country or region.");
    if (!isLicense(license)) throw new ApiError("Please choose a personal or studio license.");
    if (!isUuid(requestKey)) throw new ApiError("Please refresh the checkout and try again.");
    if (body.terms !== true) throw new ApiError("Please agree to the terms of use to continue.");
    const promoCode = typeof body.promoCode === "string" ? body.promoCode : "";
    if (promoCode.length > 30) throw new ApiError("That discount code is too long.");
    let pricing;
    try { pricing = calculatePrice(license, promoCode); } catch (error) { throw new ApiError(error instanceof Error ? error.message : "Invalid discount code."); }
    const stripe = getStripe();
    if (!process.env.DATABASE_URL) {
      return json({ url: `/checkout/success?order=00000000-0000-0000-0000-000000000000`, orderId: "00000000-0000-0000-0000-000000000000", mode: "demo" });
    }
    const [inserted] = await db.insert(orders).values({ requestKey, name, email, country, license, ...pricing, status: stripe ? "pending" : "demo", updates: body.updates === true }).onConflictDoNothing({ target: orders.requestKey }).returning();
    const order = inserted ?? (await db.select().from(orders).where(eq(orders.requestKey, requestKey)).limit(1))[0];
    if (!order || order.email !== email || order.license !== license || order.total !== pricing.total || order.name !== name || order.country !== country) throw new ApiError("Your checkout details changed. Please try again.", 409);
    if (body.updates === true) await db.insert(subscribers).values({ email }).onConflictDoNothing({ target: subscribers.email });
    const successPath = `/checkout/success?order=${order.id}`;
    if (order.status === "demo" || order.status === "paid") return json({ url: successPath, orderId: order.id, mode: order.status });
    if (!stripe) throw new ApiError("Payment checkout is temporarily unavailable. Please try again shortly.", 503);
    if (order.stripeSessionId) {
      const existing = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
      if (existing.status === "complete") return json({ url: successPath, orderId: order.id });
      if (existing.status === "open" && existing.url) return json({ url: existing.url, orderId: order.id });
      throw new ApiError("That checkout session expired. Please try once more.", 409);
    }
    const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      client_reference_id: order.id,
      metadata: { orderId: order.id, license },
      line_items: [{ quantity: 1, price_data: { currency: "usd", unit_amount: order.total, product_data: { name: `${PRODUCT.name} — ${license === "personal" ? "Personal" : "Studio"} license`, description: "10 Notion-ready templates, quick-start guide, CSV trackers, and lifetime updates." } } }],
      success_url: `${origin}${successPath}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?license=${license}&canceled=1`,
    }, { idempotencyKey: `folio-order-${order.id}` });
    if (!session.url) throw new Error("Stripe did not return a checkout URL.");
    await db.update(orders).set({ stripeSessionId: session.id }).where(eq(orders.id, order.id));
    return json({ url: session.url, orderId: order.id });
  } catch (error) { return handleApiError(error); }
}
