"use client";
import { useEffect, useState, type FormEvent } from "react";
import { money } from "../catalog/ProductCard.js";
import { BASE, home } from "../../lib/base.js";

type Money = { value: number | null; currency: string | null };
type Region = { id: number; code: string; name: string };
type Country = { id: string; full_name_locale: string; available_regions: Region[] | null };
type ShipMethod = { carrier_code: string; method_code: string; carrier_title: string; method_title: string; available: boolean; amount: Money };
type Cart = {
  email: string | null;
  is_virtual: boolean;
  total_quantity: number;
  items: { uid: string; quantity: number; product: { name: string; sku: string; small_image?: { url: string } }; prices: { row_total: Money };
    configurable_options?: { option_label: string; value_label: string }[]; configured_variant?: { small_image?: { url: string } } }[];
  shipping_addresses: { firstname: string; lastname: string; street: string[]; city: string; postcode: string | null; telephone: string;
    region: { region_id: number | null; label: string | null } | null; country: { code: string };
    available_shipping_methods: ShipMethod[]; selected_shipping_method: { carrier_code: string; method_code: string; amount: Money } | null }[];
  available_payment_methods: { code: string; title: string }[];
  selected_payment_method: { code: string } | null;
  prices: { subtotal_excluding_tax: Money; grand_total: Money; applied_taxes: { amount: Money }[] };
};
type Step = "address" | "shipping" | "payment";
type Saved = { firstname: string; lastname: string; street: string[]; city: string; postcode: string | null; telephone: string; country_code: string; region: { region: string | null; region_id: number | null } | null };

