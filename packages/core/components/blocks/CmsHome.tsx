"use client";
import { useEffect, useRef } from "react";

// Renders the Magento CMS homepage and wires the behaviour its markup expects
// (ported from the legacy v1 storefront): the hero_section slider (dots, arrows,
// 5s autoplay, swipe) and arrow/drag scrolling for the "new products" widget.
// Styling: @headora/core/styles/cms-home.css.
export function CmsHome({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const cleanups: (() => void)[] = [];

    // ---------- Hero slider ----------
    const slides = Array.from(root.querySelectorAll<HTMLElement>(".hero_section_slide"));
    const bullets = root.querySelector<HTMLElement>(".slider_bullets");
    if (slides.length && bullets) {
      bullets.innerHTML = "";
      let index = Math.max(0, slides.findIndex((s) => s.classList.contains("active")));
      slides.forEach((s, i) => s.classList.toggle("active", i === index));
      const dots = slides.map((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "hero_dot" + (i === index ? " active" : "");
        dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
        dot.addEventListener("click", () => goTo(i));
        bullets.appendChild(dot);
        return dot;
      });
      const show = (i: number) => {
        slides[index].classList.remove("active");
        dots[index].classList.remove("active");
        index = (i + slides.length) % slides.length;
        slides[index].classList.add("active");
        dots[index].classList.add("active");
      };
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let timer: ReturnType<typeof setInterval> | undefined;
      const restart = () => {
        if (timer) clearInterval(timer);
        if (!reduced && slides.length > 1) timer = setInterval(() => show(index + 1), 5000);
      };
      const goTo = (i: number) => { show(i); restart(); };
      restart();

      const prev = root.querySelector(".hero_section .prev");
      const next = root.querySelector(".hero_section .next");
      const onPrev = (e: Event) => { e.preventDefault(); goTo(index - 1); };
      const onNext = (e: Event) => { e.preventDefault(); goTo(index + 1); };
      prev?.addEventListener("click", onPrev);
      next?.addEventListener("click", onNext);

      // Swipe / drag
      const slider = root.querySelector<HTMLElement>(".hero_section") ?? root;
      let startX = 0, curX = 0, dragging = false;
      const down = (e: PointerEvent) => { startX = curX = e.clientX; dragging = true; };
      const move = (e: PointerEvent) => { if (dragging) curX = e.clientX; };
      const up = () => {
        if (!dragging) return;
        dragging = false;
        const diff = curX - startX;
        if (Math.abs(diff) >= 60) goTo(index + (diff < 0 ? 1 : -1));
      };
      slider.addEventListener("pointerdown", down);
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);

      cleanups.push(() => {
        if (timer) clearInterval(timer);
        prev?.removeEventListener("click", onPrev);
        next?.removeEventListener("click", onNext);
        slider.removeEventListener("pointerdown", down);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      });
    }

    // ---------- New products widget: arrows + drag scroll ----------
    const grid = root.querySelector<HTMLElement>(".block.widget.block-new-products .products-grid");
    const track = grid?.querySelector<HTMLElement>(".product-items");
    if (grid && track && !grid.querySelector(".products-slider-prev")) {
      const mk = (cls: string, label: string, text: string) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = cls;
        b.setAttribute("aria-label", label);
        b.textContent = text;
        return b;
      };
      const prevBtn = mk("products-slider-prev", "Previous products", "←");
      const nextBtn = mk("products-slider-next", "Next products", "→");
      grid.style.position = "relative";
      grid.append(prevBtn, nextBtn);

      const step = () => {
        const card = track.querySelector<HTMLElement>(".product-item");
        const gap = parseFloat(getComputedStyle(track).columnGap || "24") || 24;
        return card ? card.getBoundingClientRect().width + gap : track.clientWidth;
      };
      const update = () => {
        const max = track.scrollWidth - track.clientWidth - 1;
        prevBtn.dataset.disabled = String(track.scrollLeft <= 0);
        nextBtn.dataset.disabled = String(track.scrollLeft >= max);
      };
      const onPrev = () => track.scrollBy({ left: -step(), behavior: "smooth" });
      const onNext = () => track.scrollBy({ left: step(), behavior: "smooth" });
      prevBtn.addEventListener("click", onPrev);
      nextBtn.addEventListener("click", onNext);
      track.addEventListener("scroll", update);
      window.addEventListener("resize", update);
      update();

      let isDown = false, sx = 0, sl = 0;
      const md = (e: MouseEvent) => { isDown = true; sx = e.pageX; sl = track.scrollLeft; };
      const mu = () => { isDown = false; };
      const mm = (e: MouseEvent) => { if (!isDown) return; e.preventDefault(); track.scrollLeft = sl - (e.pageX - sx); };
      track.addEventListener("mousedown", md);
      window.addEventListener("mouseup", mu);
      track.addEventListener("mousemove", mm);

      cleanups.push(() => {
        prevBtn.remove();
        nextBtn.remove();
        track.removeEventListener("scroll", update);
        window.removeEventListener("resize", update);
        track.removeEventListener("mousedown", md);
        window.removeEventListener("mouseup", mu);
        track.removeEventListener("mousemove", mm);
      });
    }

    // Widget "Add to Cart" buttons post to Magento with its JS; headless: open the product page.
    const onClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest(".action.tocart, .action.towishlist, .action.tocompare");
      if (!btn) return;
      e.preventDefault();
      const link = btn.closest(".product-item")?.querySelector<HTMLAnchorElement>("a.product-item-link, a.product-item-photo");
      if (link) window.location.assign(link.href);
    };
    root.addEventListener("click", onClick);
    cleanups.push(() => root.removeEventListener("click", onClick));

    return () => cleanups.forEach((c) => c());
  }, [html]);

  return <div ref={ref} className="hd-cms-home" dangerouslySetInnerHTML={{ __html: html }} />;
}
