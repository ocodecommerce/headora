"use client";
import { useEffect, useMemo, useState } from "react";
import { Gallery, type GalleryImage } from "./Gallery.js";
import { CompareButton } from "./CompareButton.js";
import { BundleOptions, type BundleItem, type BundleState } from "./BundleOptions.js";
import { Price, money, type CardProduct } from "../catalog/ProductCard.js";
import { HeartIcon } from "../catalog/CardActions.js";
import { useWishlist } from "../catalog/wishlistStore.js";

type OptionValue = { uid: string; label: string; value_index: number; swatch_data?: { value?: string | null } | null };
type Option = { attribute_code: string; label: string; values: OptionValue[] };
type Variant = {
  product: { sku: string; stock_status?: string | null; media_gallery?: GalleryImage[]; price_range?: CardProduct["price_range"] };
  attributes: { code: string; value_index: number }[];
};
export type PdpItem = {
  __typename: string;
  sku: string;
  name: string;
  url_key: string;
  stock_status?: string | null;
  price_range?: CardProduct["price_range"];
  media_gallery?: GalleryImage[];
  small_image?: GalleryImage | null;
  description?: { html?: string | null } | null;
  short_description?: { html: string } | null;
  configurable_options?: Option[];
  variants?: Variant[];
  dynamic_price?: boolean | null;
  items?: BundleItem[];
};

// Product types the headless cart supports; the rest buy on the native Magento page.
const SUPPORTED = new Set(["SimpleProduct", "VirtualProduct", "ConfigurableProduct", "BundleProduct"]);
// Legacy labels options by attribute code ("fashion_color" -> "fashion color", CSS capitalises).
const optionLabel = (o: Option) => o.attribute_code.replaceAll("_", " ");
const isHex = (v?: string | null) => /^#[0-9a-f]{3,8}$/i.test(v ?? "");

