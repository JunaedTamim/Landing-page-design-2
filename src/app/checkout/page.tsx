import type { Metadata } from "next";
import CheckoutForm from "@/components/checkout-form";
import { isLicense } from "@/lib/product";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "A little closer to your fresh start", robots: { index: false, follow: true } };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ license?: string; canceled?: string }> }) {
  const params = await searchParams;
  return <CheckoutForm initialLicense={isLicense(params.license) ? params.license : "personal"} livePayments={Boolean(process.env.STRIPE_SECRET_KEY)} canceled={params.canceled === "1"}/>;
}
