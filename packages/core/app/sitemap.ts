import type { MetadataRoute } from "next";
import { magentoFetch } from "../lib/magento.js";
import { SITEMAP_CATEGORIES_QUERY, SITEMAP_PRODUCTS_QUERY } from "../graphql/catalog.js";
import { locales, siteUrl } from "../lib/seo.js";

type Cat = { url_path?: string | null; updated_at?: string | null; children?: Cat[] };
// Magento dates are "YYYY-MM-DD HH:MM:SS" in UTC.
const date = (s?: string | null) => (s ? new Date(`${s.replace(" ", "T")}Z`) : undefined);
// ponytail: one sitemap capped at 100 product pages (30k URLs, under the 50k limit); split into a
// sitemap index (generateSitemaps) if a catalog outgrows it.
const MAX_PRODUCT_PAGES = 100;

// /sitemap.xml: homepage, every category and every visible product, for each store view locale.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await siteUrl();
  const out: MetadataRoute.Sitemap = [];
  for (const locale of locales()) {
    const opts = { tags: ["sitemap", `locale:${locale}`], revalidate: 3600, locale };
    out.push({ url: `${base}/${locale}`, changeFrequency: "daily", priority: 1 });

    const cats = await magentoFetch<{ categoryList: Cat[] }>(SITEMAP_CATEGORIES_QUERY, {}, opts).catch(() => null);
    const walk = (list: Cat[] = []): void => list.forEach((c) => {
      if (c.url_path) out.push({ url: `${base}/${locale}/${c.url_path}.html`, lastModified: date(c.updated_at), changeFrequency: "daily", priority: 0.8 });
      walk(c.children);
    });
    walk(cats?.categoryList?.[0]?.children);

    for (let page = 1, pages = 1; page <= Math.min(pages, MAX_PRODUCT_PAGES); page++) {
      const res = await magentoFetch<any>(SITEMAP_PRODUCTS_QUERY, { page }, opts).catch(() => null);
      if (!res) break;
      pages = res.products?.page_info?.total_pages ?? 1;
      for (const p of res.products?.items ?? []) {
        if (p?.url_key) out.push({ url: `${base}/${locale}/${p.url_key}.html`, lastModified: date(p.updated_at), changeFrequency: "weekly", priority: 0.6 });
      }
    }
  }
  return out;
}
