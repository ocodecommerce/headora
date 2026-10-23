import { notFound } from "next/navigation";
import { magentoFetch } from "../../../lib/magento.js";
import { preparePageBuilder } from "../../../lib/pagebuilder.js";
import { ContactForm } from "../../../components/contact/ContactForm.js";

export const revalidate = 300;

// Same page as PWA Studio Venia's ContactPage: CMS banner, form, CMS sidebar; 404 when
// the Magento contact form is disabled (Stores > Configuration > General > Contacts).
const BANNER = "contact-us-banner";
const SIDEBAR = "contact-us-sidebar";
const CONTACT_QUERY = `query Contact($ids: [String]) { storeConfig { contact_enabled } cmsBlocks(identifiers: $ids) { items { identifier content } } }`;

export const metadata = { title: "Contact Us", description: "Contact Us" };

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const data = await magentoFetch<any>(CONTACT_QUERY, { ids: [BANNER, SIDEBAR] }, { tags: ["cms", `locale:${locale}`], revalidate: 300, locale }).catch(() => null);
  if (!data?.storeConfig?.contact_enabled) notFound();
  const block = (id: string) => preparePageBuilder(data.cmsBlocks?.items?.find((b: any) => b?.identifier === id)?.content ?? "");
  const banner = block(BANNER);
  const sidebar = block(SIDEBAR);

  return (
    <article id="html-body" className="hd-contact">
      {banner ? <div className="hd-contact__banner" dangerouslySetInnerHTML={{ __html: banner }} /> : null}
      <div className="hd-contact__content">
        <div className="hd-contact__main">
          <h1 className="hd-contact__title">Contact Us</h1>
          <p className="hd-contact__subtitle">Drop us a line and we&apos;ll get back to you as soon as possible.</p>
          <ContactForm locale={locale} />
        </div>
        {sidebar ? <aside className="hd-contact__side" dangerouslySetInnerHTML={{ __html: sidebar }} /> : null}
      </div>
    </article>
  );
}
