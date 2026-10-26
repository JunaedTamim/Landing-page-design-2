"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronRight, CreditCard, FlaskConical, LoaderCircle, LockKeyhole, Plus, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { ToolkitBook } from "./hero-art";
import { Flower, NotionMark } from "./brand";
import { calculatePrice, COUNTRIES, formatMoney, PRODUCT, type License } from "@/lib/product";

type Details = { name: string; email: string; country: string };

export default function CheckoutForm({ initialLicense, livePayments, canceled }: { initialLicense: License; livePayments: boolean; canceled: boolean }) {
  const router = useRouter();
  const [license, setLicense] = useState<License>(initialLicense);
  const [details, setDetails] = useState<Details>({ name: "", email: "", country: "" });
  const [terms, setTerms] = useState(false);
  const [updates, setUpdates] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [appliedCode, setAppliedCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const requestKey = useRef<string | null>(null);
  const pricing = calculatePrice(license, appliedCode);

  useEffect(() => {
    try {
      const draft = JSON.parse(sessionStorage.getItem("folio-checkout-draft") || "null");
      if (draft && typeof draft.name === "string" && typeof draft.email === "string" && typeof draft.country === "string") setDetails({ name: draft.name, email: draft.email, country: COUNTRIES.includes(draft.country) ? draft.country : "" });
    } catch { /* A private browser can still use checkout. */ }
  }, []);

  function updateDetail(key: keyof Details, value: string) {
    const next = { ...details, [key]: value };
    setDetails(next); requestKey.current = null; setError("");
    try { sessionStorage.setItem("folio-checkout-draft", JSON.stringify(next)); } catch { /* Storage is optional. */ }
  }

  async function applyPromo() {
    setPromoLoading(true); setPromoError("");
    try {
      const response = await fetch("/api/promo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ license, code: promoInput }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "We couldn’t apply that code.");
      setAppliedCode(data.promoCode); setPromoInput(data.promoCode); requestKey.current = null;
    } catch (err) { setPromoError(err instanceof Error ? err.message : "Please try that code again."); }
    finally { setPromoLoading(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true); setError("");
    requestKey.current ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...details, license, promoCode: appliedCode, terms, updates, requestKey: requestKey.current }) });
      const data = await response.json();
      if (!response.ok) { if (response.status === 409) requestKey.current = null; throw new Error(data.error || "We couldn’t finish your checkout. Please try again."); }
      if (!data.url || typeof data.url !== "string") throw new Error("Your checkout link couldn’t be created. Please try again.");
      if (data.url.startsWith("/")) {
        try { sessionStorage.removeItem("folio-checkout-draft"); } catch { /* Storage is optional. */ }
        router.push(data.url);
      } else window.location.assign(data.url);
    } catch (err) { setError(err instanceof Error ? err.message : "Please check your connection and try again."); setLoading(false); }
  }

  return <><SiteHeader checkout/><main id="main" className="checkout-page"><div className="checkout-top container"><div className="checkout-breadcrumb" aria-label="Checkout progress"><span className="current"><b>1</b>Your details</span><ChevronRight size={13}/><span><b>2</b>{livePayments ? "Secure payment" : "Review & confirm"}</span><ChevronRight size={13}/><span><b>3</b>Make it yours</span></div>{!livePayments && <span className="preview-mode-badge"><FlaskConical size={11}/>Preview checkout</span>}</div><div className="checkout-layout container"><section className="checkout-details"><div className="checkout-heading-block">{canceled && <p className="cancel-notice" role="status">No rush. Your payment wasn’t completed, and no order was charged here. Your toolkit is still waiting.</p>}<span className="eyebrow">YOUR NEXT CHAPTER IS JUST A CLICK AWAY</span><h1>Good things<br/>are <em>on the way.</em></h1><p className="checkout-intro">A little less scattered. A little more space to create.<br/>Let’s get your new toolkit ready.</p></div><form id="checkout-form" className="checkout-form" onSubmit={submit}><fieldset disabled={loading}><div className="checkout-form-section"><div className="form-section-heading"><span>01</span><h2>A little about you</h2></div><div className="checkout-fields"><label htmlFor="checkout-name">Your full name<input id="checkout-name" name="name" autoComplete="name" placeholder="Alex Taylor" required minLength={2} maxLength={120} value={details.name} onChange={event => updateDetail("name", event.target.value)}/></label><label htmlFor="checkout-email">Email address<input id="checkout-email" name="email" type="email" autoComplete="email" placeholder="you@yourlittleuniverse.com" required maxLength={254} value={details.email} onChange={event => updateDetail("email", event.target.value)}/><span className="field-hint">For your order details. Your download will be ready right after checkout.</span></label><label htmlFor="checkout-country">Country or region<select id="checkout-country" name="country" autoComplete="country-name" required value={details.country} onChange={event => updateDetail("country", event.target.value)}><option value="" disabled>Choose your little corner of the world</option>{COUNTRIES.map(country => <option value={country} key={country}>{country}</option>)}</select></label></div></div><div className="checkout-form-section"><div className="form-section-heading"><span>02</span><h2>{livePayments ? "A safe little checkout" : "Try the full experience"}</h2></div><div className={`payment-notice ${livePayments ? "live" : ""}`}>{livePayments ? <CreditCard size={23} strokeWidth={1.5}/> : <Sparkles size={23} strokeWidth={1.5}/>}<div><strong>{livePayments ? "Your payment is in safe hands." : "A real preview. Not a real charge."}</strong><p>{livePayments ? "You’ll continue to Stripe’s secure checkout to pay by card or an available digital wallet. We never see or store your card details." : "You’re exploring our demo checkout. No card details are needed, and you won’t be charged. You’ll still receive a downloadable sample toolkit."}</p>{livePayments && <div className="payment-logos"><span>VISA</span><span className="mastercard" aria-label="Mastercard"><i/><i/></span><span>stripe</span><LockKeyhole size={12}/></div>}</div></div></div><div className="checkout-consents"><label className="checkbox-label"><input type="checkbox" name="terms" required checked={terms} onChange={event => setTerms(event.target.checked)}/><span>I agree to the <Link href="/terms" target="_blank">terms of use</Link> and <Link href="/privacy" target="_blank">privacy policy</Link>. A little clarity is a good thing.</span></label><label className="checkbox-label"><input type="checkbox" name="updates" checked={updates} onChange={event => setUpdates(event.target.checked)}/><span>Send me occasional good things from folio. Fresh ideas, useful updates, no noise. <em>(Optional)</em></span></label></div><button type="submit" className="button checkout-submit" disabled={loading || promoLoading}>{loading ? <><LoaderCircle size={17} className="spin"/><span>Getting your good things ready…</span></> : <><span>{livePayments ? `Continue to payment · ${formatMoney(pricing.total)}` : "Complete demo order"}</span>{livePayments ? <LockKeyhole size={16}/> : <ArrowRight size={18}/>}</>}</button></fieldset>{error && <p className="form-error" role="alert">{error}</p>}<p className="checkout-reassurance"><LockKeyhole size={11}/>{livePayments ? "Secure checkout. A one-time payment. No surprises." : "No payment details. No charges. Just a little possibility."}</p></form></section><aside className="checkout-summary" aria-label="Your order summary"><button type="button" className="summary-mobile-toggle" aria-label={summaryOpen ? "Hide order summary" : "Show order summary"} aria-expanded={summaryOpen} aria-controls="checkout-summary-details" onClick={() => setSummaryOpen(!summaryOpen)}><span className="summary-toggle-product"><span className="summary-toggle-icon"><NotionMark size={20}/></span><span><strong>Your toolkit & order</strong><small>{license === "studio" ? "Studio license · up to 5 people" : "Personal license · just for you"}</small></span></span><span className="summary-toggle-total">{formatMoney(pricing.total)}<ChevronDown size={15}/></span></button><div id="checkout-summary-details" className={`summary-details ${summaryOpen ? "is-open" : ""}`}><div className="summary-visual"><ToolkitBook/><span className="handwritten">a fresh start,<br/>in one little toolkit.<Flower size={38}/></span></div><div className="summary-content"><div className="summary-product-heading"><div><span className="eyebrow">YOUR ORDER, ALL TOGETHER</span><h2>The Creator’s Toolkit</h2></div><span><Zap size={10}/>Digital goodness</span></div><span className="notion-badge"><NotionMark size={13}/>Made for Notion · Works with the free plan</span><div className="license-switch" role="radiogroup" aria-label="Toolkit license">{(["personal", "studio"] as const).map(option => <button disabled={loading} role="radio" aria-checked={license === option} type="button" key={option} className={license === option ? "selected" : ""} onClick={() => { setLicense(option); requestKey.current = null; setError(""); }}>{PRODUCT.licenses[option].name}<span>{option === "personal" ? "1 creative mind" : "Up to 5 creative minds"}</span></button>)}</div><div className="summary-includes"><span><Check size={13}/>10 templates for your whole creative life</span><span><Check size={13}/>Quick-start guide & ready-to-import trackers</span><span><Check size={13}/>Lifetime access. All future updates.</span></div><details className="promo-disclosure"><summary>Have a little discount code?<Plus size={13}/></summary><div className="promo-form"><input aria-label="Discount code" placeholder="HELLO10" maxLength={30} value={promoInput} disabled={loading || promoLoading} onChange={event => { setPromoInput(event.target.value.toUpperCase()); setPromoError(""); }} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); if (!promoLoading && promoInput.trim()) void applyPromo(); } }}/><button type="button" onClick={() => void applyPromo()} disabled={loading || promoLoading || !promoInput.trim()}>{promoLoading ? <LoaderCircle size={12} className="spin"/> : "Apply"}</button></div><p className="promo-hint">A little welcome gift: use HELLO10 for 10% off.</p>{promoError && <p role="alert" className="promo-message error">{promoError}</p>}{appliedCode && <p role="status" className="promo-message">A little win! {appliedCode} saves you 10%.<button type="button" className="remove-promo" disabled={loading} onClick={() => { setAppliedCode(""); setPromoInput(""); setPromoError(""); requestKey.current = null; }}>Remove</button></p>}</details><div className="order-totals" aria-live="polite"><div className="order-line"><span>Subtotal</span><span>{formatMoney(pricing.subtotal)}</span></div>{pricing.discount > 0 && <div className="order-line discount"><span>A little welcome gift ({appliedCode})</span><span>−{formatMoney(pricing.discount)}</span></div>}<div className="order-line"><span>Delivery</span><span>Instant & free</span></div><div className="order-line total"><span>{livePayments ? "Your total" : "Product total"}</span><span><small>USD</small>{formatMoney(pricing.total)}</span></div><p className="tax-note">{livePayments ? "One-time payment. Any applicable taxes included." : "Demo mode: amount charged today is $0."}</p></div></div><div className="summary-guarantee"><ShieldCheck size={25} strokeWidth={1.4}/><div><strong>A little peace of mind, too.</strong><p>14-day happiness guarantee. No awkward conversations.</p></div></div></div></aside></div></main><SiteFooter compact/></>;
}
