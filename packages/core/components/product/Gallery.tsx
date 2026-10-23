"use client";
import { useRef, useState } from "react";

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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hd-gallery__main" src={main.url} alt={main.label || name} />

      <div className="hd-gallery__slider" aria-roledescription="carousel" aria-label={`${name} images`}>
        <div className="hd-gallery__track" ref={track} onScroll={onScroll}>
          {list.map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={img.url} src={img.url} alt={img.label || name} loading={i ? "lazy" : undefined} />
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