// Legacy v1 product page: gallery + buy box. Picking options switches the gallery,
// SKU and price to the matching variant, as the legacy storefront did.
export function ProductView({ item, reviewCount, locale, magentoBaseUrl }: {
  item: PdpItem; reviewCount: number; locale: string; magentoBaseUrl: string;
}) {
  const options = item.configurable_options ?? [];
  const variants = item.variants ?? [];
  const [picked, setPicked] = useState<Record<string, number>>({});
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const wishlist = useWishlist(locale);
  const isBundle = item.__typename === "BundleProduct";
  const [bundle, setBundle] = useState<BundleState>({ uids: [], missing: [], total: null });

  const matches = (v: Variant, sel: Record<string, number>) =>
    Object.entries(sel).every(([c, vi]) => v.attributes.some((a) => a.code === c && a.value_index === vi));
  // Full match -> that variant; partial (e.g. colour only) -> first matching variant for its images.
  const complete = isBundle ? !bundle.missing.length : options.every((o) => picked[o.attribute_code] != null);
  const exact = complete && options.length ? variants.find((v) => matches(v, picked)) : undefined;
  const preview = Object.keys(picked).length ? variants.find((v) => matches(v, picked)) : undefined;

  // Variant photos first, then the parent's (legacy behaviour), without duplicates.
  const images = useMemo(() => {
    const parent = item.media_gallery?.length ? item.media_gallery : item.small_image ? [item.small_image] : [];
    const own = (preview?.product.media_gallery ?? []).filter((i) => i.url && !i.disabled)
      .map((i, n) => ({ ...i, position: -100 + n }));
    const seen = new Set(own.map((i) => i.url));
    return [...own, ...parent.filter((i) => !seen.has(i.url))];
  }, [preview, item]);

  // Warm the browser cache with each colour's main photo once the page is idle, so switching colour
  // rarely waits on a download (deduped: size variants share their colour's photos).
  useEffect(() => {
    const urls = new Set(variants.map((v) => (v.product.media_gallery ?? []).filter((i) => i.url && !i.disabled)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))[0]?.url).filter((u): u is string => !!u));
    if (!urls.size) return;
    const warm = () => urls.forEach((u) => { new Image().src = u; });
    const idle = (window as any).requestIdleCallback as ((cb: () => void) => number) | undefined;
    const id = idle ? idle(warm) : window.setTimeout(warm, 1500);
    return () => { if (idle) (window as any).cancelIdleCallback?.(id); else clearTimeout(id); };
  }, [variants]);

  const available = (code: string, valueIndex: number) =>
    variants.some((v) => v.product.stock_status !== "OUT_OF_STOCK" && matches(v, { ...picked, [code]: valueIndex }));

  const inStock = exact ? exact.product.stock_status !== "OUT_OF_STOCK" : item.stock_status !== "OUT_OF_STOCK";
  const sku = exact?.product.sku ?? item.sku;
  const priceRange = exact?.product.price_range ?? item.price_range;
  const supported = SUPPORTED.has(item.__typename);

  async function add() {
    if (!inStock || busy) return;
    if (!complete) {
      const missing = isBundle ? bundle.missing : options.filter((o) => picked[o.attribute_code] == null).map(optionLabel);
      setMsg({ ok: false, text: `Please select ${missing.join(" and ")}.` });
      return;
    }
    setBusy(true);
    setMsg(null);
    const selected = isBundle ? bundle.uids : options.map((o) => o.values.find((v) => v.value_index === picked[o.attribute_code])!.uid);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, sku: item.sku, quantity: qty, selected_options: selected }),
      });
      const j = await res.json();
      if (j.cart) window.dispatchEvent(new CustomEvent("headora:cart", { detail: j.cart }));
      setMsg(j.ok ? { ok: true, text: "Added to your cart." } : { ok: false, text: j.error ?? "Could not add to cart." });
    } catch {
      setMsg({ ok: false, text: "Could not reach the store. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  const wished = wishlist.wished(item.sku);
  return (
    <div className="hd-pdp">
      <Gallery images={images} name={item.name} />
      <div className="hd-pdp__info">
        <h1>{item.name}</h1>
        <a className="hd-pdp__rating" href="#hd-tab-reviews">
          {reviewCount ? `${reviewCount} review${reviewCount > 1 ? "s" : ""}` : "Be the first to review this product."}
        </a>
        <div className="hd-pdp__meta">
          <div className="hd-price"><Price range={priceRange} locale={locale} /></div>
          <div>
            <div className={`hd-stock${inStock ? "" : " hd-stock--out"}`}>{inStock ? "In stock" : "Out of stock"}</div>
            <div className="hd-sku">SKU#: {sku}</div>
          </div>
        </div>

        {supported && options.map((o) => {
          const current = o.values.find((v) => v.value_index === picked[o.attribute_code]);
          return (
            <fieldset key={o.attribute_code} className="hd-opt">
              <legend className="hd-opt__label">{optionLabel(o)}</legend>
              <ul className="hd-opt__values">
                {o.values.map((v) => {
                  const hex = isHex(v.swatch_data?.value) ? v.swatch_data!.value! : null;
                  const on = picked[o.attribute_code] === v.value_index;
                  const ok = available(o.attribute_code, v.value_index);
                  return (
                    <li key={v.uid}>
                      <button
                        type="button"
                        className={`hd-opt__box${hex ? " hd-opt__box--swatch" : ""}`}
                        style={hex ? { backgroundColor: hex } : undefined}
                        aria-pressed={on}
                        aria-label={`${o.label} ${v.label}${ok ? "" : " (unavailable)"}`}
                        title={v.label}
                        disabled={!ok}
                        onClick={() => setPicked((p) => {
                          const next = { ...p };
                          if (on) delete next[o.attribute_code]; else next[o.attribute_code] = v.value_index;
                          return next;
                        })}
                      >
                        {hex ? (on ? <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg> : null) : v.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="hd-opt__selected">Selected {optionLabel(o)}: {current?.label ?? "none"}</p>
            </fieldset>
          );
        })}

        {isBundle && item.items?.length ? (
          <>
            <BundleOptions items={item.items} dynamic={item.dynamic_price !== false} locale={locale} onChange={setBundle} />
            {bundle.total ? <p className="hd-bundle__total">Price as configured: <strong>{money(bundle.total, locale)}</strong></p> : null}
          </>
        ) : null}

        {supported ? (
          <>
            {inStock ? (
              <div className="hd-qty">
                <span className="hd-qty__label" id="hd-qty-label">Quantity:</span>
                <div className="hd-qty__ctrl" role="group" aria-labelledby="hd-qty-label">
                  <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
                  <input type="text" inputMode="numeric" value={qty} aria-label="Quantity"
                    onChange={(e) => setQty(Math.min(100, Math.max(1, Math.floor(Number(e.target.value.replace(/\D/g, "")) || 1))))} />
                  <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(100, q + 1))}>+</button>
                </div>
              </div>
            ) : null}
            <div className="hd-pdp__actions">
              {inStock ? (
                <button type="button" className="hd-pdp__atc" onClick={add} disabled={busy} data-ready={complete ? "true" : "false"}>
                  {busy ? "Adding…" : "Add to cart"}
                </button>
              ) : (
                <span className="hd-pdp__oos">Out of Stock</span>
              )}
              <p className={`hd-msg${msg ? (msg.ok ? " hd-msg--ok" : " hd-msg--err") : ""}`} role="status" aria-live="polite">{msg?.text ?? ""}</p>
            </div>
          </>
        ) : (
          <a className="hd-pdp__atc" href={`${magentoBaseUrl.replace(/\/$/, "")}/${item.url_key}.html`}>Choose options in store</a>
        )}

        <div className="hd-pdp__secondary">
          <button type="button" className="hd-pdp__fav" disabled={wishlist.busy} aria-pressed={wished}
            onClick={async () => { const e = await wishlist.toggle(item.sku); if (e) setMsg({ ok: false, text: e }); }}>
            <HeartIcon filled={wished} width={20} height={18} />
            {wished ? "Added To Favorites" : "Add To Favorites"}
          </button>
          <CompareButton product={{
            id: sku, name: item.name, sku, url_key: item.url_key, image: images[0]?.url ?? null,
            price: priceRange?.minimum_price?.final_price?.value ?? null, currency: priceRange?.minimum_price?.final_price?.currency ?? null,
            description: item.description?.html ?? null,
          }} />
        </div>

        {item.short_description?.html ? <div className="hd-pdp__short" dangerouslySetInnerHTML={{ __html: item.short_description.html }} /> : null}
      </div>
    </div>
  );
}
