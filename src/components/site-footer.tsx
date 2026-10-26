"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, LoaderCircle, Send } from "lucide-react";
import { Brand, Flower } from "./brand";
import { Modal } from "./modal";

export function ContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setStatus("loading");
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(data)) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Something went wrong. Please try again.");
      setStatus("success");
    } catch (err) { setError(err instanceof Error ? err.message : "We couldn’t send that just yet. Please try again."); setStatus("error"); }
  }
  return <Modal open={open} onClose={onClose} title="Say hello to folio" className="contact-modal">{status === "success" ? <div className="contact-success"><span className="success-icon"><Check size={28}/></span><span className="eyebrow">SAFELY IN OUR INBOX</span><h2>Good to <em>hear from you.</em></h2><p>Your message has been saved for our team. Thanks for taking a little time to say hello.</p><button className="button" onClick={onClose}>Back to the good stuff <ArrowUpRight size={17}/></button></div> : <><span className="eyebrow">THERE’S A HUMAN ON THE OTHER SIDE</span><h2>A little <em>hello.</em></h2><p>A question, a thought, or a little help getting started? We’re all ears.</p><form onSubmit={submit} className="contact-form"><label>Your name<input name="name" autoComplete="name" required minLength={2} maxLength={120} placeholder="What should we call you?"/></label><label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@yourlittleuniverse.com"/></label><label>What’s on your mind?<textarea name="message" required minLength={10} maxLength={5000} rows={4} placeholder="Let’s hear it…"/></label>{status === "error" && <p className="form-error" role="alert">{error}</p>}<button className="button" type="submit" disabled={status === "loading"}>{status === "loading" ? <><LoaderCircle className="spin" size={17}/> Sending your note…</> : <>Send a little note <Send size={17}/></>}</button><p className="form-fineprint">We’ll use your details only to respond to your message.</p></form></>}</Modal>;
}

export function SiteFooter({ compact = false }: { compact?: boolean }) {
  const [contact, setContact] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("loading");
    try {
      const response = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Please try again in a moment.");
      setState("success"); setMessage("You’re on the list. Here’s to more good things."); setEmail("");
    } catch (err) { setState("error"); setMessage(err instanceof Error ? err.message : "Please try again."); }
  }
  if (compact) return <><footer className="compact-footer container"><span>© {new Date().getFullYear()} folio. A little more together.</span><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><button onClick={() => setContact(true)}>Need a hand?</button></div></footer><ContactModal open={contact} onClose={() => setContact(false)}/></>;
  return <><footer className="site-footer"><div className="container"><div className="footer-newsletter"><div><span className="eyebrow">A NOTE FROM OUR LITTLE CORNER</span><h2>Good things.<br/><em>Once in a while.</em></h2></div><div className="newsletter-block"><p>Fresh ideas, thoughtful updates, and the occasional<br className="desktop-break"/> nudge to make something good. No noise.</p><form className="newsletter-form" onSubmit={subscribe}><label className="sr-only" htmlFor="newsletter-email">Your email address</label><input id="newsletter-email" type="email" placeholder="Your email goes here" required maxLength={254} value={email} onChange={event => { setEmail(event.target.value); if (state !== "loading") setState("idle"); }} disabled={state === "loading"}/><button type="submit" disabled={state === "loading"} aria-label="Subscribe to the folio newsletter">{state === "loading" ? <LoaderCircle size={20} className="spin"/> : <ArrowRight size={23}/>}</button></form><p className={`newsletter-message ${state === "error" ? "is-error" : ""}`} aria-live="polite">{state === "success" || state === "error" ? message : <>By joining, you agree to our <Link href="/privacy">privacy policy.</Link></>}</p></div></div><div className="footer-main"><div className="footer-brand"><Brand light/><p>A little structure for a<br/>wonderfully creative life.</p></div><div className="footer-links"><span>TAKE A LOOK AROUND</span><Link href="/#inside">What’s inside</Link><Link href="/#why-folio">Why folio</Link><Link href="/#toolkit">Get the toolkit <ArrowUpRight size={13}/></Link></div><div className="footer-links"><span>THE LITTLE DETAILS</span><Link href="/terms">Terms of use</Link><Link href="/privacy">Privacy policy</Link><button onClick={() => setContact(true)}>Say hello <ArrowUpRight size={13}/></button></div><Flower className="footer-flower" size={94}/></div><div className="footer-bottom"><span>© {new Date().getFullYear()} folio. All good things reserved.</span><span>Made with intention. <span className="footer-heart">♡</span> For your next chapter.</span></div></div></footer><ContactModal open={contact} onClose={() => setContact(false)}/></>;
}
