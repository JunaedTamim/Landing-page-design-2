import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif", display: "swap" });

export const metadata: Metadata = {
  title: { default: "folio — Big ideas. Less chaos. More you.", template: "%s | folio" },
  description: "Make a little room for your best work. The Creator’s Toolkit brings your ideas, projects, and plans into one beautifully simple Notion workspace.",
  openGraph: { title: "folio — Your creative life, a little more together.", description: "10 thoughtfully made templates. One connected workspace. Meet the Creator’s Toolkit.", type: "website" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f8f7f2" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" className={`${sans.variable} ${serif.variable}`}><body><a className="skip-link" href="#main">Skip to content</a>{children}</body></html>;
}
