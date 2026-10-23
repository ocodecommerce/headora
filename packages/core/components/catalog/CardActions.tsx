"use client";
import { useState } from "react";
import { useWishlist } from "./wishlistStore.js";

// Legacy v1 product-card actions: "Add to cart" + wishlist heart.
// - Simple/virtual: add qty 1 to the guest cart; the cart drawer opens (headora:cart).
// - Configurable/bundle/grouped/downloadable: options needed, so go to the product page.
// - Heart: signed out -> login modal; signed in -> toggle in the Magento wishlist.

const DIRECT_ADD = new Set(["SimpleProduct", "VirtualProduct"]);

export function HeartIcon({ filled, width = 27, height = 24 }: { filled: boolean; width?: number; height?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={width} height={height} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function CardActions({ sku, typename, href, inStock, locale }: {
  sku: string; typename?: string; href: string; inStock: boolean; locale: string;
}) {
  const wishlist = useWishlist(locale);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  async function addToCart() {
    if (!DIRECT_ADD.has(typename ?? "")) { window.location.assign(href); return; }
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, sku, quantity: 1 }),
      });
      const j = await res.json();
      if (j.cart) window.dispatchEvent(new CustomEvent("headora:cart", { detail: j.cart }));
      if (!j.ok) setError(j.error ?? "Could not add to cart.");
    } catch {
      setError("Could not reach the store. Please try again.");
    } finally {
      setAdding(false);
    }
  }

  const wished = wishlist.wished(sku);
  return (
    <>
      <div className="hd-card__actions">
        <button type="button" className="hd-card__atc" onClick={addToCart} disabled={!inStock || adding}
          aria-label={inStock ? undefined : "Out of stock"}>
          <span className="hd-card__atc-text">{adding ? "Adding…" : inStock ? "Add to cart" : "Out of stock"}</span>
          <svg className="hd-card__atc-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </button>
        <button type="button" className="hd-card__wish" disabled={wishlist.busy}
          onClick={async () => { setError(await wishlist.toggle(sku)); }}
          aria-pressed={wished} aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}>
          <HeartIcon filled={wished} />
        </button>
      </div>
      {error ? <p className="hd-msg hd-msg--err hd-card__err" role="alert">{error}</p> : null}
    </>
  );
}
