"use client";
import { useEffect, useState } from "react";
import type { StdSlide } from "../../lib/theme.js";
import { ArrowIcon, ChevronIcon } from "./StdIcons.js";

// Cross-fading hero. Every slide is server-rendered (first one eager + high priority for LCP,
// the rest lazy), so the slider costs one small client bundle and no layout shift.
// Autoplay pauses on hover/focus and is off for prefers-reduced-motion.
export function HeroSlider({ slides }: { slides: StdSlide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;
  useEffect(() => {
    if (paused || n < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setI((x) => (x + 1) % n), 6000);
    return () => clearTimeout(t);
  }, [i, paused, n]);
  if (!n) return null;
  const go = (d: number) => setI((x) => (x + d + n) % n);

  return (
    <section className="std-hero" aria-roledescription="carousel" aria-label="Featured"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      {slides.map((s, k) => (
        <div key={s.image} className={`std-hero__slide${k === i ? " is-active" : ""}`} aria-hidden={k !== i}
          role="group" aria-roledescription="slide" aria-label={`${k + 1} of ${n}`}>
          <picture>
            {s.imageSmall ? <source media="(max-width: 767px)" srcSet={s.imageSmall} /> : null}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.image} alt={s.alt} width="1440" height="804"
              loading={k === 0 ? "eager" : "lazy"} fetchPriority={k === 0 ? "high" : "low"} />
          </picture>
          <div className="std-hero__copy">
            <p className="std-eyebrow">{s.eyebrow}</p>
            {k === 0 ? <h1 className="std-hero__title">{s.title}</h1> : <h2 className="std-hero__title">{s.title}</h2>}
            <p className="std-hero__text">{s.text}</p>
            <a className="std-btn" href={s.href} tabIndex={k === i ? 0 : -1}>{s.cta}<ArrowIcon /></a>
          </div>
        </div>
      ))}
      {n > 1 ? (
        <div className="std-hero__nav">
          <button type="button" className="std-round" aria-label="Previous slide" onClick={() => go(-1)}><ChevronIcon dir="left" /></button>
          <div className="std-hero__dots">
            {slides.map((s, k) => (
              <button key={s.image} type="button" aria-label={`Show slide ${k + 1}`} aria-current={k === i} onClick={() => setI(k)} />
            ))}
          </div>
          <button type="button" className="std-round" aria-label="Next slide" onClick={() => go(1)}><ChevronIcon dir="right" /></button>
        </div>
      ) : null}
    </section>
  );
}
