"use client";
import { useEffect, useRef, type ReactNode } from "react";

// Server renders the panel open (desktop + no-JS); on small screens it starts collapsed
// unless a filter is already applied, so products stay above the fold.
export function FiltersPanel({ hasActive, children }: { hasActive: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  // Phone width: the panel is the FILTER BY drawer (legacy): keep it open, start every group
  // closed except ones with a selection (so a pick stays in view after the page reloads).
  useEffect(() => {
    if (!window.matchMedia("(max-width: 1000px)").matches) return;
    ref.current?.querySelectorAll<HTMLDetailsElement>(".hd-filter:not([data-active])").forEach((d) => { d.open = false; });
  }, [hasActive]);
  // Legacy accordion: opening one filter group closes the others.
  useEffect(() => {
    const panel = ref.current;
    if (!panel) return;
    const onClick = (e: MouseEvent) => {
      const group = (e.target as Element).closest(".hd-filter__title")?.parentElement as HTMLDetailsElement | null;
      if (!group || group.open) return;
      panel.querySelectorAll<HTMLDetailsElement>(".hd-filter[open]").forEach((d) => { if (d !== group) d.open = false; });
    };
    panel.addEventListener("click", onClick);
    return () => panel.removeEventListener("click", onClick);
  }, []);
  return <details ref={ref} className="hd-filters" open>{children}</details>;
}
