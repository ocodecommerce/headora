"use client";
import { useEffect } from "react";

// PageBuilder sliders are CSS scroll-snap strips (headora.css); this adds the dots the editor
// asked for (data-show-dots) and keeps them in sync with swipes. ponytail: no autoplay/arrows yet;
// Venia's sample slider has both off.
export function PageBuilderSliders() {
  useEffect(() => {
    const cleanups: (() => void)[] = [];
    document.querySelectorAll<HTMLElement>('#html-body [data-content-type="slider"]').forEach((slider) => {
      const slides = Array.from(slider.querySelectorAll<HTMLElement>(':scope > [data-content-type="slide"]'));
      if (slides.length < 2 || slider.dataset.showDots === "false" || slider.nextElementSibling?.classList.contains("hd-pb-dots")) return;
      const dots = document.createElement("div");
      dots.className = "hd-pb-dots";
      const buttons = slides.map((s, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", `Go to slide ${i + 1}`);
        b.addEventListener("click", () => slider.scrollTo({ left: s.offsetLeft - slider.offsetLeft, behavior: "smooth" }));
        dots.appendChild(b);
        return b;
      });
      const sync = () => {
        const i = Math.round(slider.scrollLeft / Math.max(1, slider.clientWidth));
        buttons.forEach((b, n) => b.setAttribute("aria-current", String(n === i)));
      };
      sync();
      slider.addEventListener("scroll", sync, { passive: true });
      slider.after(dots);
      cleanups.push(() => { slider.removeEventListener("scroll", sync); dots.remove(); });
    });
    return () => cleanups.forEach((c) => c());
  }, []);
  return null;
}
