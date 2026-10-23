"use client";
import { useEffect, useState } from "react";
import { readCompare, writeCompare, type CompareItem } from "./compareStore.js";

export const CompareIcon = () => (
  <svg width="22" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <line x1="4" y1="21" x2="20" y2="21" /><line x1="7" y1="17" x2="7" y2="11" /><line x1="12" y1="17" x2="12" y2="5" /><line x1="17" y1="17" x2="17" y2="9" />
  </svg>
);

// PDP "Add To Compare" (legacy: adds once, then reads "Already in Compare" and greys out).
export function CompareButton({ product }: { product: CompareItem }) {
  const [inList, setInList] = useState(false);
  useEffect(() => {
    const sync = () => setInList(readCompare().some((i) => i.id === product.id));
    sync();
    window.addEventListener("headora:compare", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("headora:compare", sync); window.removeEventListener("storage", sync); };
  }, [product.id]);

  return (
    <button type="button" className="hd-pdp__fav hd-pdp__compare" disabled={inList} aria-pressed={inList}
      onClick={() => { const items = readCompare(); if (!items.some((i) => i.id === product.id)) writeCompare([...items, product]); }}>
      <CompareIcon />
      {inList ? "Already in Compare" : "Add To Compare"}
    </button>
  );
}
