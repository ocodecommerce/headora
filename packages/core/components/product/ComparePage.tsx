"use client";
import { useEffect, useState } from "react";
import { readCompare, writeCompare, type CompareItem } from "./compareStore.js";

// Legacy /compare page: a table of the products saved with "Add To Compare".
export function ComparePage({ locale }: { locale: string }) {
  const [items, setItems] = useState<CompareItem[] | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const sync = () => setItems(readCompare());
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const notify = (text: string) => { setToast(text); setTimeout(() => setToast(""), 3000); };
  const remove = (id: string) => { const next = (items ?? []).filter((i) => i.id !== id); writeCompare(next); setItems(next); notify("Product removed from comparison"); };
  const clear = () => { writeCompare([]); setItems([]); notify("Comparison cleared"); };
  const price = (i: CompareItem) => {
    try { return new Intl.NumberFormat(locale, { style: "currency", currency: i.currency || "USD" }).format(Number(i.price ?? 0)); }
    catch { return `$${Number(i.price ?? 0).toFixed(2)}`; }
  };
  const html = (d: CompareItem["description"]) => (typeof d === "string" ? d : d?.html ?? "");

  if (items === null) return null;
  if (!items.length) {
    return (
      <div className="hd-compare__empty">
        <h1>No products to compare</h1>
        <p>You haven&apos;t added any products to compare yet.</p>
        <a href={`/${locale}`} className="hd-compare__btn">Browse Products</a>
      </div>
    );
  }
  return (
    <div className="hd-compare">
      {toast ? <div className="hd-compare__toast" role="status">{toast}</div> : null}
      <div className="hd-compare__head">
        <div><h1>Compare Products</h1><p>{items.length} items</p></div>
        <button type="button" className="hd-compare__clear" onClick={clear}>Clear All</button>
      </div>
      <div className="hd-compare__wrap">
        <table className="hd-compare__table">
          <thead>
            <tr>
              <th className="hd-compare__attr">Attributes</th>
              {items.map((p) => (
                <th key={p.id} className="hd-compare__col">
                  <div className="hd-compare__card">
                    <button type="button" className="hd-compare__remove" aria-label={`Remove ${p.name}`} onClick={() => remove(p.id)}>✕</button>
                    {p.image ? <img src={p.image} alt={p.name} width={220} height={220} /> : null}
                    <a href={`/${locale}/${p.url_key}.html`} className="hd-compare__name">{p.name}</a>
                    <div className="hd-compare__price">{price(p)}</div>
                    <a href={`/${locale}/${p.url_key}.html`} className="hd-compare__atc">Add to Cart</a>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr><td className="hd-compare__attr">SKU</td>{items.map((p) => <td key={p.id}>{p.sku}</td>)}</tr>
            <tr>
              <td className="hd-compare__attr">Rating</td>
              {items.map((p) => <td key={p.id}><div className="hd-compare__stars">★★★★☆</div><small>(No reviews yet)</small></td>)}
            </tr>
            <tr>
              <td className="hd-compare__attr">Description</td>
              {items.map((p) => <td key={p.id} className="hd-compare__desc" dangerouslySetInnerHTML={{ __html: html(p.description) }} />)}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="hd-compare__foot"><a href={`/${locale}`} className="hd-compare__btn">Continue Shopping</a></div>
    </div>
  );
}
