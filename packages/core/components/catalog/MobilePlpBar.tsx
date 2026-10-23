"use client";
import { useEffect, useState } from "react";
import type { SortKey } from "../../lib/plp.js";

// Legacy phone-width listing bar: centred count, FILTER BY / SORT BY pills.
// FILTER BY slides the filter column in from the left (CSS keys off html.hd-filters-open);
// SORT BY opens an inline "Sort By" panel of sort links.
const SORT_LABELS: [SortKey, string][] = [
  ["price_desc", "Price: High to Low"],
  ["price_asc", "Price: Low to High"],
  ["name_asc", "Product Name: (A to Z)"],
  ["name_desc", "Product Name: (Z to A)"],
  ["position", "Default"],
];

export function MobilePlpBar({ total, sort, hrefs }: { total: number; sort: SortKey; hrefs: Record<SortKey, string> }) {
  const [filters, setFilters] = useState(false);
  const [sorting, setSorting] = useState(false);

  // Picking a filter reloads the page; legacy keeps the drawer open, so remember it for this path.
  useEffect(() => {
    try { if (sessionStorage.getItem("hd-filters-open") === location.pathname) setFilters(true); } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("hd-filters-open", filters);
    try { if (filters) sessionStorage.setItem("hd-filters-open", location.pathname); else sessionStorage.removeItem("hd-filters-open"); } catch {}
    return () => document.documentElement.classList.remove("hd-filters-open");
  }, [filters]);

  return (
    <div className="hd-mbar">
      <p className="hd-mbar__count">{total} Results</p>
      <div className="hd-mbar__pills">
        <button type="button" onClick={() => { setFilters(true); setSorting(false); }}>Filter By</button>
        <button type="button" aria-expanded={sorting} onClick={() => setSorting((s) => !s)}>Sort By</button>
      </div>
      {filters ? <div className="hd-mbar__overlay" onClick={() => setFilters(false)} /> : null}
      {sorting ? (
        <div className="hd-mbar__sort">
          <div className="hd-mbar__sort-head">
            <h2>Sort By</h2>
            <button type="button" aria-label="Close sort options" onClick={() => setSorting(false)}>×</button>
          </div>
          <ul>
            {SORT_LABELS.map(([k, label]) => (
              <li key={k}>
                <a href={hrefs[k]} aria-current={k === sort && k !== "position" ? "true" : undefined}>
                  <span className="hd-mbar__box" aria-hidden="true" />{label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
