import type { ThemeTokens, FooterConfig, FooterLink } from "../../lib/theme.js";
import type { MenuNode } from "./Header.js";
import { AuthLink, NewsletterForm } from "./FooterClient.js";
import { SocialIcon } from "./Icons.js";

// Legacy v1 footer: Account / About Us / Help / Follow Us! / Subscribe columns + bottom bar.
// Columns/legal links come from @headora/preset-base blocks.json (footer); copyright and
// social URLs from HEADORA_COPYRIGHT / HEADORA_SOCIAL_LINKS ("instagram=https://…,facebook=…").
export function Footer({
  locale, storeName, copyright, magentoBaseUrl, config, social,
}: {
  locale: string;
  tokens: ThemeTokens;
  menu: MenuNode[];
  storeName: string;
  copyright?: string | null;
  magentoBaseUrl: string;
  config: FooterConfig;
  social: { name: string; url: string }[];
}) {
  const base = magentoBaseUrl.replace(/\/$/, "");
  const fill = (s: string) => s.replaceAll("{locale}", locale).replaceAll("{magento}", base).replaceAll("{site}", storeName);
  const link = (l: FooterLink) => {
    if (l.href === "auth:login") return <AuthLink kind="login">{l.label}</AuthLink>;
    if (l.href === "auth:register") return <AuthLink kind="register">{l.label}</AuthLink>;
    return <a href={fill(l.href)}>{l.label}</a>;
  };

  return (
    <footer className="hd-footer">
      <div className="hd-footer__grid">
        {config.columns.map((col) => (
          <section key={col.title} className="hd-footer__col">
            <h2>{col.title}</h2>
            <ul>{col.links.map((l, i) => <li key={i}>{link(l)}</li>)}</ul>
          </section>
        ))}
        <section className="hd-footer__col hd-footer__col--wide">
          <h2>{config.follow.title}</h2>
          <p className="hd-footer__text">{config.follow.text}</p>
          {social.length ? (
            <ul className="hd-footer__social">
              {social.map((s) => (
                <li key={s.name}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.name}><SocialIcon name={s.name} /></a>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
        <section className="hd-footer__col hd-footer__col--wide" id="newsletter">
          <h2>{fill(config.subscribe.title)}</h2>
          <p className="hd-footer__text">{config.subscribe.text}</p>
          <NewsletterForm locale={locale} />
        </section>
      </div>
      <div className="hd-footer__bottom">
        <a className="hd-footer__brand" href={`/${locale}`}>{storeName}</a>
        <div className="hd-footer__copy">{copyright ?? ""}</div>
        <ul className="hd-footer__legal">{config.legal.map((l, i) => <li key={i}><a href={fill(l.href)}>{l.label}</a></li>)}</ul>
      </div>
    </footer>
  );
}
