"use client";
import { useEffect, useRef, useState } from "react";
import { useWishlist } from "./wishlistStore.js";
import { BASE } from "../../lib/base.js";

// Legacy v1 product-card actions: "Add to cart" + wishlist heart.
// - Simple/virtual: add qty 1 to the guest cart; the cart drawer opens (headora:cart).
// - Configurable: "Add to cart" opens an option picker on the card (sold-out combinations
//   disabled), then adds the parent sku with the picked option uids, like the product page.
// - Bundle/grouped/downloadable: options too complex for a card, so go to the product page.
// - Heart: signed out -> login modal; signed in -> toggle in the Magento wishlist.

const DIRECT_ADD = new Set(["SimpleProduct", "VirtualProduct"]);

export type CardOption = {
  attribute_code: string; label: string;
  values: { uid: string; label: string; value_index: number; swatch_data?: { value?: string | null } | null }[];
};
type CardVariant = { attributes?: { code?: string; value_index: number }[]; product?: { stock_status?: string | null } | null };

export function HeartIcon({ filled, width = 27, height = 24 }: { filled: boolean; width?: number; height?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={width} height={height} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function missingLabel(options: CardOption[], picked: Record<string, number>) {
  const missing = options.filter((o) => picked[o.attribute_code] == null);
  return missing.length === 1 ? `Choose ${missing[0].label.toLowerCase()}` : "Choose options";
}

export function CardActions({ sku, typename, href, inStock, locale, options = [], variants = [] }: {
  sku: string; typename?: string; href: string; inStock: boolean; locale: string;
  options?: CardOption[]; variants?: CardVariant[];
}) {
  const wishlist = useWishlist(locale);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [picking, setPicking] = useState(false);
  const [picked, setPicked] = useState<Record<string, number>>({});
  const panel = useRef<HTMLDivElement>(null);
  const configurable = typename === "ConfigurableProduct" && options.length > 0;

  useEffect(() => {
    if (!picking) return;
    panel.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPicking(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [picking]);

  // A value is offered when some in-stock variant has it and matches the other picks.
  const available = (code: string, vi: number) => variants.some((v) => v.product?.stock_status !== "OUT_OF_STOCK"
    && v.attributes?.some((a) => a.code === code && a.value_index === vi)
    && Object.entries(picked).every(([c, p]) => c === code || v.attributes?.some((a) => a.code === c && a.value_index === p)));
  const complete = options.every((o) => picked[o.attribute_code] != null);

  async function post(selected_options?: string[]) {
    setAdding(true);
    setError("");
    try {
      const res = await fetch(BASE + "/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, sku, quantity: 1, ...(selected_options ? { selected_options } : {}) }),
      });
      const j = await res.json();
      if (j.cart) window.dispatchEvent(new CustomEvent("headora:cart", { detail: j.cart }));
      if (!j.ok) setError(j.error ?? "Could not add to cart.");
      else { setPicking(false); setPicked({}); }
    } catch {
      setError("Could not reach the store. Please try again.");
    } finally {
      setAdding(false);
    }
  }

  function addToCart() {
    if (configurable) { setError(""); setPicking(true); return; }
    if (!DIRECT_ADD.has(typename ?? "")) { window.location.assign(href); return; }
    post();
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
      {picking ? (
        <div className="hd-card__opts" ref={panel} role="dialog" aria-label="Choose options">
          <button type="button" className="hd-card__opts-close" aria-label="Close" onClick={() => setPicking(false)}>×</button>
          {options.map((o) => {
            const chosen = o.values.find((v) => v.value_index === picked[o.attribute_code]);
            return (
              <fieldset key={o.attribute_code} className="hd-card__opt">
                <legend>{o.label}{chosen ? <span>: {chosen.label}</span> : null}</legend>
                <div className="hd-card__vals">
                  {o.values.map((v) => {
                    const hex = v.swatch_data?.value?.startsWith("#") ? v.swatch_data.value : null;
                    const on = picked[o.attribute_code] === v.value_index;
                    return (
                      <button key={v.uid} type="button" disabled={!available(o.attribute_code, v.value_index)}
                        className={hex ? "hd-card__swatch" : "hd-card__chip"} style={hex ? { background: hex } : undefined}
                        aria-pressed={on} aria-label={hex ? v.label : undefined} title={v.label}
                        onClick={() => setPicked((p) => ({ ...p, [o.attribute_code]: v.value_index }))}>
                        {hex ? null : v.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}
          <button type="button" className="hd-card__add" disabled={!complete || adding}
            onClick={() => post(options.map((o) => o.values.find((v) => v.value_index === picked[o.attribute_code])!.uid))}>
            {adding ? "Adding…" : complete ? "Add to cart" : missingLabel(options, picked)}
          </button>
          {error ? <p className="hd-msg hd-msg--err" role="alert">{error}</p> : null}
        </div>
      ) : null}
      {error && !picking ? <p className="hd-msg hd-msg--err hd-card__err" role="alert">{error}</p> : null}
    </>
  );
}