// One-page checkout (guest, or signed in on the customer's cart: no email field, saved address prefilled): address -> delivery method -> offline payment -> place order.
// Gateways that need their own form (cards, PayPal...) stay on the native Magento checkout.
export function Checkout({ locale, defaultCountry }: { locale: string; defaultCountry: string }) {
  const [cart, setCart] = useState<Cart | null | undefined>(undefined);
  const [countries, setCountries] = useState<Country[]>([]);
  const [offline, setOffline] = useState<string[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [step, setStep] = useState<Step>("address");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", firstname: "", lastname: "", street: "", city: "", postcode: "", telephone: "", country_code: defaultCountry, region_id: 0, region: "" });
  const [ship, setShip] = useState("");
  const [pay, setPay] = useState("");

  useEffect(() => {
    fetch(`${BASE}/api/checkout?locale=${encodeURIComponent(locale)}`).then((r) => r.json()).then((j) => {
      setCountries(j.countries ?? []);
      setOffline(j.offline ?? []);
      setSignedIn(!!j.signedIn);
      const c: Cart | null = j.cart && j.cart.total_quantity ? j.cart : null;
      setCart(c);
      const a = c?.shipping_addresses?.[0];
      const s: Saved | null = j.savedAddress ?? null;
      if (c && a) {
        setForm((f) => ({ ...f, email: c.email ?? "", firstname: a.firstname, lastname: a.lastname, street: a.street.join(", "), city: a.city,
          postcode: a.postcode ?? "", telephone: a.telephone, country_code: a.country.code, region_id: a.region?.region_id ?? 0, region: a.region?.label ?? "" }));
      } else if (c && s) {
        setForm((f) => ({ ...f, email: c.email ?? "", firstname: s.firstname, lastname: s.lastname, street: s.street.join(", "), city: s.city,
          postcode: s.postcode ?? "", telephone: s.telephone, country_code: s.country_code, region_id: s.region?.region_id ?? 0, region: s.region?.region ?? "" }));
      } else if (c?.email) {
        setForm((f) => ({ ...f, email: c.email ?? "" }));
      }
    }).catch(() => setError("Could not reach the store. Please try again."));
  }, [locale]);

  async function post(payload: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(BASE + "/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ locale, ...payload }) });
      const j = await res.json();
      if (!j.ok) { setError(j.error ?? "Something went wrong."); return null; }
      if (j.cart) setCart(j.cart);
      return j;
    } catch {
      setError("Could not reach the store. Please try again.");
      return null;
    } finally {
      setBusy(false);
    }
  }

  const country = countries.find((c) => c.id === form.country_code);
  const regions = country?.available_regions ?? [];
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: k === "region_id" ? Number(e.target.value) : e.target.value }));

  async function submitAddress(e: FormEvent) {
    e.preventDefault();
    const { email, region_id, region, street, ...rest } = form;
    const j = await post({ step: "address", email, address: { ...rest, street: [street], ...(regions.length ? { region_id } : { region }) } });
    if (!j) return;
    const methods: ShipMethod[] = (j.cart?.shipping_addresses?.[0]?.available_shipping_methods ?? []).filter((m: ShipMethod) => m.available);
    const sel = j.cart?.shipping_addresses?.[0]?.selected_shipping_method;
    setShip(sel ? `${sel.carrier_code}|${sel.method_code}` : methods[0] ? `${methods[0].carrier_code}|${methods[0].method_code}` : "");
    setStep(j.cart?.is_virtual ? "payment" : "shipping");
  }
  async function submitShipping(e: FormEvent) {
    e.preventDefault();
    const [carrier_code, method_code] = ship.split("|");
    if (!(await post({ step: "shipping", carrier_code, method_code }))) return;
    setStep("payment");
  }
  async function placeOrder(e: FormEvent) {
    e.preventDefault();
    const j = await post({ step: "place", payment_code: pay });
    if (j?.order_number) {
      setOrder(j.order_number);
      window.dispatchEvent(new CustomEvent("headora:cart-sync", { detail: { count: 0, total: null, items: [] } }));
      window.scrollTo({ top: 0 });
    }
  }

  if (order) {
    return (
      <div className="std-wrap std-page std-checkout std-done">
        <p className="std-eyebrow">Order confirmed</p>
        <h1 className="std-h1">Thank you!</h1>
        <p className="std-lead">Your order number is <strong>#{order}</strong>. We’ve emailed a confirmation to {form.email}.</p>
        <a className="std-btn" href={home(locale)}>Continue shopping</a>
      </div>
    );
  }
  if (cart === undefined) {
    // Same frame as the loaded page (form cards + summary) so nothing jumps when data arrives.
    return (
      <div className="std-wrap std-page std-checkout" aria-busy="true">
        <h1 className="std-h1">Checkout</h1>
        <div className="std-cart">
          <div className="std-co"><div className="std-skel std-skel--form" /><div className="std-skel std-skel--bar" /><div className="std-skel std-skel--bar" /></div>
          <aside className="std-sum"><div className="std-skel std-skel--sum" /></aside>
        </div>
      </div>
    );
  }
  if (!cart) {
    return (
      <div className="std-wrap std-page std-checkout std-empty">
        <h1 className="std-h1">Checkout</h1>
        <p>Your basket is empty.</p>
        <a className="std-btn" href={home(locale)}>Continue shopping</a>
      </div>
    );
  }

  const addr = cart.shipping_addresses?.[0];
  const methods = (addr?.available_shipping_methods ?? []).filter((m) => m.available);
  const payments = cart.available_payment_methods.filter((p) => offline.includes(p.code));
  const others = cart.available_payment_methods.filter((p) => !offline.includes(p.code));
  const shipAmount = addr?.selected_shipping_method?.amount;
  const tax = cart.prices.applied_taxes.reduce((s, t) => s + (t.amount.value ?? 0), 0);
  const cur = cart.prices.grand_total.currency;

  return (
    <div className="std-wrap std-page std-checkout">
      <h1 className="std-h1">Checkout</h1>
      <div className="std-cart">
        <div className="std-co">
          {error ? <p className="hd-msg hd-msg--err" role="alert">{error}</p> : null}

          <section className="std-co__card">
            <div className="std-co__head"><h2 className="std-h3">{signedIn ? "Delivery address" : "Contact & delivery address"}</h2>
              {step !== "address" ? <button type="button" className="std-link" onClick={() => setStep("address")}>Edit</button> : null}</div>
            {step === "address" ? (
              <form className="std-form" onSubmit={submitAddress}>
                {signedIn ? null : <label className="std-field std-field--full">Email<input type="email" required autoComplete="email" value={form.email} onChange={set("email")} /></label>}
                <label className="std-field">First name<input required autoComplete="given-name" value={form.firstname} onChange={set("firstname")} /></label>
                <label className="std-field">Last name<input required autoComplete="family-name" value={form.lastname} onChange={set("lastname")} /></label>
                <label className="std-field std-field--full">Street address<input required autoComplete="street-address" value={form.street} onChange={set("street")} /></label>
                <label className="std-field">City<input required autoComplete="address-level2" value={form.city} onChange={set("city")} /></label>
                <label className="std-field">Postcode<input autoComplete="postal-code" value={form.postcode} onChange={set("postcode")} /></label>
                <label className="std-field">Country
                  <select required autoComplete="country" value={form.country_code} onChange={(e) => setForm((f) => ({ ...f, country_code: e.target.value, region_id: 0, region: "" }))}>
                    {[...countries].sort((a, b) => (a.full_name_locale ?? "").localeCompare(b.full_name_locale ?? "")).map((c) => <option key={c.id} value={c.id}>{c.full_name_locale}</option>)}
                  </select>
                </label>
                {regions.length ? (
                  <label className="std-field">State / region
                    <select required value={form.region_id || ""} onChange={set("region_id")}>
                      <option value="" disabled>Select…</option>
                      {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </label>
                ) : (
                  <label className="std-field">State / region<input autoComplete="address-level1" value={form.region} onChange={set("region")} /></label>
                )}
                <label className="std-field std-field--full">Phone<input required type="tel" autoComplete="tel" value={form.telephone} onChange={set("telephone")} /></label>
                <button type="submit" className="std-btn std-btn--block" disabled={busy}>{busy ? "Saving…" : "Continue to delivery"}</button>
              </form>
            ) : (
              <p className="std-muted">{form.email}<br />{form.firstname} {form.lastname}, {form.street}, {form.city} {form.postcode}, {form.country_code}</p>
            )}
          </section>

          {!cart.is_virtual ? (
            <section className="std-co__card">
              <div className="std-co__head"><h2 className="std-h3">Delivery method</h2>
                {step === "payment" ? <button type="button" className="std-link" onClick={() => setStep("shipping")}>Edit</button> : null}</div>
              {step === "shipping" ? (
                <form className="std-form" onSubmit={submitShipping}>
                  {methods.length ? methods.map((m) => {
                    const v = `${m.carrier_code}|${m.method_code}`;
                    return (
                      <label key={v} className="std-radio std-field--full">
                        <input type="radio" name="ship" value={v} checked={ship === v} onChange={() => setShip(v)} />
                        <span><strong>{m.carrier_title}</strong> {m.method_title}</span>
                        <span>{m.amount.value ? money(m.amount, locale) : "Free"}</span>
                      </label>
                    );
                  }) : <p className="std-muted std-field--full">No delivery methods are available for this address.</p>}
                  <button type="submit" className="std-btn std-btn--block" disabled={busy || !ship}>{busy ? "Saving…" : "Continue to payment"}</button>
                </form>
              ) : step === "payment" && addr?.selected_shipping_method ? (
                <p className="std-muted">{methods.find((m) => m.carrier_code === addr.selected_shipping_method!.carrier_code && m.method_code === addr.selected_shipping_method!.method_code)?.carrier_title ?? "Selected"} · {shipAmount?.value ? money(shipAmount, locale) : "Free"}</p>
              ) : null}
            </section>
          ) : null}

          <section className="std-co__card">
            <h2 className="std-h3">Payment</h2>
            {step === "payment" ? (
              <form className="std-form" onSubmit={placeOrder}>
                {payments.map((p) => (
                  <label key={p.code} className="std-radio std-field--full">
                    <input type="radio" name="pay" value={p.code} checked={pay === p.code} onChange={() => setPay(p.code)} />
                    <span><strong>{p.title}</strong></span>
                  </label>
                ))}
                {others.length ? (
                  <p className="std-muted std-field--full">Paying by {others.map((o) => o.title).join(", ")}? <a href={BASE + "/api/handoff"}>Continue on secure checkout</a>.</p>
                ) : null}
                <button type="submit" className="std-btn std-btn--block" disabled={busy || !pay}>{busy ? "Placing order…" : `Place order · ${money(cart.prices.grand_total, locale)}`}</button>
              </form>
            ) : null}
          </section>
        </div>

        <aside className="std-sum" aria-label="Order summary">
          <h2 className="std-h3">Order summary</h2>
          <ul className="std-sum__items">
            {cart.items.map((i) => (
              <li key={i.uid}>
                <span className="std-sum__thumb">
                  {(i.configured_variant?.small_image?.url ?? i.product.small_image?.url) ? <img src={i.configured_variant?.small_image?.url ?? i.product.small_image?.url} alt="" loading="lazy" /> : null}
                  <b>{i.quantity}</b>
                </span>
                <span>{i.product.name}{i.configurable_options?.length ? <small>{i.configurable_options.map((o) => o.value_label).join(" · ")}</small> : null}</span>
                <span>{money(i.prices.row_total, locale)}</span>
              </li>
            ))}
          </ul>
          <div className="std-sum__row"><span>Subtotal</span><span>{money(cart.prices.subtotal_excluding_tax, locale)}</span></div>
          <div className="std-sum__row"><span>Shipping</span><span>{shipAmount ? (shipAmount.value ? money(shipAmount, locale) : "Free") : <span className="std-muted">Next step</span>}</span></div>
          {tax ? <div className="std-sum__row"><span>Tax</span><span>{money({ value: tax, currency: cur }, locale)}</span></div> : null}
          <div className="std-sum__row std-sum__total"><span>Total</span><span>{money(cart.prices.grand_total, locale)}</span></div>
        </aside>
      </div>
    </div>
  );
}
