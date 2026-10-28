"use client";
import { useEffect } from "react";

// PageBuilder sliders and product carousels are CSS scroll-snap strips (headora.css); this adds
// the dots the editor asked for (data-show-dots): one per page of visible items, like Venia's
// slick dots, rebuilt on resize (items per view change at breakpoints) and synced with swipes.
// ponytail: no autoplay/arrows yet; Venia's sample slider and carousel have both off.
export function PageBuilderSliders() {
  useEffect(() => {
    const strips: [HTMLElement, string][] = [
      ...Array.from(document.querySelectorAll<HTMLElement>('#html-body [data-content-type="slider"]:not([data-show-dots="false"])'))
        .map((s): [HTMLElement, string] => [s, "hd-pb-dots"]),
      ...Array.from(document.querySelectorAll<HTMLElement>('#html-body .hd-pb-products--carousel:not([data-show-dots="false"]) > .hd-grid'))
        .map((s): [HTMLElement, string] => [s, "hd-pb-dots hd-pb-dots--bars"]),
    ];
    const cleanups = strips.map(([strip, className]) => {
      const dots = document.createElement("div");
      dots.className = className;
      strip.after(dots);
      let buttons: HTMLButtonElement[] = [];
      let gap = 0;
      const sync = () => {
        // The last page can be short (it ends at the end of the strip), so "at the end" = last dot.
        const atEnd = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 2;
        const page = atEnd ? buttons.length - 1 : Math.round(strip.scrollLeft / Math.max(1, strip.clientWidth + gap));
        buttons.forEach((b, n) => b.setAttribute("aria-current", String(n === page)));
      };
      const build = () => {
        // Items per view from the first item's width + gap (not scrollWidth: the gap after the
        // last item would add a page). 10 cards at 5 per view = 2 dots, as Venia.
        const items = strip.children.length;
        gap = parseFloat(getComputedStyle(strip).columnGap) || 0;
        const first = strip.firstElementChild as HTMLElement | null;
        const perView = first ? Math.max(1, Math.round((strip.clientWidth + gap) / (first.offsetWidth + gap))) : 1;
        const pages = Math.ceil(items / perView);
        dots.replaceChildren();
        buttons = pages < 2 ? [] : Array.from({ length: pages }, (_, i) => {
          const b = document.createElement("button");
          b.type = "button";
          b.setAttribute("aria-label", `Go to page ${i + 1}`);
          b.addEventListener("click", () => strip.scrollTo({ left: i * (strip.clientWidth + gap), behavior: "smooth" }));
          dots.appendChild(b);
          return b;
        });
        sync();
      };
      build();
      const ro = new ResizeObserver(build);
      ro.observe(strip);
      strip.addEventListener("scroll", sync, { passive: true });
      return () => { ro.disconnect(); strip.removeEventListener("scroll", sync); dots.remove(); };
    });
    return () => cleanups.forEach((c) => c());
  }, []);
  return null;
}
