import type { ReactNode } from "react";
import { AuthModals } from "../../components/auth/AuthModals.js";
import { Header, type MenuNode, type ShellStore } from "../../components/layout/Header.js";
import { Footer } from "../../components/layout/Footer.js";
import { getFooterConfig, getPresetName, getTokens, tokensToCssVars } from "../../lib/theme.js";
import { getConfig, magentoFetch, storeForLocale } from "../../lib/magento.js";
import { magentoLinkBase, storeLocalePairs } from "../../lib/config.js";
import { SHELL_QUERY } from "../../graphql/catalog.js";

export async function generateMetadata() {
  return { title: { default: "Headora 2.0", template: "%s | Headora" } };
}

type Shell = {
  categoryList: { children: MenuNode[] }[];
  storeConfig: { store_code: string; store_name: string; copyright: string | null; secure_base_media_url: string; header_logo_src: string | null; logo_alt: string | null };
  availableStores: { store_code: string; store_name: string }[];
};

// NOTE: no <html>/<body> here — the site root layout owns the document.
// This layout applies the active preset (tokens -> CSS vars), the header/footer shell
// and global modals, so a theme switch never unmounts functionality providers.
export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const preset = getPresetName();
  const tokens = getTokens(preset);
  const { locale } = await params;
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
        config={getFooterConfig()}
        social={config.HEADORA_SOCIAL_LINKS.split(",").map((p) => p.split("=")).filter(([n, u]) => n && /^https?:\/\//.test(u ?? "")).map(([n, u]) => ({ name: n.trim(), url: u.trim() }))}
      />
      <AuthModals locale={locale} />
    </div>
  );
}
