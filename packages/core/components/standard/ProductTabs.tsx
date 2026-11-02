"use client";
import { useRef, useState, type ReactNode } from "react";
import { ChevronIcon } from "./StdIcons.js";

// Tabbed product row: server-rendered cards, horizontal scroll-snap track with arrow buttons.
export function ProductTabs({ title, titleId, tabs }: { title: string; titleId: string; tabs: { label: string; cards: ReactNode[] }[] }) {
  const [active, setActive] = useState(0);
  const track = useRef<HTMLUListElement>(null);
  const scroll = (d: number) => track.current?.scrollBy({ left: d * track.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <>
      <div className="std-section__head">
        <h2 id={titleId} className="std-h2">{title}</h2>
        <div className="std-tabs" role="tablist" aria-labelledby={titleId}>
          {tabs.map((t, k) => (
            <button key={t.label} type="button" role="tab" aria-selected={k === active} className="std-pill"
              onClick={() => { setActive(k); track.current?.scrollTo({ left: 0 }); }}>{t.label}</button>
          ))}
        </div>
        <div className="std-arrows">
          <button type="button" className="std-round" aria-label="Scroll left" onClick={() => scroll(-1)}><ChevronIcon dir="left" /></button>
          <button type="button" className="std-round" aria-label="Scroll right" onClick={() => scroll(1)}><ChevronIcon dir="right" /></button>
        </div>
      </div>
      <div role="tabpanel" aria-label={tabs[active]?.label}>
        <ul ref={track} className="std-row">
          {tabs[active]?.cards.map((c, k) => <li key={k}>{c}</li>)}
        </ul>
      </div>
    </>
  );
}
