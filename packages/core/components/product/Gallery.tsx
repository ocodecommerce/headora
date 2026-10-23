"use client";
import { useState } from "react";

export type GalleryImage = { url: string; label?: string | null; position?: number | null; disabled?: boolean | null };

export function Gallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const list = images.filter((i) => i.url && !i.disabled).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const [active, setActive] = useState(0);
  if (!list.length) return <div className="hd-gallery__main" />;
  const main = list[Math.min(active, list.length - 1)];

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
    </div>
  );
}
