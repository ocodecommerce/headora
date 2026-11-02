import { magentoFetch } from "../../lib/magento.js";
import { PRODUCT_CARD_FRAGMENT } from "../../graphql/catalog.js";
import { getStdHome } from "../../lib/theme.js";
import { ProductCard, type CardProduct } from "../catalog/ProductCard.js";
import { optimized, srcSet } from "../../lib/img.js";
import { NewsletterForm } from "../layout/FooterClient.js";
import { HeroSlider } from "./HeroSlider.js";
import { ProductTabs } from "./ProductTabs.js";
import { ArrowIcon, UspIcon } from "./StdIcons.js";

type Cat = { uid: string; name: string; url_path: string; include_in_menu?: number; position?: number; product_count?: number };
const TABS = 3;
const PER_TAB = 8;

// One round trip: menu categories, then per category its first product photo (tile) and
// a product row (tabs). Works with any catalog, Venia sample data included.
const CATS_QUERY = `query StdCats { categoryList { children { uid name url_path include_in_menu position product_count } } }`;
const rowsQuery = (cats: Cat[]) => `${PRODUCT_CARD_FRAGMENT}
query StdRows($size: Int!) {
  all: products(search: "", pageSize: $size) { items { ...Card } }
  ${cats.map((c, i) => `c${i}: products(filter: { category_uid: { eq: ${JSON.stringify(c.uid)} } }, pageSize: $size) { items { ...Card } }`).join("\n  ")}
}`;

export async function StdHome({ locale }: { locale: string }) {
  const cfg = getStdHome();
  const tags = ["home", `locale:${locale}`];
  const tree = await magentoFetch<any>(CATS_QUERY, {}, { tags, revalidate: 300, locale }).catch(() => null);
  const cats: Cat[] = (tree?.categoryList?.[0]?.children ?? [])
    .filter((c: Cat) => c.include_in_menu !== 0 && (c.product_count ?? 1) > 0)
    .sort((a: Cat, b: Cat) => (a.position ?? 0) - (b.position ?? 0))
    .slice(0, 4);
  const rows = await magentoFetch<any>(rowsQuery(cats), { size: PER_TAB }, { tags, revalidate: 300, locale }).catch(() => null);
  const catHref = (c: Cat) => `/${locale}/${c.url_path}.html`;
  const fill = (h: string) => h.replace(/\{category:(\d+)\}/, (_, i) => (cats[+i] ? catHref(cats[+i]) : `/${locale}`)).replaceAll("{locale}", locale);
  const items = (k: string): CardProduct[] => rows?.[k]?.items ?? [];
  // Magento OS has no best-seller query: mix the categories' first products round-robin,
  // falling back to the unfiltered list when there are no menu categories.
  const perCat = cats.map((_, i) => items(`c${i}`));
  const mixed = Array.from({ length: PER_TAB }, (_, k) => perCat.map((l) => l[k])).flat().filter((p): p is CardProduct => !!p);
  const all = [...new Map((mixed.length ? mixed : items("all")).map((p) => [p.sku, p])).values()].slice(0, PER_TAB);
  const firstImage = (p?: CardProduct) => p?.image?.url && !p.image.url.includes("placeholder") ? p.image.url : p?.small_image?.url;
  const tabs = [{ label: "Best sellers", products: all }, ...cats.slice(0, TABS - 1).map((c, i) => ({ label: c.name, products: items(`c${i}`) }))]
    .filter((t) => t.products.length)
    .map((t) => ({ label: t.label, cards: t.products.map((p) => <ProductCard key={p.sku} product={p} locale={locale} actions optimize />) }));
  // Two pieces from different categories (last ones first: dresses + accessories in Venia).
  const lookProducts = [...perCat].reverse().map((l) => l[1] ?? l[0]).filter((p): p is CardProduct => !!p).slice(0, 2);

  return (
    <div className="std-home">
      <HeroSlider slides={cfg.slides.map((s) => ({ ...s, href: fill(s.href) }))} />

      <ul className="std-usps" aria-label="Why shop with us">
        {cfg.usps.map((u, i) => <li key={u}><UspIcon i={i} /><span>{u}</span></li>)}
      </ul>

      {cats.length ? (
        <section className="std-section std-wrap" aria-labelledby="std-cats">
          <div className="std-section__head">
            <h2 id="std-cats" className="std-h2">Shop by category</h2>
          </div>
          <ul className="std-cats">
            {cats.map((c, i) => {
              const img = firstImage(items(`c${i}`)[0]);
              return (
                <li key={c.uid}>
                  <a className="std-cat" href={catHref(c)}>
                    {img ? <img src={optimized(img, 640)} srcSet={srcSet(img)} sizes="(max-width: 900px) 50vw, 25vw" alt="" loading="lazy" /> : null}
                    <span className="std-cat__label">
                      <span><strong>{c.name}</strong>{c.product_count ? <small>{c.product_count} styles</small> : null}</span>
                      <ArrowIcon />
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {tabs.length ? (
        <section className="std-section std-wrap" aria-labelledby="std-top">
          <ProductTabs titleId="std-top" title="Top sellers" tabs={tabs} />
        </section>
      ) : null}

      <section className="std-section std-wrap std-look" aria-labelledby="std-look">
        <div className="std-look__media">
          <img src={cfg.look.image} alt={cfg.look.alt} loading="lazy" width="1440" height="804" />
        </div>
        <div className="std-look__body">
          <p className="std-eyebrow">{cfg.look.eyebrow}</p>
          <h2 id="std-look" className="std-h2">{cfg.look.title}</h2>
          <p className="std-lead">{cfg.look.text}</p>
          <ul className="std-look__items">
            {lookProducts.map((p) => <li key={p.sku}><ProductCard product={p} locale={locale} optimize /></li>)}
          </ul>
        </div>
      </section>

      <section className="std-news std-wrap" aria-labelledby="std-news">
        <div>
          <h2 id="std-news" className="std-h2">Get 10% off your first order</h2>
          <p className="std-lead">New arrivals, restocks and members-only offers. No spam, unsubscribe anytime.</p>
        </div>
        <NewsletterForm locale={locale} />
      </section>
    </div>
  );
}
