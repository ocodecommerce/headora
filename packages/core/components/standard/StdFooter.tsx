import type { MenuNode } from "../layout/Header.js";
import type { FooterConfig, FooterLink } from "../../lib/theme.js";
import { AuthLink } from "../layout/FooterClient.js";
import { SocialIcon } from "../layout/Icons.js";
import { home, lp } from "../../lib/base.js";

// Standard preset footer: brand + blurb + social, Shop (menu categories) and the preset-base
// footer columns, then a copyright bar.
export function StdFooter({ locale, menu, storeName, copyright, magentoBaseUrl, config, social, missing }: {
  locale: string; menu: MenuNode[]; storeName: string; copyright?: string | null; magentoBaseUrl: string;
  config: FooterConfig; social: { name: string; url: string }[]; missing?: Set<string>;
}) {
  const base = magentoBaseUrl.replace(/\/$/, "");
  const fill = (s: string) => s.replaceAll("/{locale}", lp(locale)).replaceAll("{locale}", locale).replaceAll("{magento}", base).replaceAll("{site}", storeName);
  const link = (l: FooterLink) => {
    if (l.href === "auth:login") return <AuthLink kind="login">{l.label}</AuthLink>;
    if (l.href === "auth:register") return <AuthLink kind="register">{l.label}</AuthLink>;
    return <a href={fill(l.href)}>{l.label}</a>;
  };
  const shop = menu.filter((n) => n.include_in_menu !== 0).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  return (
    <footer className="std-footer">
      <div className="std-footer__in">
        <div className="std-footer__grid">
          <div className="std-footer__brand">
            <a className="std-logo" href={home(locale)}>{storeName.toLowerCase()}<span className="std-logo__dot" aria-hidden="true" /></a>
            <p>Easy pieces for everyday dressing, from breezy dresses to finishing touches.</p>
            {social.length ? (
              <ul className="std-footer__social">
                {social.map((s) => (
                  <li key={s.name}><a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.name}><SocialIcon name={s.name} /></a></li>
                ))}
              </ul>
            ) : null}
          </div>
          <nav aria-label="Shop">
            <h2>Shop</h2>
            <ul>{shop.map((n) => <li key={n.uid}><a href={`${lp(locale)}/${n.url_path}.html`}>{n.name}</a></li>)}</ul>
          </nav>
          {config.columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2>{col.title}</h2>
              <ul>{col.links.map((l, i) => <li key={i}>{link(l)}</li>)}</ul>
            </nav>
          ))}
        </div>
        <div className="std-footer__bottom">
          <span>{copyright ?? `© ${new Date().getFullYear()} ${storeName}`}</span>
          <ul>{config.legal.map((l, i) => <li key={i}>{missing?.has(l.href) ? l.label : <a href={fill(l.href)}>{l.label}</a>}</li>)}</ul>
        </div>
      </div>
    </footer>
  );
}
