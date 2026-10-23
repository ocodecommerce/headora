"use client";
import { useState } from "react";

// Legacy storefront price filter: two-thumb slider between the lowest and highest price.
// Releasing a thumb loads ?price=<from>_<to> (page reset) through FiltersPanel's in-place navigation.
export function PriceSlider({ min, max, from, to, baseHref, symbol }: {
  min: number; max: number; from: number; to: number; baseHref: string; symbol: string;
}) {
  const [range, setRange] = useState<[number, number]>([from, to]);
  const step = Math.max(1, Math.round((max - min) / 10));
  const pct = (v: number) => (max > min ? ((v - min) / (max - min)) * 100 : 0);
  const apply = () => {
    const url = new URL(baseHref, window.location.origin);
    url.searchParams.delete("page");
    if (range[0] <= min && range[1] >= max) url.searchParams.delete("price");
    else url.searchParams.set("price", `${range[0]}_${range[1]}`);
    window.dispatchEvent(new CustomEvent("headora:filter-nav", { detail: url.pathname + url.search }));
  };
  const set = (i: 0 | 1, v: number) =>
    setRange(([lo, hi]) => (i === 0 ? [Math.min(v, hi), hi] : [lo, Math.max(v, lo)]));

  return (
    <div className="hd-price-slider">
      <div className="hd-price-slider__labels">
        <span>{symbol}{range[0]}</span>
        <span>{symbol}{range[1]}</span>
      </div>
      <div className="hd-price-slider__track"
        style={{ background: `linear-gradient(to right, #ddd 0%, #ddd ${pct(range[0])}%, #1979c3 ${pct(range[0])}%, #1979c3 ${pct(range[1])}%, #ddd ${pct(range[1])}%, #ddd 100%)` }}>
        {([0, 1] as const).map((i) => (
          <input key={i} type="range" min={min} max={max} step={step} value={range[i]}
            aria-label={i === 0 ? "Minimum price" : "Maximum price"}
            onChange={(e) => set(i, Number(e.target.value))} onPointerUp={apply} onKeyUp={apply} />
        ))}
      </div>
    </div>
  );
}
