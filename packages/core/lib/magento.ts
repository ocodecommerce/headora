import { getConfig } from "./config.js";
export async function magentoFetch<T>(query: string, variables = {}, opts: { tags?: string[]; revalidate?: number } = {}): Promise<T> {
  const c = getConfig();
  const res = await fetch(c.MAGENTO_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Store: c.NEXT_PUBLIC_STORE,
      "Currency": c.NEXT_PUBLIC_CURRENCY,
    },
    body: JSON.stringify({ query, variables }),
    next: { tags: opts.tags ?? ["magento"], revalidate: opts.revalidate ?? 120 },
  });
  if (!res.ok) throw new Error(`Magento GraphQL ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data as T;
}
export const URL_RESOLVE_QUERY = `query Resolve($url: String!){ urlResolver(url:$url){ id relative_url type } }`;
