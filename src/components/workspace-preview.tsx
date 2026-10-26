"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Check, ChevronDown, Circle, CreditCard, Folder, House, Lightbulb, MoreHorizontal, Plus, Sparkles, Star } from "lucide-react";
import { Flower } from "./brand";
import { Modal } from "./modal";

export type WorkspaceView = "overview" | "planner" | "projects" | "ideas" | "money";
const menu = [{ key: "overview", label: "My dashboard", icon: House }, { key: "projects", label: "My projects", icon: Folder }, { key: "planner", label: "Weekly planner", icon: CalendarDays }, { key: "ideas", label: "The idea bank", icon: Lightbulb }, { key: "money", label: "Money matters", icon: CreditCard }] as const;

export function WorkspacePreview({ interactive = false, initialView = "overview" }: { interactive?: boolean; initialView?: WorkspaceView }) {
  const [view, setView] = useState<WorkspaceView>(initialView);
  const [tasks, setTasks] = useState([true, false, false]);
  const [ideas, setIdeas] = useState(["That little side project", "A newsletter, but make it personal", "Something just for fun"]);
  const [idea, setIdea] = useState("");
  return <div className={`workspace ${interactive ? "workspace-interactive" : ""}`}>
    <div className="workspace-browser"><span className="window-dots"><i/><i/><i/></span><span>your space <span className="browser-slash">/</span> the creator’s toolkit</span><MoreHorizontal size={15}/></div>
    <div className="workspace-cover"><Image src="/images/studio-arches.jpg" alt="Warm sunlight falling across Mediterranean arches" fill sizes="(max-width: 640px) 100vw, 650px" priority={!interactive}/><span>A SPACE TO MAKE GOOD THINGS.</span></div>
    <div className="workspace-body"><div className="workspace-icon"><Flower size={26}/></div><div className="workspace-title-row"><h3>{view === "overview" ? "My creative space" : menu.find(item => item.key === view)?.label}</h3><span className="workspace-star"><Star size={15}/></span></div><p className="workspace-subtitle">A little clarity. A little focus. A lot of possibility.</p>
      <div className="workspace-quicklinks"><div><span>✳</span><b>Make something</b><small>your projects, together</small></div><div><span>↗</span><b>Dream a little</b><small>give your ideas a home</small></div><div><span>☀</span><b>Find your flow</b><small>a week that feels like you</small></div></div>
      <div className="workspace-grid"><aside className="workspace-sidebar"><span className="workspace-label">YOUR LITTLE UNIVERSE</span>{menu.map(item => interactive ? <button type="button" key={item.key} onClick={() => setView(item.key)} className={view === item.key ? "active" : ""}><item.icon size={13}/>{item.label}</button> : <div key={item.key} className={view === item.key ? "active" : ""}><item.icon size={12}/>{item.label}</div>)}<span className="sidebar-note">Progress, not perfection. ♡</span></aside>
      <div className="workspace-main">
        {(view === "overview" || view === "planner") && <><div className="workspace-section-title"><strong>{view === "planner" ? "A week with a little intention" : "This week’s little wins"}</strong><MoreHorizontal size={14}/></div>{view === "planner" && <div className="week-strip">{["M", "T", "W", "T", "F", "S", "S"].map((day, i) => <span className={i === 2 ? "today" : ""} key={i}>{day}<b>{12 + i}</b></span>)}</div>}{["Outline that big idea", "Send the good email", "Make something you love"].map((task, index) => <div className="workspace-task" key={task}>{interactive ? <button type="button" className={`task-check ${tasks[index] ? "checked" : ""}`} aria-label={`${tasks[index] ? "Uncheck" : "Complete"} ${task}`} onClick={() => setTasks(prev => prev.map((value, i) => i === index ? !value : value))}>{tasks[index] && <Check size={10}/>}</button> : <span className={`task-check ${tasks[index] ? "checked" : ""}`}>{tasks[index] && <Check size={10}/>}</span>}<span className={tasks[index] ? "task-complete" : ""}>{task}</span><span className={`task-tag tag-${index}`}>{["Creative", "Business", "Just for me"][index]}</span></div>)}<div className="workspace-note"><Sparkles size={13}/><span>You don’t have to do it all. Just the next good thing.</span></div></>}
        {view === "projects" && <><div className="workspace-section-title"><strong>Good things in the making</strong><Folder size={14}/></div><div className="project-mini-grid">{[{ title: "Brand refresh", stage: "In the making", progress: 65 }, { title: "Studio website", stage: "Just beginning", progress: 25 }, { title: "Summer collection", stage: "Almost there", progress: 90 }].map(project => <div className="project-mini" key={project.title}><span className="project-dot"/><b>{project.title}</b><small>{project.stage}</small><div className="progress-track"><span style={{ width: `${project.progress}%` }}/></div></div>)}</div></>}
        {view === "ideas" && <><div className="workspace-section-title"><strong>No idea too little</strong><Lightbulb size={14}/></div><div className="idea-list">{ideas.map((item, index) => <div key={index}><Star size={12}/><span>{item}</span></div>)}</div>{interactive && <form className="idea-form" onSubmit={event => { event.preventDefault(); if (idea.trim()) { setIdeas(prev => [...prev, idea.trim()]); setIdea(""); } }}><input aria-label="A new idea" placeholder="What’s on your mind?" maxLength={100} value={idea} onChange={event => setIdea(event.target.value)}/><button type="submit" aria-label="Save idea" disabled={!idea.trim()}><Plus size={16}/></button></form>}</>}
        {view === "money" && <><div className="workspace-section-title"><strong>A little peace of mind</strong><ChevronDown size={13}/></div><div className="money-stat"><small>THIS MONTH, SO FAR</small><strong>$4,250<span>.00</span></strong><span>↗ Looking good!</span></div>{[["Brand identity", "$1,800", "Paid"], ["Website design", "$2,450", "Paid"]].map(row => <div className="money-row" key={row[0]}><span>{row[0]}</span><b>{row[1]}</b><em>{row[2]}</em></div>)}</>}
      </div></div>
    </div><div className="workspace-bottom"><span><Circle size={6} fill="currentColor"/> Your space. Your pace.</span><span>made with a little folio magic ↗</span></div>
  </div>;
}

export function PreviewModal({ open, onClose, view = "overview" }: { open: boolean; onClose: () => void; view?: WorkspaceView }) {
  return <Modal open={open} onClose={onClose} title="Explore the Creator’s Toolkit" className="preview-modal"><div className="preview-heading"><span className="eyebrow">COME ON IN. MAKE YOURSELF AT HOME.</span><h2>Your future <em>happy place.</em></h2><p>Click around, tick something off, or add that idea. This space is yours.</p></div><WorkspacePreview interactive initialView={view} key={`${view}-${open}`}/><div className="preview-footer"><span>One workspace. Ten thoughtful templates.</span><Link href="/checkout" className="button button-small">Make it yours — $49 <ArrowUpRight size={17}/></Link></div></Modal>;
}
