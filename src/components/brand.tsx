import Link from "next/link";

export function Flower({ className = "", size = 32 }: { className?: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className}><path d="M32 7C39-6 49 1 47 14C60 8 69 19 57 28C72 34 65 48 51 46C55 61 41 68 33 55C25 70 11 62 15 48C0 52-6 37 8 31C-5 23 3 9 17 14C15 0 27-5 32 7Z" fill="currentColor"/><circle cx="32" cy="32" r="7" fill="var(--flower-center, #f8f7f2)"/></svg>;
}

export function Brand({ light = false }: { light?: boolean }) {
  return <Link href="/" aria-label="folio home" className={`brand ${light ? "brand-light" : ""}`}><Flower size={33}/><span>folio<span className="brand-dot">.</span></span></Link>;
}

export function NotionMark({ size = 19 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m4 3 15-1 3 3v15l-16 2-4-4V5l2-2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="m2 5 4 2 16-2M6 7v15M9 17V9l7 8V9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 9h3m4 0h3M8 17h3" stroke="currentColor" strokeWidth="1.5"/></svg>;
}
