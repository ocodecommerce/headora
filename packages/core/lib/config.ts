import { z } from "zod";
const schema = z.object({
  MAGENTO_GRAPHQL_URL: z.string().url(),
  NEXT_PUBLIC_STORE: z.string().default("default"),
  NEXT_PUBLIC_LOCALE: z.string().default("en"),
  NEXT_PUBLIC_CURRENCY: z.string().default("USD"),
  NEXT_PUBLIC_STORES: z.string().default(""),
  NEXT_PUBLIC_LOCALES: z.string().default(""),
  NEXT_PUBLIC_CURRENCIES: z.string().default(""),
  CHECKOUT_STRATEGY: z.enum(["native-magento"]).default("native-magento"),
  MAGENTO_BASE_URL: z.string().url(),
  HEADORA_PRESET: z.enum(["minimal", "bold", "classic"]).default("minimal"),
  REVALIDATE_SECRET: z.string().min(8),
  COMMERCE_FEATURES: z.enum(["os", "adobe"]).default("os"),
  HEADORA_SITE_NAME: z.string().default(""),
  HEADORA_COPYRIGHT: z.string().default(""),
  HEADORA_SOCIAL_LINKS: z.string().default(""),
  HEADORA_PUBLIC_URL: z.string().default(""),
});
export type HeadoraConfig = z.infer<typeof schema>;
export function getConfig(): HeadoraConfig {
  return schema.parse({
    MAGENTO_GRAPHQL_URL: process.env.MAGENTO_GRAPHQL_URL,
    NEXT_PUBLIC_STORE: process.env.NEXT_PUBLIC_STORE,
    NEXT_PUBLIC_LOCALE: process.env.NEXT_PUBLIC_LOCALE,
    NEXT_PUBLIC_CURRENCY: process.env.NEXT_PUBLIC_CURRENCY,
    NEXT_PUBLIC_STORES: process.env.NEXT_PUBLIC_STORES,
    NEXT_PUBLIC_LOCALES: process.env.NEXT_PUBLIC_LOCALES,
    NEXT_PUBLIC_CURRENCIES: process.env.NEXT_PUBLIC_CURRENCIES,
    CHECKOUT_STRATEGY: process.env.CHECKOUT_STRATEGY,
    MAGENTO_BASE_URL: process.env.MAGENTO_BASE_URL,
    HEADORA_PRESET: process.env.HEADORA_PRESET,
    REVALIDATE_SECRET: process.env.REVALIDATE_SECRET,
    COMMERCE_FEATURES: process.env.COMMERCE_FEATURES,
    HEADORA_SITE_NAME: process.env.HEADORA_SITE_NAME,
    HEADORA_COPYRIGHT: process.env.HEADORA_COPYRIGHT,
    HEADORA_SOCIAL_LINKS: process.env.HEADORA_SOCIAL_LINKS,
    HEADORA_PUBLIC_URL: process.env.HEADORA_PUBLIC_URL,
  });
}
// Prefix for links to pages only Magento serves (order history, contact form, native search).
// When the storefront is published on the same host as Magento (nginx routes those paths to
// Magento), links stay relative so shoppers never see another domain. Otherwise (e.g. local
// dev on localhost:3005) they must point at MAGENTO_BASE_URL.
export function magentoLinkBase(): string {
  const c = getConfig();
  const base = c.MAGENTO_BASE_URL.replace(/\/$/, "");
  try {
    if (c.HEADORA_PUBLIC_URL && new URL(c.HEADORA_PUBLIC_URL).host === new URL(base).host) return "";
  } catch { /* fall through to absolute */ }
  return base;
}
// locale -> { store, currency }. Falls back to defaults when lists unset.
export function storeForLocale(locale?: string): { store: string; currency: string } {
  const c = getConfig();
  const stores = (c.NEXT_PUBLIC_STORES || "").split(",").map((s) => s.trim()).filter(Boolean);
  const locales = (c.NEXT_PUBLIC_LOCALES || "").split(",").map((s) => s.trim()).filter(Boolean);
  const currencies = (c.NEXT_PUBLIC_CURRENCIES || "").split(",").map((s) => s.trim()).filter(Boolean);
  const i = locales.indexOf(locale ?? c.NEXT_PUBLIC_LOCALE);
  if (i >= 0 && stores[i]) return { store: stores[i], currency: currencies[i] ?? c.NEXT_PUBLIC_CURRENCY };
  return { store: c.NEXT_PUBLIC_STORE, currency: c.NEXT_PUBLIC_CURRENCY };
}
// store <-> locale pairs from NEXT_PUBLIC_STORES / NEXT_PUBLIC_LOCALES (store switcher).
export function storeLocalePairs(): { store: string; locale: string }[] {
  const c = getConfig();
  const stores = (c.NEXT_PUBLIC_STORES || "").split(",").map((s) => s.trim()).filter(Boolean);
  const locales = (c.NEXT_PUBLIC_LOCALES || "").split(",").map((s) => s.trim()).filter(Boolean);
  return stores.map((store, i) => ({ store, locale: locales[i] })).filter((p) => p.locale);
}
