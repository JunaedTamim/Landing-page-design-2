import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Flower } from "@/components/brand";

export default function NotFound() {
  return <><SiteHeader checkout/><main id="main" className="error-page"><Flower size={65}/><span className="eyebrow">404 / A LITTLE OFF THE BEATEN PATH</span><h1>Let’s find<br/><em>your way back.</em></h1><p>That page has wandered off. If you’re looking for an order, check that you’ve copied the full confirmation link.</p><Link href="/" className="button"><ArrowLeft size={16}/>Back to the good stuff</Link></main><SiteFooter compact/></>;
}
