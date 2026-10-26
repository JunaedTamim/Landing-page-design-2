import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const documents = {
  privacy: {
    title: "A little privacy.", lead: "Your creative life is yours. Here’s a clear, human explanation of what this storefront collects, and why.",
    sections: [
      { title: "The details you choose to share", text: "When you place an order, we save your name, email address, country, license selection, order amount, any discount code, and order status. Contact forms save your name, email, and message. If you opt into the newsletter, we save your email address and signup date. We do not sell personal information." },
      { title: "Why we keep those details", text: "We use order information to prepare your download, maintain your receipt, help with support requests, and meet applicable record-keeping requirements. Newsletter signup is optional and separate from buying a toolkit. Contact messages are used to respond to your request." },
      { title: "Payments stay with the payment provider", text: "If live payments are enabled, Stripe securely processes payment information on its hosted checkout. This website never asks for or stores your full card details. Stripe handles your payment data under its own privacy policy. In demo mode, no payment information is collected and no charge is made." },
      { title: "Your browser, and your private download link", text: "Checkout temporarily saves the name, email, and country you enter in your browser’s session storage so you can return without starting over. It is cleared on a completed demo checkout or when the browser session ends. We use temporary request-rate records to protect forms from abuse. We do not use advertising trackers. Your order confirmation URL is a private access link: anyone you share it with can see that receipt and its downloads." },
      { title: "Your choices", text: "You can request a copy, correction, or deletion of your personal information, or removal from the newsletter list, through the Say hello form in the footer. Include the email used for your order. We may need to verify your request and retain records where legally required. For your safety, never send passwords or card details through the form." },
      { title: "Keeping things clear", text: "This is a working demonstration storefront. Form submissions and demo orders are stored in this application’s database. Demo confirmations provide downloads on screen; an email-delivery service is not enabled by default. Any changes to these practices will be reflected on this page." },
    ],
  },
  terms: {
    title: "The little details.", lead: "Simple terms for a thoughtful little toolkit. Please take a moment to read these before placing an order.",
    sections: [
      { title: "What you’re getting", text: "The Creator’s Toolkit is a downloadable collection of ten organizational templates, supplied as a Notion-ready HTML workspace, three CSV trackers, and a getting-started guide. Notion is a separate service and is not included. A free Notion account is sufficient to use the templates. Folio is independent and is not affiliated with Notion." },
      { title: "Your license", text: "The personal license permits one person to use and customize the toolkit for personal and business organization. The studio license covers a single team of up to five people. You may change the content and layout for your own work. You may not resell, publicly redistribute, sublicense, or repackage the templates as a competing product. The examples in the toolkit are illustrative." },
      { title: "A one-time purchase", text: "Prices are displayed in US dollars. Any valid discount is shown before you continue to payment. Your order is a one-time purchase, not a subscription. The displayed total includes any applicable taxes. Paid downloads are available only after the payment has been verified. When checkout is labeled as a demo, no charge is made and the order is a preview rather than a paid purchase." },
      { title: "Digital delivery and future updates", text: "After a completed order, your files are available on your confirmation page. Keep the confirmation URL private and bookmark it for later access. Future updates to this edition, if released, are included in your license without an additional purchase. There is no promised update schedule. Initial Notion imports work best on desktop; the imported workspace can then be used on mobile." },
      { title: "A 14-day happiness guarantee", text: "If the toolkit is not right for you, contact us within 14 days of a paid purchase using the Say hello form. Include your order number and the email used at checkout. We will help with setup or arrange a refund to the original payment method. Your statutory consumer rights are not affected. Demo orders have no refundable payment because no payment was collected." },
      { title: "A little common sense", text: "The toolkit is an organizational aid, not accounting, tax, financial, or legal advice. You are responsible for the information you add and for backing up your work. Do not put payment credentials or other sensitive secrets into a shared workspace. We aim to keep downloads accessible, but cannot guarantee uninterrupted availability or the behavior of third-party services." },
      { title: "Need a little clarification?", text: "Use the Say hello form in the footer for questions, license requests, or help with your order. These terms apply to your use of this storefront and the toolkit. If a provision conflicts with a mandatory consumer protection, that protection takes priority." },
    ],
  },
} as const;

function getDocument(slug: string) {
  if (slug !== "privacy" && slug !== "terms") notFound();
  return documents[slug];
}

export async function generateMetadata({ params }: { params: Promise<{ policy: string }> }): Promise<Metadata> {
  const { policy } = await params;
  const document = getDocument(policy);
  return { title: policy === "privacy" ? "Privacy, simply" : "Terms, simply", description: document.lead };
}

export default async function PolicyPage({ params }: { params: Promise<{ policy: string }> }) {
  const { policy } = await params;
  const document = getDocument(policy);
  return <><SiteHeader/><main id="main" className="policy-page"><span className="eyebrow">A LITTLE CLARITY IS A GOOD THING</span><h1>{document.title}</h1><p className="policy-lead">{document.lead}</p><p className="policy-updated">Last updated: June 2026</p>{document.sections.map(section => <section className="policy-section" key={section.title}><h2>{section.title}</h2><p>{section.text}</p></section>)}</main><SiteFooter/></>;
}
