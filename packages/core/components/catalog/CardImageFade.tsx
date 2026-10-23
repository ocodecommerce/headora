"use client";
import { useEffect } from "react";

// Marks product card photos as loaded (data-loaded) so CSS can drop the shimmer and fade them in,
// like Venia's Image. Load events don't bubble, so listen in the capture phase; photos that finished
// before hydration, or arrive with a client navigation, are picked up by the scan.
export function CardImageFade() {
  useEffect(() => {
    const mark = (img: HTMLImageElement) => img.setAttribute("data-loaded", "");
    const scan = () => document.querySelectorAll<HTMLImageElement>("img.hd-card__img:not([data-loaded])")
      .forEach((img) => { if (img.complete) mark(img); });
    // A broken image still gets shown (its alt text) instead of shimmering forever.
    const onDone = (e: Event) => { if (e.target instanceof HTMLImageElement && e.target.classList.contains("hd-card__img")) mark(e.target); };
    document.addEventListener("load", onDone, true);
    document.addEventListener("error", onDone, true);
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { document.removeEventListener("load", onDone, true); document.removeEventListener("error", onDone, true); mo.disconnect(); };
  }, []);
  return null;
}
