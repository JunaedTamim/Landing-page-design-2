import Stripe from "stripe";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { isUuid } from "./product";

let stripe: Stripe | null = null;
export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripe;
}

export async function fulfillCheckout(session: Stripe.Checkout.Session) {
  const id = session.metadata?.orderId;
  if (session.payment_status !== "paid" || !isUuid(id)) return false;
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order || session.amount_total !== order.total || session.currency !== "usd" || (order.stripeSessionId && order.stripeSessionId !== session.id)) return false;
  if (order.status === "paid") return true;
  await db.update(orders).set({ status: "paid", stripeSessionId: session.id }).where(and(eq(orders.id, id), eq(orders.status, "pending")));
  return true;
}

export async function getVerifiedOrder(id: string) {
  if (!process.env.DATABASE_URL) {
    return {
      id: "00000000-0000-0000-0000-000000000000",
      name: "Fellow Creator",
      email: "hello@example.com",
      country: "US",
      license: "personal",
      status: "demo",
      total: 4900,
      createdAt: new Date(),
    } as any;
  }
  if (!isUuid(id)) return null;
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) return null;
  const stripe = getStripe();
  if (order.status === "pending" && order.stripeSessionId && stripe) {
    try {
      const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
      if (await fulfillCheckout(session)) return { ...order, status: "paid" };
    } catch (error) { console.error("Could not confirm checkout payment:", error); }
  }
  return order;
}
