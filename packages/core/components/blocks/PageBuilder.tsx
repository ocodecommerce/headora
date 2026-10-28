import type { CSSProperties, ReactNode } from "react";
import { getConfig, magentoFetch } from "../../lib/magento.js";
import { pageBuilderTree, preparePageBuilder, type PbNode } from "../../lib/pagebuilder.js";
import { rewriteCmsLinks } from "../../lib/cms.js";
import { PB_PRODUCTS_QUERY } from "../../graphql/catalog.js";
import { ProductGrid } from "../catalog/ProductGrid.js";
import type { PresetName } from "../../lib/theme.js";
import { PageBuilderSliders } from "./PageBuilderSliders.js";

// Magento PageBuilder content (CMS pages, Venia's homepage). Products widgets become headless
// product cards in the editor's order; sliders get Venia-style dots. Render inside #html-body.
export async function PageBuilder({ html, locale, variant }: { html: string; locale: string; variant?: PresetName }) {
  const tree = pageBuilderTree(rewriteCmsLinks(preparePageBuilder(html), locale, getConfig().MAGENTO_BASE_URL));
  return <><PageBuilderSliders />{await render(tree, locale, variant)}</>;
}

async function render(nodes: PbNode[], locale: string, variant?: PresetName): Promise<ReactNode[]> {
  return Promise.all(nodes.map(async (n, i) => {
    // display:contents keeps PageBuilder's flex/grid layout intact around the wrapper.
    if ("html" in n) return <div key={i} style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: n.html }} />;
    if ("el" in n) {
      const { class: className, style, ...rest } = n.el;
      return <div key={i} {...rest} className={className} style={style ? cssObject(style) : undefined}>{await render(n.children, locale, variant)}</div>;
    }
    if (!n.urlKeys.length) return null;
    const data = await magentoFetch<any>(PB_PRODUCTS_QUERY, { keys: n.urlKeys, size: n.urlKeys.length },
      { tags: ["cms", `locale:${locale}`], revalidate: 300, locale }).catch(() => null);
    const byKey = new Map<string, any>((data?.products?.items ?? []).map((p: any) => [p.url_key, p]));
    const items = n.urlKeys.map((k) => byKey.get(k)).filter(Boolean);
    return items.length ? (
      <div key={i} className={`hd-pb-products${n.carousel ? " hd-pb-products--carousel" : ""}`}>
        <ProductGrid items={items} locale={locale} variant={variant} />
      </div>
    ) : null;
  }));
}

// "background-image:url(x);--hd-pb-mobile:url(y)" -> { backgroundImage: "url(x)", "--hd-pb-mobile": "url(y)" }
function cssObject(css: string): CSSProperties {
  return Object.fromEntries(css.split(";").map((d) => d.split(/:([^]*)/)).filter(([k, v]) => k?.trim() && v)
    .map(([k, v]) => [k.trim().startsWith("--") ? k.trim() : k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v.trim()])) as CSSProperties;
}
