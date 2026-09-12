import { magentoFetch } from "./magento.js";
import { STORES_QUERY } from "../graphql/catalog.js";
export async function getStores() {
  return magentoFetch<{ storeConfig: any; availableStores: any[] }>(STORES_QUERY, {}, { tags: ["stores"], revalidate: 3600 });
}
