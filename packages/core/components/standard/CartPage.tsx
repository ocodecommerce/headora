"use client";
import { useEffect, useState } from "react";
import { money } from "../catalog/ProductCard.js";
import type { CartSummary } from "../../lib/cart.js";
import { ArrowIcon } from "./StdIcons.js";
import { BASE } from "../../lib/base.js";

// Basket page: lines with quantity steppers, free-shipping progress, summary, checkout.
// Uses the same guest-cart API as the drawer and keeps the header badge in sync.
export function CartPage({ locale, freeOver }: { locale: string; freeOver: number }) {
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${BASE}/api/cart?locale=${encodeURIComponent(locale)}`).then((r) => r.json()).then((j) => setCart(j.ok ? j.cart : { count: 0, total: null, items: [] }))
      .catch(() => setError("Could not reach the store. Please try again."));
  }, [locale]);

  async function call(method: "PATCH" | "DELETE", uid: string, quantity?: number) {
    setBusy(uid);
    setError("");
    try {
      const res = await fetch(BASE + "/api/cart", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ locale, uid, quantity }) });
      const j = await res.json();
      if (j.cart) {
        setCart(j.cart);
        // Header badge (MiniCart) listens for this; it would also open the drawer, so only sync the count.
        window.dispatchEvent(new CustomEvent("headora:cart-sync", { detail: j.cart }));
      }
      if (!j.ok) setError(j.error ?? "Could not update your basket.");
    } catch {
      setError("Could not reach the store. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  if (!cart) {
    return <div className="std-wrap std-page" aria-busy="true"><h1 className="std-h1">Your basket</h1><div className="std-skel" /><div className="std-skel" /></div>;
  }
  const items = cart.items;
  const sub = cart.total?.value ?? 0;
  const currency = cart.total?.currency ?? "USD";
  const left = Math.max(0, freeOver - sub);
  const fmt = (v: number) => money({ value: v, currency }, locale);

  return (
    <div className="std-wrap std-page">
      <h1 className="std-h1">Your basket</h1>
      <p className="std-muted">{cart.count} item{cart.count === 1 ? "" : "s"}</p>
      {items.length ? (
        <div className="std-cart">
          <section className="std-cart__items" aria-label="Basket items">
            <div className="std-ship">
              <div className="std-ship__row"><strong>{left > 0 ? `${fmt(left)} away from free shipping` : "You’ve unlocked free shipping"}</strong><span>Free over {fmt(freeOver)}</span></div>
              <div className="std-ship__bar"><span style={{ width: `${Math.min(100, (sub / freeOver) * 100)}%` }} /></div>
            </div>
            {error ? <p className="hd-msg hd-msg--err" role="alert">{error}</p> : null}
            <ul>
              {items.map((i) => (
                <li key={i.uid} className={`std-line${busy === i.uid ? " is-busy" : ""}`}>
                  <a href={`${BASE}/${locale}/${i.url_key}.html`} tabIndex={-1}>{i.image ? <img src={i.image} alt="" loading="lazy" /> : <span className="std-line__ph" />}</a>
                  <div className="std-line__info">
                    <a className="std-line__name" href={`${BASE}/${locale}/${i.url_key}.html`}>{i.name}</a>
                    {i.options.map((o) => <span key={o} className="std-muted">{o}</span>)}
                    <span className="std-muted">SKU {i.sku}</span>
                    <div className="std-line__actions">
                      <div className="std-qty" role="group" aria-label={`Quantity of ${i.name}`}>
                        <button type="button" aria-label="Decrease quantity" disabled={!!busy || i.quantity <= 1} onClick={() => call("PATCH", i.uid, i.quantity - 1)}>−</button>
                        <span>{i.quantity}</span>
                        <button type="button" aria-label="Increase quantity" disabled={!!busy} onClick={() => call("PATCH", i.uid, i.quantity + 1)}>+</button>
                      </div>
                      <button type="button" className="std-link" disabled={!!busy} onClick={() => call("DELETE", i.uid)}>Remove</button>
                    </div>
                  </div>
                  <strong className="std-line__price">{money(i.rowTotal, locale)}</strong>
                </li>
              ))}
            </ul>
            <a className="std-back" href={`${BASE}/${locale}`}>← Continue shopping</a>
          </section>
          <aside className="std-sum" aria-label="Order summary">
            <h2 className="std-h3">Order summary</h2>
            <div className="std-sum__row"><span>Subtotal</span><span>{fmt(sub)}</span></div>
            <div className="std-sum__row"><span>Shipping</span><span className="std-muted">Calculated at checkout</span></div>
            <div className="std-sum__row std-sum__total"><span>Total</span><span>{fmt(sub)}</span></div>
            <a className="std-btn std-btn--block" href={`${BASE}/${locale}/checkout`}>Checkout securely<ArrowIcon /></a>
          </aside>
        </div>
      ) : (
        <div className="std-empty">
          <p>Your basket is empty.</p>
          <a className="std-btn" href={`${BASE}/${locale}`}>Continue shopping<ArrowIcon /></a>
        </div>
      )}
    </div>
  );
}
