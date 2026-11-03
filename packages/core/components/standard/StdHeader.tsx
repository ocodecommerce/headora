import type { ThemeTokens } from "../../lib/theme.js";
import type { MenuNode } from "../layout/Header.js";
import { MiniCart } from "../layout/MiniCart.js";
import { MobileMenu } from "../layout/MobileMenu.js";
import { QuickSearch } from "../search/QuickSearch.js";
import { PageLoadingIndicator } from "../layout/PageLoadingIndicator.js";
import { CardImageFade } from "../catalog/CardImageFade.js";
import { AccountButton } from "./StdClient.js";
import { BasketIcon, HeartLineIcon } from "./StdIcons.js";
import { home, lp } from "../../lib/base.js";

const inMenu = (nodes: MenuNode[] = []) =>
  nodes.filter((n) => n.include_in_menu !== 0).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

// Standard preset header: black announcement bar, wordmark, flat category nav with a simple
// dropdown, pill search, account / wishlist / basket (drawer, with a link to the basket page).
export function StdHeader({ locale, tokens, menu, storeName, logoSrc, logoAlt, magentoBaseUrl }: {
  locale: string; tokens: ThemeTokens; menu: MenuNode[]; storeName: string;
  logoSrc?: string | null; logoAlt?: string | null; magentoBaseUrl: string;
}) {
  const href = (n: MenuNode) => `${lp(locale)}/${n.url_path}.html`;
  const items = inMenu(menu);
  return (
    <>
      {tokens.header.ribbon ? <div className="std-ribbon">{tokens.header.ribbon}</div> : null}
      <header className="std-header">
        <div className="std-header__row">
          <MobileMenu
            items={items.map((n) => ({ ...n, kids: inMenu(n.children) }))}
            href={Object.fromEntries(items.flatMap((n) => [n, ...inMenu(n.children)]).map((n) => [n.uid, href(n)]))}
          />
          <a className="std-logo" href={home(locale)}>
            {logoSrc ? <img src={logoSrc} alt={logoAlt || storeName} /> : <>{storeName.toLowerCase()}<span className="std-logo__dot" aria-hidden="true" /></>}
          </a>
          <nav className="std-nav" aria-label="Main">
            <ul>
              {items.map((n) => {
                const kids = inMenu(n.children);
                return (
                  <li key={n.uid}>
                    <a href={href(n)}>{n.name}</a>
                    {kids.length ? (
                      <ul className="std-nav__sub">
                        <li><a href={href(n)}>All {n.name}</a></li>
                        {kids.map((c) => <li key={c.uid}><a href={href(c)}>{c.name}</a></li>)}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="std-actions">
            {tokens.header.search ? <QuickSearch locale={locale} /> : null}
            <AccountButton locale={locale} />
            <a className="std-icon std-icon--wish" href={`${lp(locale)}/account/wishlist`} aria-label="Favorites"><HeartLineIcon /></a>
            {tokens.header.miniCart ? <MiniCart locale={locale} icon={<BasketIcon />} cartHref={`${lp(locale)}/cart`} /> : null}
          </div>
        </div>
        <PageLoadingIndicator />
        <CardImageFade />
      </header>
    </>
  );
}
