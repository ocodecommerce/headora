"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";

// Server renders the panel open (desktop + no-JS); on small screens it starts collapsed
// unless a filter is already applied, so products stay above the fold.
// With JS, filter links load in place like legacy: the box ticks at once, the product grid
// shows a skeleton (html.hd-plp-loading) and, like Venia, the page jumps to the top of the list.
export function FiltersPanel({ hasActive, stateKey, children }: { hasActive: boolean; stateKey: string; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const router = useRouter();
  // Phone width: the panel is the FILTER BY drawer (legacy): keep it open, start every group
  // closed except ones with a selection (so a pick stays in view after the page reloads).
  useEffect(() => {
    if (!window.matchMedia("(max-width: 1000px)").matches) return;
    ref.current?.querySelectorAll<HTMLDetailsElement>(".hd-filter:not([data-active])").forEach((d) => { d.open = false; });
  }, [hasActive]);
  // New server results arrived: drop the skeleton.
  useEffect(() => { document.documentElement.classList.remove("hd-plp-loading"); }, [stateKey]);
  useEffect(() => {
    const panel = ref.current;
    if (!panel) return;
    let timer: ReturnType<typeof setTimeout>;
    const go = (href: string) => {
      document.documentElement.classList.add("hd-plp-loading");
      clearTimeout(timer);
      // ponytail: safety net if the navigation never lands (error, same URL)
      timer = setTimeout(() => document.documentElement.classList.remove("hd-plp-loading"), 15000);
      // Venia (FilterSidebar): jump to 150px above the filter column so the new results start in view.
      const top = panel.closest(".hd-plp")?.getBoundingClientRect().top;
      if (top != null) window.scrollTo(0, window.scrollY + top - 150);
      router.push(href, { scroll: false });
    };
    const onClick = (e: MouseEvent) => {
      // Legacy accordion: opening one filter group closes the others.
      const group = (e.target as Element).closest(".hd-filter__title")?.parentElement as HTMLDetailsElement | null;
      if (group && !group.open) panel.querySelectorAll<HTMLDetailsElement>(".hd-filter[open]").forEach((d) => { if (d !== group) d.open = false; });
      const link = (e.target as Element).closest<HTMLAnchorElement>("a.hd-filter__option, .hd-filters__active a");
      if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      if (link.classList.contains("hd-filter__option")) link.toggleAttribute("aria-current", link.getAttribute("aria-current") !== "true");
      if (link.hasAttribute("aria-current")) link.setAttribute("aria-current", "true");
      go(link.getAttribute("href")!);
    };
    const onNav = (e: Event) => go((e as CustomEvent<string>).detail);
    panel.addEventListener("click", onClick);
    window.addEventListener("headora:filter-nav", onNav);
    return () => { clearTimeout(timer); panel.removeEventListener("click", onClick); window.removeEventListener("headora:filter-nav", onNav); };
  }, [router]);
  return <details ref={ref} className="hd-filters" open>{children}</details>;
}
