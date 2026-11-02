"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { money, ProductCard, type CardProduct } from "../catalog/ProductCard.js";
import { ACCOUNT_SECTIONS } from "./accountSections.js";
import { signOut } from "./StdClient.js";

type Money = { value: number | null; currency: string | null };
type Region = { id: number; code: string; name: string };
type Country = { id: string; full_name_locale: string; available_regions: Region[] | null };
type Address = {
  id: number; firstname: string; lastname: string; street: string[]; city: string; postcode: string | null; telephone: string;
  country_code: string; default_shipping: boolean; default_billing: boolean; region: { region: string | null; region_code: string | null; region_id: number | null } | null;
};
type Order = {
  number: string; order_date: string; status: string;
  total: { grand_total: Money; subtotal: Money; total_shipping: Money };
  items: { id: string; product_name: string; product_sku: string; quantity_ordered: number; product_sale_price: Money; selected_options: { label: string; value: string }[] }[];
  shipping_address: { firstname: string; lastname: string; street: string[]; city: string; postcode: string | null; country_code: string; region: string | null } | null;
  shipping_method: string | null;
  payment_methods: { name: string }[];
};
type Customer = {
  firstname: string; lastname: string; email: string; is_subscribed: boolean;
  addresses: Address[];
  orders: { total_count: number; items: Order[] };
  wishlists: { id: string; items_v2: { items: { id: string; product: CardProduct | null }[] } }[];
};
type Msg = { ok: boolean; text: string } | null;

