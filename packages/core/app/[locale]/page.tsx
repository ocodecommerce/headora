import { getConfig, magentoFetch } from "../../lib/magento.js";
import { HOME_QUERY, CMS_QUERY } from "../../graphql/catalog.js";
import { getHomeBlocks, getPresetName } from "../../lib/theme.js";
import { rewriteCmsLinks } from "../../lib/cms.js";
import { BlockRenderer } from "../../components/blocks/BlockRenderer.js";
import { CmsHome } from "../../components/blocks/CmsHome.js";
import type { Metadata } from "next";
import { alternates, describe, JsonLd, siteName, siteUrl } from "../../lib/seo.js";

export const revalidate = 300;

// Magento CMS page used as the homepage (same as the legacy storefront). When it is
// missing or empty, the preset block layout renders instead.
const HOME_PAGE = process.env.HEADORA_HOME_PAGE ?? "home";
// CMS block backing the preset hero. Falls back to the preset hero when absent.
const HERO_BLOCK = process.env.HEADORA_HERO_BLOCK ?? "venia-personalized-content";
const CAROUSEL_SIZE = 8;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const page = HOME_PAGE ? await magentoFetch<any>(CMS_QUERY, { id: HOME_PAGE }, { tags: ["home", "cms", `locale:${locale}`, `cms:${HOME_PAGE}`], revalidate: 300, locale }).catch(() => null) : null;
  const description = describe(page?.cmsPage?.meta_description);
  // The layout template would give "Home page | Headora"; the homepage is just the store name.
  const title = page?.cmsPage?.meta_title || siteName();
  return { title: { absolute: title }, description, alternates: alternates(locale, ""), openGraph: { title, description, url: `/${locale}` } };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const base = await siteUrl();
  // Organization + WebSite (with the sitelinks search box) on the homepage only.
  const siteLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${base}/#org`, name: siteName(), url: `${base}/${locale}` },
      { "@type": "WebSite", "@id": `${base}/#site`, name: siteName(), url: `${base}/${locale}`, publisher: { "@id": `${base}/#org` },
        potentialAction: { "@type": "SearchAction", target: `${base}/${locale}/search?query={search_term_string}`, "query-input": "required name=search_term_string" } },
    ],
  };
  const preset = getPresetName();
  const tags = ["home", "cms", `locale:${locale}`];

  const page = HOME_PAGE
    ? await magentoFetch<any>(CMS_QUERY, { id: HOME_PAGE }, { tags: [...tags, `cms:${HOME_PAGE}`], revalidate: 300, locale }).catch(() => null)
    : null;
  const cmsHtml: string = page?.cmsPage?.content?.trim() ?? "";
  if (cmsHtml) return <><JsonLd data={siteLd} /><CmsHome html={rewriteCmsLinks(cmsHtml, locale, getConfig().MAGENTO_BASE_URL)} /></>;

  const data = await magentoFetch<any>(
    HOME_QUERY,
    { cmsId: HERO_BLOCK, carouselSize: CAROUSEL_SIZE },
    { tags, revalidate: 300, locale }
  ).catch(() => null);

  const categories = (data?.categoryList?.[0]?.children ?? []).filter((c: any) => c?.include_in_menu !== 0);
  const products = data?.products?.items ?? [];
  const heroHtml = data?.cmsBlocks?.items?.[0]?.content ?? null;

  // Block list stays preset-driven; each type is handed only the data it needs.
  const props: Record<string, any> = {
    Hero: { html: heroHtml, categories },
    CategoryTiles: { categories },
    ProductCarousel: { products },
    CMSHtml: { html: "" },
  };
  const blocks = getHomeBlocks().map((type) => ({ type, locale, ...(props[type] ?? {}) }));

  return <><JsonLd data={siteLd} /><BlockRenderer blocks={blocks} variant={preset} /></>;
}
