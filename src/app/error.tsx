"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { Brand, Flower } from "@/components/brand";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <><header className="container header-inner"><Brand/></header><main id="main" className="error-page"><Flower size={62}/><span className="eyebrow">A LITTLE HICCUP. NOTHING MORE.</span><h1>Let’s give that<br/><em>another go.</em></h1><p>Something didn’t load quite right. Your order, if already completed, is safe. Try again in a moment.</p><button className="button" onClick={reset}>Try again <RefreshCw size={16}/></button><Link href="/" className="success-return">Or head back to folio</Link></main></>;
}