// Venia-style My Account: side menu + Order History, Favorites, Address Book, Communications,
// Account Information. Data comes from /api/account (customer token stays in an httpOnly cookie).
export function AccountPage({ locale, section }: { locale: string; section: string }) {
  const [state, setState] = useState<"loading" | "out" | "ready" | "error">("loading");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/account?locale=${encodeURIComponent(locale)}`);
      if (r.status === 401) { setState("out"); window.dispatchEvent(new Event("headora:auth-changed")); return; }
      const j = await r.json();
      if (!j.ok) { setState("error"); return; }
      setCustomer(j.customer);
      setCountries(j.countries ?? []);
      setState("ready");
    } catch {
      setState("error");
    }
  }, [locale]);

  useEffect(() => {
    load();
    // Signing in from the modal on this page loads the account straight away.
    const onAuth = () => { if (document.cookie.includes("headora_customer_name=")) load(); };
    window.addEventListener("headora:auth-changed", onAuth);
    return () => window.removeEventListener("headora:auth-changed", onAuth);
  }, [load]);

  async function act(payload: Record<string, unknown>): Promise<Msg> {
    try {
      const r = await fetch("/api/account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ locale, ...payload }) });
      if (r.status === 401) { setState("out"); return null; }
      const j = await r.json();
      if (!j.ok) return { ok: false, text: j.error ?? "Something went wrong." };
      await load();
      return { ok: true, text: "Saved." };
    } catch {
      return { ok: false, text: "Could not reach the store. Please try again." };
    }
  }

  const title = ACCOUNT_SECTIONS.find((s) => s.slug === section)?.label ?? "My account";
  if (state === "out") {
    return (
      <div className="std-wrap std-page std-empty">
        <h1 className="std-h1">My account</h1>
        <p>Sign in to see your orders, addresses and favorites.</p>
        <button type="button" className="std-btn" onClick={() => window.dispatchEvent(new Event("openLoginModal"))}>Sign in</button>
      </div>
    );
  }

  return (
    <div className="std-wrap std-page">
      <p className="std-eyebrow">{customer ? `Hi, ${customer.firstname}` : "My account"}</p>
      <h1 className="std-h1">{title}</h1>
      <div className="std-account">
        <nav className="std-account__nav" aria-label="My account">
          <ul>
            {ACCOUNT_SECTIONS.map((s) => (
              <li key={s.slug}><a href={`/${locale}/account/${s.slug}`} aria-current={s.slug === section ? "page" : undefined}>{s.label}</a></li>
            ))}
            <li><button type="button" onClick={() => signOut(locale)}>Sign Out</button></li>
          </ul>
        </nav>
        <section className="std-account__body">
          {state === "loading" ? <><div className="std-skel" /><div className="std-skel" /></> : null}
          {state === "error" ? <p className="hd-msg hd-msg--err" role="alert">Could not load your account. Please refresh the page.</p> : null}
          {state === "ready" && customer ? (
            section === "order-history" ? <Orders orders={customer.orders.items} locale={locale} />
            : section === "wishlist" ? <Favorites items={customer.wishlists[0]?.items_v2.items ?? []} locale={locale} />
            : section === "address-book" ? <Addresses addresses={customer.addresses} countries={countries} act={act} />
            : section === "communications" ? <Communications subscribed={customer.is_subscribed} act={act} />
            : <Information customer={customer} act={act} />
          ) : null}
        </section>
      </div>
    </div>
  );
}

function Orders({ orders, locale }: { orders: Order[]; locale: string }) {
  const [open, setOpen] = useState<string | null>(null);
  if (!orders.length) return <EmptyState text="You haven't placed any orders yet." locale={locale} />;
  // Magento 2.4.7+ sends order_date pre-formatted for the store locale; only reformat ISO values.
  const date = (d: string) => /^\d{4}-/.test(d) ? new Date(d.replace(" ", "T")).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" }) : d.split(" ")[0];
  return (
    <ul className="std-orders">
      {orders.map((o) => (
        <li key={o.number} className="std-card">
          <button type="button" className="std-orders__head" aria-expanded={open === o.number} onClick={() => setOpen(open === o.number ? null : o.number)}>
            <span><small>Order</small><strong>#{o.number}</strong></span>
            <span><small>Placed</small>{date(o.order_date)}</span>
            <span><small>Total</small>{money(o.total.grand_total, locale)}</span>
            <span className="std-status">{o.status}</span>
          </button>
          {open === o.number ? (
            <div className="std-orders__body">
              <ul className="std-orders__items">
                {o.items.map((i) => (
                  <li key={i.id}>
                    <span>{i.product_name}
                      {i.selected_options.length ? <small>{i.selected_options.map((s) => s.value).join(" · ")}</small> : null}</span>
                    <span className="std-muted">× {i.quantity_ordered}</span>
                    <span>{money(i.product_sale_price, locale)}</span>
                  </li>
                ))}
              </ul>
              <div className="std-orders__meta">
                {o.shipping_address ? (
                  <p><small>Ship to</small>{o.shipping_address.firstname} {o.shipping_address.lastname}<br />{o.shipping_address.street.join(", ")}<br />{o.shipping_address.city} {o.shipping_address.postcode}, {o.shipping_address.country_code}</p>
                ) : null}
                <p><small>Delivery</small>{o.shipping_method ?? "—"}<br /><small>Payment</small>{o.payment_methods.map((p) => p.name).join(", ") || "—"}</p>
                <p><small>Subtotal</small>{money(o.total.subtotal, locale)}<br /><small>Shipping</small>{money(o.total.total_shipping, locale)}<br /><small>Total</small><strong>{money(o.total.grand_total, locale)}</strong></p>
              </div>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function Favorites({ items, locale }: { items: { id: string; product: CardProduct | null }[]; locale: string }) {
  const products = items.map((i) => i.product).filter((p): p is CardProduct => !!p);
  if (!products.length) return <EmptyState text="Tap the heart on any product to save it here." locale={locale} />;
  return (
    <ul className="hd-grid std-favs">
      {products.map((p) => <li key={p.sku}><ProductCard product={p} locale={locale} actions optimize /></li>)}
    </ul>
  );
}

const EMPTY_ADDRESS = { firstname: "", lastname: "", street: "", city: "", postcode: "", telephone: "", country_code: "US", region_id: 0, region: "", default_shipping: false, default_billing: false };

function Addresses({ addresses, countries, act }: { addresses: Address[]; countries: Country[]; act: (p: Record<string, unknown>) => Promise<Msg> }) {
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState(EMPTY_ADDRESS);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const country = countries.find((c) => c.id === form.country_code);
  const regions = country?.available_regions ?? [];
  const name = (code: string) => countries.find((c) => c.id === code)?.full_name_locale ?? code;

  function edit(a?: Address) {
    setMsg(null);
    setEditing(a ? a.id : "new");
    setForm(a ? { firstname: a.firstname, lastname: a.lastname, street: a.street.join(", "), city: a.city, postcode: a.postcode ?? "", telephone: a.telephone,
      country_code: a.country_code, region_id: a.region?.region_id ?? 0, region: a.region?.region ?? "", default_shipping: a.default_shipping, default_billing: a.default_billing }
      : { ...EMPTY_ADDRESS, default_shipping: !addresses.length, default_billing: !addresses.length });
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { street, region_id, region, ...rest } = form;
    const m = await act({ action: "address-save", id: editing === "new" ? undefined : editing, address: { ...rest, street: [street], ...(regions.length ? { region_id } : { region }) } });
    setBusy(false);
    setMsg(m);
    if (m?.ok) setEditing(null);
  }
  async function remove(id: number) {
    if (!window.confirm("Delete this address?")) return;
    setMsg(await act({ action: "address-delete", id }));
  }
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: k === "region_id" ? Number(e.target.value) : e.target.value }));

  return (
    <>
      {msg ? <p className={`hd-msg ${msg.ok ? "hd-msg--ok" : "hd-msg--err"}`} role="status">{msg.text}</p> : null}
      {editing !== null ? (
        <form className="std-form std-card" onSubmit={save}>
          <h2 className="std-h3 std-field--full">{editing === "new" ? "New address" : "Edit address"}</h2>
          <label className="std-field">First name<input required autoComplete="given-name" value={form.firstname} onChange={set("firstname")} /></label>
          <label className="std-field">Last name<input required autoComplete="family-name" value={form.lastname} onChange={set("lastname")} /></label>
          <label className="std-field std-field--full">Street address<input required autoComplete="street-address" value={form.street} onChange={set("street")} /></label>
          <label className="std-field">City<input required autoComplete="address-level2" value={form.city} onChange={set("city")} /></label>
          <label className="std-field">Postcode<input autoComplete="postal-code" value={form.postcode} onChange={set("postcode")} /></label>
          <label className="std-field">Country
            <select required value={form.country_code} onChange={(e) => setForm((f) => ({ ...f, country_code: e.target.value, region_id: 0, region: "" }))}>
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
            <label className="std-field">State / region<input value={form.region} onChange={set("region")} /></label>
          )}
          <label className="std-field std-field--full">Phone<input required type="tel" autoComplete="tel" value={form.telephone} onChange={set("telephone")} /></label>
          <label className="std-check std-field--full"><input type="checkbox" checked={form.default_shipping} onChange={(e) => setForm((f) => ({ ...f, default_shipping: e.target.checked }))} /> Default shipping address</label>
          <label className="std-check std-field--full"><input type="checkbox" checked={form.default_billing} onChange={(e) => setForm((f) => ({ ...f, default_billing: e.target.checked }))} /> Default billing address</label>
          <div className="std-form__actions std-field--full">
            <button type="submit" className="std-btn" disabled={busy}>{busy ? "Saving…" : "Save address"}</button>
            <button type="button" className="std-link" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      ) : (
        <ul className="std-addresses">
          {addresses.map((a) => (
            <li key={a.id} className="std-card">
              {a.default_shipping || a.default_billing ? <p className="std-eyebrow">{[a.default_shipping && "Default shipping", a.default_billing && "Default billing"].filter(Boolean).join(" · ")}</p> : null}
              <p><strong>{a.firstname} {a.lastname}</strong><br />{a.street.join(", ")}<br />{a.city}{a.region?.region ? `, ${a.region.region}` : ""} {a.postcode}<br />{name(a.country_code)}<br />{a.telephone}</p>
              <div className="std-form__actions">
                <button type="button" className="std-link" onClick={() => edit(a)}>Edit</button>
                <button type="button" className="std-link" onClick={() => remove(a.id)}>Delete</button>
              </div>
            </li>
          ))}
          <li><button type="button" className="std-card std-addresses__add" onClick={() => edit()}>+ Add an address</button></li>
        </ul>
      )}
    </>
  );
}

function Communications({ subscribed, act }: { subscribed: boolean; act: (p: Record<string, unknown>) => Promise<Msg> }) {
  const [on, setOn] = useState(subscribed);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(await act({ action: "newsletter", subscribed: on }));
    setBusy(false);
  }
  return (
    <form className="std-card std-stack" onSubmit={save}>
      <p>Stay on top of the latest arrivals, restocks and members-only offers.</p>
      <label className="std-check"><input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} /> Subscribe to our newsletter</label>
      <div><button type="submit" className="std-btn" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button></div>
      {msg ? <p className={`hd-msg ${msg.ok ? "hd-msg--ok" : "hd-msg--err"}`} role="status">{msg.text}</p> : null}
    </form>
  );
}

function Information({ customer, act }: { customer: Customer; act: (p: Record<string, unknown>) => Promise<Msg> }) {
  const [names, setNames] = useState({ firstname: customer.firstname, lastname: customer.lastname });
  const [pw, setPw] = useState({ current: "", next: "" });
  const [busy, setBusy] = useState<"profile" | "password" | null>(null);
  const [msg, setMsg] = useState<{ form: string; m: Msg }>({ form: "", m: null });
  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setBusy("profile");
    const m = await act({ action: "profile", ...names });
    setBusy(null);
    setMsg({ form: "profile", m });
    if (m?.ok) window.dispatchEvent(new Event("headora:auth-changed"));
  }
  async function savePassword(e: FormEvent) {
    e.preventDefault();
    setBusy("password");
    const m = await act({ action: "password", ...pw });
    setBusy(null);
    setMsg({ form: "password", m: m?.ok ? { ok: true, text: "Password changed." } : m });
    if (m?.ok) setPw({ current: "", next: "" });
  }
  const note = (form: string) => (msg.form === form && msg.m ? <p className={`hd-msg std-field--full ${msg.m.ok ? "hd-msg--ok" : "hd-msg--err"}`} role="status">{msg.m.text}</p> : null);
  return (
    <div className="std-stack">
      <form className="std-form std-card" onSubmit={saveProfile}>
        <h2 className="std-h3 std-field--full">Profile</h2>
        <label className="std-field">First name<input required autoComplete="given-name" value={names.firstname} onChange={(e) => setNames((n) => ({ ...n, firstname: e.target.value }))} /></label>
        <label className="std-field">Last name<input required autoComplete="family-name" value={names.lastname} onChange={(e) => setNames((n) => ({ ...n, lastname: e.target.value }))} /></label>
        <label className="std-field std-field--full">Email<input type="email" value={customer.email} readOnly disabled /></label>
        <div className="std-form__actions std-field--full"><button type="submit" className="std-btn" disabled={busy !== null}>{busy === "profile" ? "Saving…" : "Save changes"}</button></div>
        {note("profile")}
      </form>
      <form className="std-form std-card" onSubmit={savePassword}>
        <h2 className="std-h3 std-field--full">Change password</h2>
        <label className="std-field">Current password<input type="password" required autoComplete="current-password" value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} /></label>
        <label className="std-field">New password<input type="password" required minLength={8} autoComplete="new-password" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} /></label>
        <div className="std-form__actions std-field--full"><button type="submit" className="std-btn" disabled={busy !== null}>{busy === "password" ? "Saving…" : "Change password"}</button></div>
        {note("password")}
      </form>
    </div>
  );
}

function EmptyState({ text, locale }: { text: string; locale: string }) {
  return (
    <div className="std-card std-stack">
      <p>{text}</p>
      <div><a className="std-btn" href={`/${locale}`}>Start shopping</a></div>
    </div>
  );
}
