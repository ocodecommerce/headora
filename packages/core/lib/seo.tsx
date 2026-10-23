import { headers } from "next/headers";
import { getConfig } from "./config.js";

// Absolute origin for canonical/hreflang/OG/sitemap URLs: HEADORA_PUBLIC_URL when set, otherwise the
// host the request came in on (works behind nginx with X-Forwarded-*).
export async function siteUrl(): Promise<string> {
  const pub = getConfig().HEADORA_PUBLIC_URL.replace(/\/$/, "");
  if (pub) return pub;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

export function siteName(): string {
  return getConfig().HEADORA_SITE_NAME || "Store";
}

export function locales(): string[] {
  const c = getConfig();
  const list = (c.NEXT_PUBLIC_LOCALES || "").split(",").map((s) => s.trim()).filter(Boolean);
  return list.length ? list : [c.NEXT_PUBLIC_LOCALE];
}

// Canonical + hreflang for a path below the locale ("/carina-cardigan.html", "" for home).
// Every store view serves the same url keys here, so each locale gets the same path.
export function alternates(locale: string, path: string) {
  const all = locales();
  return {
    canonical: `/${locale}${path}`,
    languages: all.length > 1
      ? { ...Object.fromEntries(all.map((l) => [l, `/${l}${path}`])), "x-default": `/${all[0]}${path}` }
      : undefined,
  };
}

// Plain-text meta description from Magento HTML (descriptions are often PageBuilder markup).
export function describe(...candidates: (string | null | undefined)[]): string | undefined {
  for (const c of candidates) {
    const text = (c ?? "").replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/gi, " ").replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
    if (text) return text.length > 160 ? `${text.slice(0, 157).replace(/\s+\S*$/, "")}…` : text;
  }
  return undefined;
}

// schema.org JSON-LD; "<" escaped so product text can't close the script tag.
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function breadcrumbLd(base: string, crumbs: { label: string; href?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, ...(c.href ? { item: `${base}${c.href}` } : {}) })),
  };
}
