"use client";
import { useRef, useState, type PointerEvent } from "react";

export type GalleryImage = { url: string; label?: string | null; position?: number | null; disabled?: boolean | null };

// Desktop: thumbnails + main image. Phone width (CSS swaps them): a swipeable
// scroll-snap carousel with dots, like the legacy storefront's Swiper gallery.
export function Gallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const list = images.filter((i) => i.url && !i.disabled).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const [active, setActive] = useState(0);
  const [slide, setSlide] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  if (!list.length) return <div className="hd-gallery__main" />;
  const main = list[Math.min(active, list.length - 1)];

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
            <li key={img.url}>
              <button type="button" className="hd-gallery__thumb" aria-pressed={i === active} aria-label={`Image ${i + 1}`} onClick={() => setActive(i)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <Zoomable key={main.url} className="hd-gallery__zoom" imgClass="hd-gallery__main" src={main.url} alt={main.label || name} />

      <div className="hd-gallery__slider" aria-roledescription="carousel" aria-label={`${name} images`}>
        <div className="hd-gallery__track" ref={track} onScroll={onScroll}>
          {list.map((img, i) => (
            <Zoomable key={img.url} src={img.url} alt={img.label || name} lazy={i > 0} />
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
