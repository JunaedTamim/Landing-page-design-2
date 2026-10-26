"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Menu, X, LockKeyhole, ArrowLeft } from "lucide-react";
import { Brand } from "./brand";

export function SiteHeader({ checkout = false }: { checkout?: boolean }) {
  const [open, setOpen] = useState(false);
  return <>
    {!checkout && <div className="announcement"><span>A little structure. A lot more possibility.</span><Link href="/#inside">Meet your new toolkit <ArrowUpRight size={13}/></Link></div>}
    <header className={`site-header ${checkout ? "checkout-header" : ""}`}><div className="container header-inner">
      <Brand/>
      {checkout ? <><Link className="back-to-store" href="/"><ArrowLeft size={15}/> Back to the good stuff</Link><span className="secure-label"><LockKeyhole size={14}/> Secure checkout</span></> : <>
        <nav className="desktop-nav" aria-label="Main navigation"><Link href="/#inside">What’s inside</Link><Link href="/#why-folio">Why folio</Link><Link href="/#faqs">FAQs</Link></nav>
        <div className="header-actions"><Link href="/checkout" className="button button-small">Get the toolkit <ArrowUpRight size={17}/></Link><button type="button" className="menu-toggle icon-button" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button></div>
        {open && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation"><Link href="/#inside" onClick={() => setOpen(false)}>What’s inside <ArrowUpRight size={18}/></Link><Link href="/#why-folio" onClick={() => setOpen(false)}>Why folio <ArrowUpRight size={18}/></Link><Link href="/#faqs" onClick={() => setOpen(false)}>Your questions, answered <ArrowUpRight size={18}/></Link><Link href="/#toolkit" onClick={() => setOpen(false)}>Find your toolkit <ArrowUpRight size={18}/></Link></nav>}
      </>}
    </div></header>
  </>;
}
