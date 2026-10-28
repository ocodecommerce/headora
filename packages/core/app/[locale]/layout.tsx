import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthModals } from "../../components/auth/AuthModals.js";
import { Header, type MenuNode, type ShellStore } from "../../components/layout/Header.js";
import { Footer } from "../../components/layout/Footer.js";
import { getFooterConfig, getPresetName, getTokens, tokensToCssVars } from "../../lib/theme.js";
import { getConfig, magentoFetch, storeForLocale } from "../../lib/magento.js";
import { magentoLinkBase, storeLocalePairs } from "../../lib/config.js";
import { SHELL_QUERY, pagesExistQuery } from "../../graphql/catalog.js";
import { locales, siteName, siteUrl } from "../../lib/seo.js";

// Site-wide defaults: absolute URLs resolve against metadataBase; pages fill in title/description/canonical.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const shell = await magentoFetch<Shell>(SHELL_QUERY, {}, { tags: ["shell", `locale:${locale}`], revalidate: 600, locale }).catch(() => null);
  const name = siteName();
  return {
    metadataBase: new URL(await siteUrl()),
    title: { default: name, template: `%s | ${name}` },
    description: shell?.storeConfig?.default_description || undefined,
    openGraph: { siteName: name, locale, type: "website" },
  };
}

type Shell = {
  categoryList: { children: MenuNode[] }[];
  storeConfig: { store_code: string; store_name: string; copyright: string | null; secure_base_media_url: string; header_logo_src: string | null; logo_alt: string | null; default_description?: string | null };
  availableStores: { store_code: string; store_name: string }[];
};

// NOTE: no <html>/<body> here — the site root layout owns the document.
// This layout applies the active preset (tokens -> CSS vars), the header/footer shell
// and global modals, so a theme switch never unmounts functionality providers.
export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const preset = getPresetName();
  const tokens = getTokens(preset);
  const { locale } = await params;
  // Unknown first segment (/robots.php, /xyz) must 404, not render the homepage under a fake locale.
  if (!locales().includes(locale)) notFound();
  const config = getConfig();

  const shell = await magentoFetch<Shell>(SHELL_QUERY, {}, { tags: ["shell", `locale:${locale}`], revalidate: 600, locale }).catch(() => null);
  const menu = shell?.categoryList?.[0]?.children ?? [];
  const sc = shell?.storeConfig;
  // Brand text when no logo is uploaded; Magento's store view name ("Default Store View") is a poor default.
  const storeName = config.HEADORA_SITE_NAME || sc?.store_name || "Store";
  const logoSrc = sc?.header_logo_src ? `${sc.secure_base_media_url}logo/${sc.header_logo_src}` : null;
  const available = new Map<string, string>((shell?.availableStores ?? []).map((s) => [s.store_code, s.store_name]));
  const stores: ShellStore[] = storeLocalePairs()
    .filter((p) => available.has(p.store))
    .map((p) => ({ code: p.store, name: available.get(p.store)!, locale: p.locale }));
  // Legal links point at Magento CMS pages a store may not have (Venia sample data has no
  // terms-of-service); missing ones render as plain text, as in Venia's footer. Unknown = keep link.
  const footer = getFooterConfig();
  const legal = footer.legal.map((l) => l.href).filter((h) => h.startsWith("/{locale}/")).map((h) => h.slice(10));
  const found = legal.length
    ? await magentoFetch<Record<string, unknown>>(pagesExistQuery(legal), {}, { tags: ["shell", `locale:${locale}`], revalidate: 600, locale }).catch(() => null)
    : null;
  const missing = new Set(found ? legal.filter((_, i) => !found[`p${i}`]).map((p) => `/{locale}/${p}`) : []);

  return (
    <div className="hd" data-headora-preset={preset}>
      <style>{`:root{${tokensToCssVars(tokens)}}`}</style>
      {tokens.fontsHref ? <link rel="stylesheet" href={tokens.fontsHref} precedence="default" /> : null}
      <Header
        locale={locale}
        tokens={tokens}
        menu={menu}
        storeName={storeName}
        logoSrc={logoSrc}
        logoAlt={sc?.logo_alt}
        stores={stores}
        activeStore={storeForLocale(locale).store}
        magentoBaseUrl={magentoLinkBase()}
      />
      <main>{children}</main>
      <Footer
        locale={locale}
        tokens={tokens}
        menu={menu}
        storeName={storeName}
        copyright={config.HEADORA_COPYRIGHT || sc?.copyright}
        magentoBaseUrl={magentoLinkBase()}
        config={footer}
        missing={missing}
        social={config.HEADORA_SOCIAL_LINKS.split(",").map((p) => p.split("=")).filter(([n, u]) => n && /^https?:\/\//.test(u ?? "")).map(([n, u]) => ({ name: n.trim(), url: u.trim() }))}
      />
      <AuthModals locale={locale} />
    </div>
  );
}
