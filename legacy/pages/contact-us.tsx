import Head from "next/head";
import { useState, type FormEvent } from "react";
import styles from "@/styles/ContactUs.module.css";
import { preparePageBuilder } from "@/lib/pagebuilder";

// Same page as PWA Studio Venia's ContactPage: CMS banner, form, CMS sidebar.
// The form posts straight to Magento GraphQL (contactUs), like Venia does.
const BANNER = "contact-us-banner";
const SIDEBAR = "contact-us-sidebar";
const CONTACT_QUERY = `query Contact($ids: [String]) { storeConfig { contact_enabled } cmsBlocks(identifiers: $ids) { items { identifier content } } }`;
const CONTACT_MUTATION = `mutation Contact($input: ContactUsInput!) { contactUs(input: $input) { status } }`;

export default function ContactUs({ banner, sidebar }: { banner: string; sidebar: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const input = { name: f.name.trim(), email: f.email.trim(), telephone: f.telephone.trim(), comment: f.comment.trim() };
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`${process.env.magentoEndpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: CONTACT_MUTATION, variables: { input } }),
      });
      const json = await res.json().catch(() => null);
      if (json?.data?.contactUs?.status) {
        form.reset();
        setMsg({ ok: true, text: "Your message has been sent." });
      } else {
        setMsg({ ok: false, text: json?.errors?.[0]?.message ?? "Your message could not be sent. Please try again." });
      }
    } catch {
      setMsg({ ok: false, text: "Your message could not be sent. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Head>
        <title>Contact Us | Headora</title>
        <meta name="description" content="Contact Us" />
        <link rel="canonical" href={`${process.env.baseURL}contact-us/`} />
      </Head>
      <article id="html-body" className={styles.root}>
        {banner ? <div className={styles.banner} dangerouslySetInnerHTML={{ __html: banner }} /> : null}
        <div className={styles.content}>
          <div className={styles.main}>
            <h1 className={styles.title}>Contact Us</h1>
            <p className={styles.subtitle}>Drop us a line and we&apos;ll get back to you as soon as possible.</p>
            <form className={styles.form} onSubmit={submit}>
              <label className={styles.field}>
                <span className={styles.label}>Name</span>
                <input className={styles.input} name="name" autoComplete="name" required maxLength={255} />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Email</span>
                <input className={styles.input} name="email" type="email" autoComplete="email" placeholder="abc@xyz.com" required maxLength={254} />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Phone Number <em>Optional</em></span>
                <input className={styles.input} name="telephone" type="tel" autoComplete="tel" placeholder="(222)-222-2222" maxLength={40} />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Message</span>
                <textarea className={`${styles.input} ${styles.textarea}`} name="comment" placeholder="Tell us what's on your mind" required maxLength={5000} />
              </label>
              {msg ? <p className={msg.ok ? styles.ok : styles.err} role={msg.ok ? "status" : "alert"}>{msg.text}</p> : null}
              <div className={styles.buttons}>
                <button type="submit" className={styles.submit} disabled={busy}>{busy ? "Sending…" : "Send"}</button>
              </div>
            </form>
          </div>
          {sidebar ? <aside className={styles.side} dangerouslySetInnerHTML={{ __html: sidebar }} /> : null}
        </div>
      </article>
    </>
  );
}

export async function getStaticProps() {
  let data: any = null;
  try {
    const res = await fetch(`${process.env.magentoEndpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: CONTACT_QUERY, variables: { ids: [BANNER, SIDEBAR] } }),
    });
    data = (await res.json())?.data;
  } catch {
    // Magento unreachable at build: render the form without CMS blocks, retry on revalidate.
  }
  if (data && !data.storeConfig?.contact_enabled) return { notFound: true, revalidate: 300 };
  const block = (id: string) => preparePageBuilder(data?.cmsBlocks?.items?.find((b: any) => b?.identifier === id)?.content ?? "");
  return { props: { banner: block(BANNER), sidebar: block(SIDEBAR) }, revalidate: 300 };
}
