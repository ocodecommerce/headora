"use client";
import { useEffect, useRef, useState } from "react";
import { BagIcon } from "./Icons.js";
import { money } from "../catalog/ProductCard.js";
import type { CartSummary } from "../../lib/cart.js";

// Header cart: count badge + slide-in drawer from the right (legacy v1 "cart bag").
// Loads GET /api/cart on mount; the "headora:cart" event (product page / card add-to-cart) refreshes and opens it.
// Checkout goes through /api/handoff to native Magento checkout.
export function MiniCart({ locale }: { locale: string }) {
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [leaving, setLeaving] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetch(`/api/cart?locale=${encodeURIComponent(locale)}`)
      .then((r) => r.json())
      .then((j) => j.ok && setCart(j.cart))
      .catch(() => {})
      .finally(() => setLoading(false));
    const onCart = (e: Event) => { setCart((e as CustomEvent<CartSummary>).detail); setLoading(false); setOpen(true); };
    window.addEventListener("headora:cart", onCart);
    return () => window.removeEventListener("headora:cart", onCart);
  }, [locale]);

  // Modal behaviour: focus close button, Escape closes, page behind does not scroll.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);

  function close() {
    setLeaving(true);
    setTimeout(() => { setOpen(false); setLeaving(false); triggerRef.current?.focus(); }, 200);
  }

  async function remove(uid: string) {
    setRemoving(uid);
    setError("");
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, uid }),
      });
      const j = await res.json();
      if (j.ok) setCart(j.cart); else setError(j.error ?? "Could not remove the item.");
    } catch {
      setError("Could not reach the store. Please try again.");
    } finally {
      setRemoving(null);
    }
  }

  // Same estimate the legacy storefront showed: 3 to 11 days from today.
  const day = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toLocaleDateString(locale, { day: "numeric", month: "short" });
  };

  const count = cart?.count ?? 0;
  const items = cart?.items ?? [];
  const subtotal = money(cart?.total, locale);

  return (
    <>
      <button ref={triggerRef} type="button" className="hd-action hd-minicart" aria-haspopup="dialog" aria-expanded={open}
        aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`} onClick={() => setOpen(true)}>
        <BagIcon />
        {count ? <span className="hd-badge">{count > 99 ? "99+" : count}</span> : null}
      </button>

      {open ? (
        <div className={`hd-drawer${leaving ? " hd-drawer--leaving" : ""}`} onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
          <div className="hd-drawer__panel" role="dialog" aria-modal="true" aria-labelledby="hd-drawer-title">
            <div className="hd-drawer__head">
              <button ref={closeRef} type="button" className="hd-drawer__close" aria-label="Close cart" onClick={close}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
              <h2 id="hd-drawer-title">Cart</h2>
              <span className="hd-drawer__bag" aria-hidden="true">
                <BagIcon />
                {count ? <span className="hd-badge">{count > 99 ? "99+" : count}</span> : null}
              </span>
            </div>

            {loading ? (
              <div className="hd-drawer__body" aria-busy="true">
                {[0, 1, 2].map((i) => <div key={i} className="hd-drawer__skeleton" />)}
              </div>
            ) : items.length ? (
              <>
                <div className="hd-drawer__body">
                  {error ? <p className="hd-msg hd-msg--err" role="alert">{error}</p> : null}
                  <ul className="hd-drawer__items">
                    {items.map((i) => (
                      <li key={i.uid} className={`hd-drawer__item${removing === i.uid ? " is-removing" : ""}`}>
                        <div className="hd-drawer__row">
                          <a className="hd-drawer__thumb" href={`/${locale}/${i.url_key}.html`} tabIndex={-1}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {i.image ? <img src={i.image} alt="" /> : null}
                          </a>
                          <div className="hd-drawer__detail">
                            <a className="hd-drawer__name" href={`/${locale}/${i.url_key}.html`}>{i.name}</a>
                            <p className="hd-drawer__sku"><strong>SKU:</strong> {i.sku}</p>
                            {i.options.map((o) => <p key={o} className="hd-drawer__sku">{o}</p>)}
                          </div>
                          <button type="button" className="hd-drawer__delete" aria-label={`Remove ${i.name}`}
                            disabled={!!removing} onClick={() => remove(i.uid)}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                            </svg>
                          </button>
                        </div>
                        <div className="hd-drawer__qty">
                          <p><b>Quantity:</b> {i.quantity}</p>
                          <p><strong>{money(i.rowTotal, locale)}</strong></p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <section className="hd-drawer__summary" aria-labelledby="hd-drawer-summary">
                    <h3 id="hd-drawer-summary">Cart Order Summary</h3>
                    <div className="hd-drawer__summary-box">
                      <div className="hd-drawer__line"><span>Subtotal ({items.length} Item{items.length > 1 ? "s" : ""})</span><strong>{subtotal}</strong></div>
                      <div className="hd-drawer__line"><span>Shipping</span><span className="hd-drawer__muted">Delivery Charges if applicable</span></div>
                      <div className="hd-drawer__line"><span>Estimated Delivery:</span><span className="hd-drawer__muted">{day(3)} - {day(11)}</span></div>
                      <hr />
                      <div className="hd-drawer__line hd-drawer__total"><span>Total</span><strong>{subtotal}</strong></div>
                    </div>
                  </section>
                </div>
                <div className="hd-drawer__foot">
                  <div className="hd-drawer__line"><span>Subtotal</span><span>{subtotal}</span></div>
                  <a className="hd-drawer__checkout" href="/api/handoff">Proceed to Checkout</a>
                </div>
              </>
            ) : (
              <div className="hd-drawer__empty"><h3>There are no items in your cart.</h3></div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
