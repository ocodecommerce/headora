import type { MetadataRoute } from "next";
import { locales, siteUrl } from "../lib/seo.js";
import { BASE } from "../lib/base.js";

// /robots.txt: crawl the storefront, skip API routes and the noindex search/compare pages.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await siteUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: [`${BASE}/api/`, ...locales().flatMap((l) => [`${BASE}/${l}/search`, `${BASE}/${l}/compare`])] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
