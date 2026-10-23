import { plpHref, toggle, type Facet, type SortKey } from "../../lib/plp.js";
import { FiltersPanel } from "./FiltersPanel.js";
import { PriceSlider } from "./PriceSlider.js";

const SHOWN = 5;

// Layered navigation sidebar. Plain links (no JS): each option toggles itself in the URL.
// Matches the legacy storefront: groups in reverse Magento order, the first 3 open
// (plus any with a selection), no option counts.
export function Filters({
  path, facets, selected, sort, priceLabel, currencySymbol = "$",
}: {
  path: string;
  facets: Facet[];
  selected: Record<string, string[]>;
  sort: SortKey;
  priceLabel: (value: string, label: string) => string;
  currencySymbol?: string;
}) {
  if (!facets.length) return null;
  const active = Object.entries(selected).flatMap(([code, values]) => {
    const f = facets.find((x) => x.attribute_code === code);
    return values.map((v) => ({ code, value: v, label: f?.options.find((o) => o.value === v)?.label ?? v, facet: f?.label ?? code }));
  });
  const optionLabel = (f: Facet, o: Facet["options"][number]) => (f.attribute_code === "price" ? priceLabel(o.value, o.label) : o.label);

  // Legacy shows 5 options then "Show More" / "Show Less" below the list. A hidden checkbox
  // toggles the extras so it works without JS; the phone drawer shows every option.
  const list = (f: Facet) => {
    const extra = f.options.length > SHOWN;
    const id = `hd-more-${f.attribute_code}`;
    return (
      <>
        {extra ? <input type="checkbox" id={id} className="hd-filter__more-toggle" hidden
          defaultChecked={f.options.slice(SHOWN).some((o) => selected[f.attribute_code]?.includes(o.value))} /> : null}
        <ul className="hd-filter__options">
          {f.options.map((o, i) => {
            const on = selected[f.attribute_code]?.includes(o.value) ?? false;
            return (
              <li key={o.value} className={i >= SHOWN ? "hd-filter__extra" : undefined}>
                <a href={plpHref(path, { selected: toggle(selected, f.attribute_code, o.value), sort })}
                  className="hd-filter__option" aria-current={on ? "true" : undefined} rel="nofollow">
                  <span className="hd-check" aria-hidden="true" />
                  <span>{optionLabel(f, o)}</span>
                  {on ? <span className="hd-visually-hidden">(selected)</span> : null}
                </a>
              </li>
            );
          })}
        </ul>
        {extra ? <label htmlFor={id} className="hd-filter__more" /> : null}
      </>
    );
  };

  // Bounds come from Magento's price buckets ("10_20", "20_30" -> 10..30).
  const priceSlider = (f: Facet) => {
    const nums = f.options.flatMap((o) => o.value.split("_")).map(Number).filter((n) => Number.isFinite(n) && String(n) !== "");
    if (!nums.length) return null;
    const min = Math.floor(Math.min(...nums)), max = Math.ceil(Math.max(...nums));
    const [from, to] = selected.price?.[0]?.split("_").map(Number) ?? [min, max];
    const rest = { ...selected };
    delete rest.price;
    return <PriceSlider key={selected.price?.[0] ?? "all"} min={min} max={max} from={Math.max(min, from)} to={Math.min(max, to)}
      baseHref={plpHref(path, { selected: rest, sort })} symbol={currencySymbol} />;
  };

  return (
    <FiltersPanel hasActive={active.length > 0}>
      <summary className="hd-filters__title"><span>Filters</span></summary>
      {active.length ? (
        <ul className="hd-filters__active">
          {active.map((a) => (
            <li key={`${a.code}:${a.value}`}>
              {/* legacy chip: "╳ Gold" on desktop, "× Fashion Color: Gold" in the phone drawer */}
              <a href={plpHref(path, { selected: toggle(selected, a.code, a.value), sort })} rel="nofollow"
                aria-label={`Remove ${a.facet}: ${a.label}`}>
                <span className="hd-chip__x" aria-hidden="true" />
                <span className="hd-chip__facet">{a.facet}:</span>
                {a.code === "price" ? priceLabel(a.value, a.label) : a.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      {[...facets].reverse().map((f, i) => (
        <details key={f.attribute_code} className="hd-filter" data-active={selected[f.attribute_code]?.length ? "true" : undefined}
          open={i < 3 || Boolean(selected[f.attribute_code]?.length)}>
          <summary className="hd-filter__title">{f.label}</summary>
          {f.attribute_code === "price" ? priceSlider(f) : list(f)}
        </details>
      ))}
    </FiltersPanel>
  );
}
