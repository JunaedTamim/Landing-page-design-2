import { Check, ArrowUpRight } from "lucide-react";
import { Flower, NotionMark } from "./brand";
import { WorkspacePreview } from "./workspace-preview";

export function HeroArt() {
  return <div className="hero-art" aria-label="Preview of the Creator’s Toolkit: a creative dashboard and weekly planner"><div className="art-orbit"/><div className="art-grid"/><div className="handwritten art-caption">a happy place<br/>for your busy brain.<svg width="68" height="41" viewBox="0 0 68 41" fill="none" aria-hidden="true"><path d="M3 5c19-6 53 0 53 27m-10-7 10 9 8-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div className="art-edition"><span>THE CREATOR’S TOOLKIT</span><span>VOL. 01 — YOUR FRESH START</span></div><Flower className="art-flower" size={78}/><div className="product-window"><WorkspacePreview/></div><div className="floating-planner"><span className="planner-eyebrow">A LITTLE INTENTION GOES A LONG WAY</span><h3>Make room<br/>for the good stuff.</h3><div className="planner-line"><span className="planner-checkbox checked"><Check size={11}/></span>A fresh cup. A fresh start.</div><div className="planner-line"><span className="planner-checkbox"/>One thing at a time.</div><div className="planner-line"><span className="planner-checkbox"/>A little time for you.</div><span className="planner-footnote">less hustle. more happy. <span>♡</span></span></div><div className="round-sticker"><span>LESS TABS.</span><Flower size={32}/><span>MORE TA-DA.</span></div><div className="art-notion"><NotionMark size={17}/><span>made for Notion</span><ArrowUpRight size={12}/></div></div>;
}

export function ToolkitBook({ small = false }: { small?: boolean }) {
  return <div className={`toolkit-book ${small ? "toolkit-book-small" : ""}`} aria-label="The Creator’s Toolkit digital cover"><div className="book-top"><span>folio.</span><ArrowUpRight size={small ? 11 : 21}/></div><div className="book-title">The<br/>Creator’s<br/><em>Toolkit.</em></div><Flower size={small ? 32 : 72}/><div className="book-bottom"><span>BIG IDEAS. LESS CHAOS.</span><span>VOL. 01</span></div></div>;
}
