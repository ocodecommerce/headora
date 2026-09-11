import { z } from "zod";
const schema = z.object({
  MAGENTO_GRAPHQL_URL: z.string().url(),
  NEXT_PUBLIC_STORE: z.string().default("default"),
  NEXT_PUBLIC_LOCALE: z.string().default("en"),
  NEXT_PUBLIC_CURRENCY: z.string().default("USD"),
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
    CHECKOUT_STRATEGY: process.env.CHECKOUT_STRATEGY,
    MAGENTO_BASE_URL: process.env.MAGENTO_BASE_URL,
    REVALIDATE_SECRET: process.env.REVALIDATE_SECRET,
    COMMERCE_FEATURES: process.env.COMMERCE_FEATURES,
  });
}
