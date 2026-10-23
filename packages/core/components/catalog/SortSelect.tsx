"use client";
import { SORTS, type SortKey } from "../../lib/plp.js";

// Navigates on change; the hrefs are precomputed on the server (filters kept, page reset).
export function SortSelect({ value, hrefs }: { value: SortKey; hrefs: Record<SortKey, string> }) {
  return (
    <label className="hd-sort">
      <span className="hd-visually-hidden">Sort by</span>
      <select value={value} onChange={(e) => window.location.assign(hrefs[e.target.value as SortKey])}>
        {(Object.keys(SORTS) as SortKey[]).map((k) => (
          <option key={k} value={k}>Sort By: {SORTS[k].label}</option>
        ))}
      </select>
    </label>
  );
}
