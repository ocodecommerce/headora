import { getConfig, storeForLocale } from "./config.js";
export { getConfig, storeForLocale };
export async function magentoFetch<T>(query: string, variables = {}, opts: { tags?: string[]; revalidate?: number; store?: string; currency?: string; locale?: string } = {}): Promise<T> {
  const c = getConfig();
  const mapped = opts.locale ? storeForLocale(opts.locale) : { store: c.NEXT_PUBLIC_STORE, currency: c.NEXT_PUBLIC_CURRENCY };
  const store = opts.store ?? mapped.store;
  const currency = opts.currency ?? mapped.currency;
  let res: Response;
  try {
    res = await fetch(c.MAGENTO_GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Store: store, Currency: currency },
      body: JSON.stringify({ query, variables }),
      next: { tags: opts.tags ?? ["magento"], revalidate: opts.revalidate ?? 120 },
    });
  } catch (e: any) {
    throw new Error(`Magento unreachable: ${e.message}`);
  }
  if (!res.ok) throw new Error(`Magento GraphQL ${res.status}`);
  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { throw new Error("Magento non-JSON response"); }
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data as T;
}
export const URL_RESOLVE_QUERY = `query Resolve($url: String!){ urlResolver(url:$url){ id relative_url type } }`;
