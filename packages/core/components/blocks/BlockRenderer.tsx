"use client";
const BLOCKS: Record<string, (p: any) => any> = {
  Hero: () => <section style={{ padding: 48 }}><h1>Preset hero - override in themes/child</h1></section>,
  CategoryTiles: () => <section style={{ padding: 24 }}>Category tiles from Magento categoryTree</section>,
  ProductCarousel: () => <section style={{ padding: 24 }}>Product carousel from Magento products query</section>,
  CMSHtml: ({ html }: any) => <div dangerouslySetInnerHTML={{ __html: html ?? "" }} />,
};
export function BlockRenderer({ blocks }: { blocks: any[] }) {
  return <>{blocks.map((b, i) => { const C = BLOCKS[b.type] ?? BLOCKS.CMSHtml; return <C key={i} {...b} />; })}</>;
}
