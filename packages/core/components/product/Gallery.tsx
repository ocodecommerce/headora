"use client";
import { useEffect, useRef, useState, type PointerEvent } from "react";

export type GalleryImage = { url: string; label?: string | null; position?: number | null; disabled?: boolean | null };

// Desktop: thumbnails + main image. Phone width (CSS swaps them): a swipeable
// scroll-snap carousel with dots, like the legacy storefront's Swiper gallery.
export function Gallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const list = images.filter((i) => i.url && !i.disabled).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const [active, setActive] = useState(0);
  const [slide, setSlide] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const main = list[Math.min(active, list.length - 1)];
  const first = list[0]?.url;
  // Colour switch = new image list: start again from its first photo (the gallery is no longer remounted).
  useEffect(() => { setActive(0); setSlide(0); track.current?.scrollTo({ left: 0 }); }, [first]);
  // Keep the current photo up until the next one is downloaded and decoded, then swap: no white flash
  // between colours (legacy/Venia never show an empty frame).
  const [shown, setShown] = useState(main?.url);
  useEffect(() => {
    if (!main?.url || main.url === shown) return;
    let live = true;
    const next = new Image();
    next.src = main.url;
    (next.decode ? next.decode() : Promise.resolve()).catch(() => {}).then(() => { if (live) setShown(main.url); });
    return () => { live = false; };
  }, [main?.url]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!list.length || !main) return <div className="hd-gallery__main" />;
  const current = list.find((i) => i.url === shown) ?? main;

  const onScroll = () => {
    const el = track.current;
    if (el) setSlide(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
  };
  const goTo = (i: number) => track.current?.scrollTo({ left: i * track.current.clientWidth, behavior: "smooth" });

  return (
    <div className={`hd-gallery${list.length < 2 ? " hd-gallery--single" : ""}`}>
      {list.length > 1 ? (
        <ul className="hd-gallery__thumbs">
          {list.map((img, i) => (
            <li key={i}>
              <button type="button" className="hd-gallery__thumb" aria-pressed={i === active} aria-label={`Image ${i + 1}`} onClick={() => setActive(i)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {/* Same <img> element across photos: only src changes, and only after the photo is decoded,
          so the browser never paints an empty frame in between. */}
      <Zoomable className="hd-gallery__zoom" imgClass="hd-gallery__main" src={current.url} alt={current.label || name} />

      <div className="hd-gallery__slider" aria-roledescription="carousel" aria-label={`${name} images`}>
        <div className="hd-gallery__track" ref={track} onScroll={onScroll}>
          {/* Keyed by position, not URL: a colour switch swaps srcs in place instead of rebuilding slides. */}
          {list.map((img, i) => (
            <Zoomable key={i} src={img.url} alt={img.label || name} lazy={i > 0} />
          ))}
        </div>
        {list.length > 1 ? (
          <div className="hd-gallery__dots">
            {list.map((img, i) => (
              <button key={img.url} type="button" aria-label={`Go to image ${i + 1}`} aria-current={i === slide} onClick={() => goTo(i)} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// Legacy Swiper zoom (maxRatio 3): click/tap zooms 3x from the centre, drag pans within the
// image, click again resets.
const ZOOM = 3;
function Zoomable({ src, alt, className = "", imgClass, lazy }: { src: string; alt: string; className?: string; imgClass?: string; lazy?: boolean }) {
  const [z, setZ] = useState({ on: false, x: 0, y: 0 });
  const drag = useRef<{ px: number; py: number; x: number; y: number; moved: boolean } | null>(null);
  // A new photo starts unzoomed (the element is reused now, so reset instead of remounting).
  useEffect(() => { setZ({ on: false, x: 0, y: 0 }); }, [src]);
  const clamp = (v: number, size: number) => Math.max(-(ZOOM - 1) * size / 2, Math.min((ZOOM - 1) * size / 2, v));

  const down = (e: PointerEvent<HTMLDivElement>) => {
    drag.current = { px: e.clientX, py: e.clientY, x: z.x, y: z.y, moved: false };
    if (z.on) e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.px, dy = e.clientY - d.py;
    if (Math.abs(dx) + Math.abs(dy) > 5) d.moved = true;
    if (z.on && d.moved) {
      const r = e.currentTarget.getBoundingClientRect();
      setZ({ on: true, x: clamp(d.x + dx, r.width), y: clamp(d.y + dy, r.height) });
    }
  };
  const up = () => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved) setZ((p) => ({ on: !p.on, x: 0, y: 0 }));
  };

  return (
    <div className={`hd-zoom ${className}`} data-zoomed={z.on} onPointerDown={down} onPointerMove={move} onPointerUp={up}
      onPointerCancel={() => { drag.current = null; }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={imgClass} src={src} alt={alt} loading={lazy ? "lazy" : undefined} draggable={false}
        style={{ transform: z.on ? `translate(${z.x}px, ${z.y}px) scale(${ZOOM})` : undefined, transition: drag.current?.moved ? "none" : undefined }} />
    </div>
  );
}
