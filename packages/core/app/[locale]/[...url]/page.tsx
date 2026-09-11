import { magentoFetch, URL_RESOLVE_QUERY } from "../../../lib/magento.js";
export const revalidate = 120;
export async function generateMetadata({ params }: { params: Promise<{ locale: string; url: string[] }> }) {
  const { url } = await params;
  return { title: url?.join(" / ") ?? "Store", alternates: { canonical: `/${url?.join("/") ?? ""}` } };
}
export default async function CatchAll({ params }: { params: Promise<{ locale: string; url: string[] }> }) {
  const { locale, url } = await params;
  const path = `/${url?.join("/") ?? ""}`;
  const data = await magentoFetch<{ urlResolver: { type: string } | null }>(
    URL_RESOLVE_QUERY, { url: path }, { tags: [`url:${path}`, `locale:${locale}`], revalidate: 120 }
  ).catch(() => ({ urlResolver: null }));
  if (!data.urlResolver) return <main><h1>Not found</h1><p>{path}</p></main>;
  return <main><h1>{data.urlResolver.type}</h1><p>{path}</p></main>;
}
