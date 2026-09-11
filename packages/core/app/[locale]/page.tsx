import { magentoFetch } from "../../lib/magento.js";
import { getHomeBlocks, getPresetName } from "../../lib/theme.js";
import { BlockRenderer } from "../../components/blocks/BlockRenderer.js";
const QUERY = `query Home($id: String!){ cmsBlocks(identifiers:[$id]){ items{ identifier content } } }`;
export const revalidate = 300;
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const preset = getPresetName();
  let blocks = getHomeBlocks().map((type) => ({ type }));
  try {
    await magentoFetch(QUERY, { id: `headora_hero_${locale}` }, { tags: ["cms", `locale:${locale}`], revalidate: 300 });
  } catch {}
  return <main><BlockRenderer blocks={blocks} variant={preset} /></main>;
}
