"use client";
import { useEffect, useState } from "react";
import { money } from "../catalog/ProductCard.js";

type Money = { value: number; currency: string };
export type BundleSelection = {
  uid: string; label: string; quantity: number; is_default: boolean; can_change_quantity: boolean; position?: number | null;
  price?: number | null; price_type?: string | null;
  product?: { stock_status?: string | null; price_range?: { minimum_price?: { final_price?: Money | null } | null } | null } | null;
};
export type BundleItem = { uid: string; title: string; required: boolean; type: string; position?: number | null; options: BundleSelection[] };
export type BundleState = { uids: string[]; missing: string[]; total: Money | null };

// Venia has no bundle UI ("unavailable for purchase") and legacy posts the bare SKU, which Magento
// rejects ("Please specify product option(s)"). This is Luma's form: radio / drop-down pick one,
// checkbox / multi pick several, and a qty box where the selection allows it. Magento takes the
// selection uids (base64 "bundle/<option>/<selection>/<qty>") in addProductsToCart.
const single = (t: string) => t === "radio" || t === "select" || t === "drop-down";
const withQty = (uid: string, qty: number) => {
  const parts = atob(uid).split("/");
  parts[3] = String(qty);
  return btoa(parts.join("/"));
};

export function BundleOptions({ items, dynamic, locale, onChange }: {
  items: BundleItem[]; dynamic: boolean; locale: string; onChange: (s: BundleState) => void;
}) {
  const sorted = [...items].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const [sel, setSel] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(sorted.map((i) => [i.uid, i.options.filter((o) => o.is_default).slice(0, single(i.type) ? 1 : undefined).map((o) => o.uid)])));
  const [qty, setQty] = useState<Record<string, number>>(() =>
    Object.fromEntries(sorted.flatMap((i) => i.options.map((o) => [o.uid, o.quantity || 1]))));

  // Dynamic bundles cost the sum of the chosen products; fixed ones add each selection's FIXED price
  // (ponytail: PERCENT selections are left out of the preview, the cart total is still exact).
  const unit = (o: BundleSelection) => dynamic ? o.product?.price_range?.minimum_price?.final_price?.value ?? 0 : o.price_type === "FIXED" ? o.price ?? 0 : 0;
  const currency = sorted[0]?.options[0]?.product?.price_range?.minimum_price?.final_price?.currency ?? "USD";

  useEffect(() => {
    const chosen = sorted.flatMap((i) => i.options.filter((o) => sel[i.uid]?.includes(o.uid)));
    onChange({
      uids: chosen.map((o) => withQty(o.uid, qty[o.uid] ?? 1)),
      missing: sorted.filter((i) => i.required && !sel[i.uid]?.length).map((i) => i.title),
      total: { value: chosen.reduce((sum, o) => sum + unit(o) * (qty[o.uid] ?? 1), 0), currency },
    });
  }, [sel, qty]); // eslint-disable-line react-hooks/exhaustive-deps

  const label = (o: BundleSelection) => {
    const p = unit(o);
    return `${o.quantity > 1 && !o.can_change_quantity ? `${o.quantity} x ` : ""}${o.label}${p ? ` +${money({ value: p, currency }, locale)}` : ""}`;
  };
  const pickOne = (item: BundleItem, uid: string) => setSel((s) => ({ ...s, [item.uid]: uid ? [uid] : [] }));
  const toggle = (item: BundleItem, uid: string) =>
    setSel((s) => ({ ...s, [item.uid]: s[item.uid]?.includes(uid) ? s[item.uid].filter((u) => u !== uid) : [...(s[item.uid] ?? []), uid] }));

  return (
    <div className="hd-bundle">
      {sorted.map((item) => {
        const id = `hd-bundle-${item.uid}`;
        const opts = [...item.options].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        const current = opts.find((o) => o.uid === sel[item.uid]?.[0]);
        const out = (o: BundleSelection) => o.product?.stock_status === "OUT_OF_STOCK";
        return (
          <fieldset key={item.uid} className="hd-opt hd-bundle__item">
            <legend className="hd-opt__label">{item.title}{item.required ? <span className="hd-bundle__req" aria-label="required"> *</span> : null}</legend>
            {item.type === "select" || item.type === "drop-down" ? (
              <select id={id} className="hd-bundle__select" value={current?.uid ?? ""} onChange={(e) => pickOne(item, e.target.value)}>
                <option value="">{item.required ? "Choose a selection…" : "None"}</option>
                {opts.map((o) => <option key={o.uid} value={o.uid} disabled={out(o)}>{label(o)}</option>)}
              </select>
            ) : (
              <ul className="hd-bundle__list">
                {single(item.type) && !item.required ? (
                  <li><label><input type="radio" name={id} checked={!current} onChange={() => pickOne(item, "")} /> None</label></li>
                ) : null}
                {opts.map((o) => (
                  <li key={o.uid}>
                    <label>
                      <input type={single(item.type) ? "radio" : "checkbox"} name={id} disabled={out(o)} checked={sel[item.uid]?.includes(o.uid) ?? false}
                        onChange={() => (single(item.type) ? pickOne(item, o.uid) : toggle(item, o.uid))} />
                      {" "}{label(o)}
                    </label>
                  </li>
                ))}
              </ul>
            )}
            {single(item.type) && current?.can_change_quantity ? (
              <label className="hd-bundle__qty">Quantity
                <input type="number" min={1} max={999} value={qty[current.uid] ?? 1}
                  onChange={(e) => setQty((q) => ({ ...q, [current.uid]: Math.min(999, Math.max(1, Math.floor(Number(e.target.value)) || 1)) }))} />
              </label>
            ) : null}
          </fieldset>
        );
      })}
    </div>
  );
}
