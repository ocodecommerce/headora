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
  REVALIDATE_SECRET: z.string().min(8),
  COMMERCE_FEATURES: z.enum(["os", "adobe"]).default("os"),
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
    REVALIDATE_SECRET: process.env.REVALIDATE_SECRET,
    COMMERCE_FEATURES: process.env.COMMERCE_FEATURES,
  });
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
