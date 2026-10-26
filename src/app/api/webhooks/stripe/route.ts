import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { fulfillCheckout, getStripe } from "@/lib/payments";
import { isUuid } from "@/lib/product";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return Response.json({ error: "Payment webhook is not configured." }, { status: 503 });
  const signature = request.headers.get("stripe-signature");
  if (!signature) return Response.json({ error: "Missing payment signature." }, { status: 400 });
  let event;
  try { event = stripe.webhooks.constructEvent(await request.text(), signature, secret); }
  catch { return Response.json({ error: "Invalid payment signature." }, { status: 400 }); }
  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") await fulfillCheckout(event.data.object);
    if (event.type === "checkout.session.expired") {
      const id = event.data.object.metadata?.orderId;
      if (isUuid(id)) await db.update(orders).set({ status: "expired" }).where(and(eq(orders.id, id), eq(orders.status, "pending"), eq(orders.stripeSessionId, event.data.object.id)));
    }
    return Response.json({ received: true });
  } catch (error) {
    console.error("Payment webhook processing failed:", error);
    return Response.json({ error: "Please retry this payment event." }, { status: 500 });
  }
}
