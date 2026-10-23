import { CardActions } from "./CardActions.js";

type Money = { value: number | null; currency: string | null };
export type CardProduct = {
  sku: string;
  name: string;
  url_key: string;
  __typename?: string;
  stock_status?: string | null;
  price_range?: { minimum_price?: { regular_price?: Money; final_price?: Money } };
  small_image?: { url: string; label?: string | null };
};

// Explicit locale: Intl with `undefined` resolves to the server locale during SSR and the
// browser locale on the client (en-US vs en-GB renders "$48.00" vs "US$48.00") -> hydration mismatch.
// `trim` drops ".00" on whole amounts ("$98"), as the legacy product cards did.
export function money(m: Money | null | undefined, locale: string, trim = false) {
  if (!m || m.value == null) return null;
  try {
    const whole = trim && Number.isInteger(m.value);
    return new Intl.NumberFormat(locale, { style: "currency", currency: m.currency ?? "USD", ...(whole ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : {}) }).format(m.value);
  } catch {
    return `${m.value}`;
  }
}

export function Price({ range, locale, trim = false }: { range?: CardProduct["price_range"]; locale: string; trim?: boolean }) {
  const regular = range?.minimum_price?.regular_price;
  const final = range?.minimum_price?.final_price;
  const onSale = regular?.value != null && final?.value != null && final.value < regular.value;
  if (onSale) {
    return (
      <>
        <span className="hd-card__was">{money(regular, locale, trim)}</span>
        <span className="hd-card__sale">{money(final, locale, trim)}</span>
      </>
    );
  }
  return <>{money(final, locale, trim) ?? money(regular, locale, trim)}</>;
}

export function ProductCard({ product: p, locale, actions = false }: { product: CardProduct; locale: string; actions?: boolean }) {
  const href = `/${locale}/${p.url_key}.html`;
  return (
    <div className="hd-card">
      <a href={href}>
        {p.small_image?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="hd-card__img" src={p.small_image.url} alt={p.small_image.label ?? p.name} loading="lazy" />
        ) : (
          <div className="hd-card__img" />
        )}
        <span className="hd-card__name">{p.name}</span>
        <span className="hd-card__price"><Price range={p.price_range} locale={locale} trim={actions} /></span>
      </a>
      {actions ? (
        <CardActions sku={p.sku} typename={p.__typename} href={href} inStock={p.stock_status !== "OUT_OF_STOCK"} locale={locale} />
      ) : null}
    </div>
  );
}
