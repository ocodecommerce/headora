import type { MetadataRoute } from "next";
import { locales, siteUrl } from "../lib/seo.js";
import { BASE, lp } from "../lib/base.js";

// /robots.txt: crawl the storefront, skip API routes and the noindex search/compare pages.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await siteUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: [`${BASE}/api/`, ...locales().flatMap((l) => [`${lp(l)}/search`, `${lp(l)}/compare`])] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
