"use client";
import { useEffect, useRef, type ReactNode } from "react";

// Server renders the panel open (desktop + no-JS); on small screens it starts collapsed
// unless a filter is already applied, so products stay above the fold.
export function FiltersPanel({ hasActive, children }: { hasActive: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (!hasActive && window.matchMedia("(max-width: 1000px)").matches) ref.current?.removeAttribute("open");
  }, [hasActive]);
  return <details ref={ref} className="hd-filters" open>{children}</details>;
}
