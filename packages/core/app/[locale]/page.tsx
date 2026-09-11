import { magentoFetch } from "../../lib/magento.js";
import { BlockRenderer } from "../../components/blocks/BlockRenderer.js";
const QUERY = `query Home($id: String!){ cmsBlocks(identifiers:[$id]){ items{ identifier content } } }`;
export const revalidate = 300;
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  let blocks: any[] = [{ type: "Hero" }, { type: "CategoryTiles" }, { type: "ProductCarousel" }];
  try {
    await magentoFetch(QUERY, { id: `headora_hero_${locale}` }, { tags: ["cms", `locale:${locale}`], revalidate: 300 });
  } catch {}
  return <main><BlockRenderer blocks={blocks} /></main>;
}
