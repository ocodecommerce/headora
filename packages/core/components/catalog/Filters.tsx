import { plpHref, toggle, type Facet, type SortKey } from "../../lib/plp.js";
import { FiltersPanel } from "./FiltersPanel.js";

const SHOWN = 5;

// Layered navigation sidebar. Plain links (no JS): each option toggles itself in the URL.
export function Filters({
  path, facets, selected, sort, priceLabel,
}: {
  path: string;
  facets: Facet[];
  selected: Record<string, string[]>;
  sort: SortKey;
  priceLabel: (value: string, label: string) => string;
}) {
  if (!facets.length) return null;
  const active = Object.entries(selected).flatMap(([code, values]) => {
    const f = facets.find((x) => x.attribute_code === code);
    return values.map((v) => ({ code, value: v, label: f?.options.find((o) => o.value === v)?.label ?? v, facet: f?.label ?? code }));
  });
  const optionLabel = (f: Facet, o: Facet["options"][number]) => (f.attribute_code === "price" ? priceLabel(o.value, o.label) : o.label);

  const list = (f: Facet, options: Facet["options"]) => (
    <ul className="hd-filter__options">
      {options.map((o) => {
        const on = selected[f.attribute_code]?.includes(o.value) ?? false;
        return (
          <li key={o.value}>
            <a href={plpHref(path, { selected: toggle(selected, f.attribute_code, o.value), sort })}
              className="hd-filter__option" aria-current={on ? "true" : undefined} rel="nofollow">
              <span className="hd-check" aria-hidden="true" />
              <span>{optionLabel(f, o)}</span>
              <span className="hd-filter__count">{o.count}</span>
              {on ? <span className="hd-visually-hidden">(selected)</span> : null}
            </a>
          </li>
        );
      })}
    </ul>
  );

  return (
    <FiltersPanel hasActive={active.length > 0}>
      <summary className="hd-filters__title">Filters</summary>
      {active.length ? (
        <div className="hd-filters__active">
          <ul>
            {active.map((a) => (
              <li key={`${a.code}:${a.value}`}>
                <a href={plpHref(path, { selected: toggle(selected, a.code, a.value), sort })} rel="nofollow"
                  aria-label={`Remove ${a.facet}: ${a.label}`}>
                  {a.code === "price" ? priceLabel(a.value, a.label) : a.label} ×
                </a>
              </li>
            ))}
          </ul>
          <a className="hd-filters__clear" href={plpHref(path, { selected: {}, sort })} rel="nofollow">Clear all</a>
        </div>
      ) : null}
      {facets.map((f) => (
        <details key={f.attribute_code} className="hd-filter" open>
          <summary className="hd-filter__title">{f.label}</summary>
          {list(f, f.options.slice(0, SHOWN))}
          {f.options.length > SHOWN ? (
            <details className="hd-filter__more" open={f.options.slice(SHOWN).some((o) => selected[f.attribute_code]?.includes(o.value))}>
              <summary>Show more</summary>
              {list(f, f.options.slice(SHOWN))}
            </details>
          ) : null}
        </details>
      ))}
    </FiltersPanel>
  );
}
