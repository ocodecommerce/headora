import Head from "next/head";
import styles from "@/styles/VeniaCms.module.css";
import { preparePageBuilder } from "@/lib/pagebuilder";

// Magento CMS page "customer-service" (Venia sample data), rendered like Venia's CmsPage.
export default function CustomerService({ page }: { page: { title?: string; content_heading?: string; content?: string; meta_description?: string } | null }) {
  // The sample content links "/contact", which only exists as Magento's form; ours is /contact-us.
  const html = preparePageBuilder(page?.content ?? "").replace(/href="\/contact"/g, 'href="/contact-us"');
  return (
    <>
      <Head>
        <title>{`${page?.title || "Customer Service"} | Headora`}</title>
        <meta name="description" content={page?.meta_description || "Customer Service"} />
        <link rel="canonical" href={`${process.env.baseURL}customer-service`} />
      </Head>
      <article id="html-body" className={styles.root}>
        {page?.content_heading ? <h1 className={styles.heading}>{page.content_heading}</h1> : null}
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </>
  );
}

export async function getStaticProps() {
  let page = null;
  try {
    const res = await fetch(`${process.env.magentoEndpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: `{ cmsPage(identifier: "customer-service") { title content_heading content meta_description } }` }),
    });
    page = (await res.json())?.data?.cmsPage ?? null;
  } catch {
    // Magento unreachable at build: retry on revalidate.
  }
  return { props: { page }, revalidate: 300 };
}
