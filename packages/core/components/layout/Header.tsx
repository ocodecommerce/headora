import type { ThemeTokens } from "../../lib/theme.js";
import { CaretIcon, MenuIcon, SearchIcon } from "./Icons.js";
import { SignInButton } from "./SignInButton.js";
import { MiniCart } from "./MiniCart.js";
import { Ribbon } from "./Ribbon.js";

export type MenuNode = { uid: string; name: string; url_path: string; include_in_menu?: number; position?: number; children?: MenuNode[] };
export type ShellStore = { code: string; name: string; locale: string };

const inMenu = (nodes: MenuNode[] = []) =>
  nodes.filter((n) => n.include_in_menu !== 0).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

export function Header({
  locale, tokens, menu, storeName, logoSrc, logoAlt, stores, activeStore, magentoBaseUrl,
}: {
  locale: string;
  tokens: ThemeTokens;
  menu: MenuNode[];
  storeName: string;
  logoSrc?: string | null;
  logoAlt?: string | null;
  stores: ShellStore[];
  activeStore: string;
  magentoBaseUrl: string;
}) {
  const href = (n: MenuNode) => `/${locale}/${n.url_path}.html`;
  const items = inMenu(menu);
  // Checkout and search stay native Magento (CHECKOUT_STRATEGY=native-magento).
  const base = magentoBaseUrl.replace(/\/$/, "");

  return (
    <>
      {tokens.header.ribbon ? <Ribbon text={tokens.header.ribbon} /> : null}
      {tokens.header.storeSwitcher && stores.length ? (
        <nav className="hd-storebar" aria-label="Store">
          <ul className="hd-storebar__row">
            {stores.map((s) => (
              <li key={s.code}>
                <a href={`/${s.locale}`} aria-current={s.code === activeStore ? "true" : undefined}>{s.name}</a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
      <header className="hd-header">
        <div className="hd-header__row">
          <details className="hd-menu">
            <summary className="hd-action" aria-label="Menu"><MenuIcon /></summary>
            <div className="hd-menu__panel">
              <ul>
                {items.map((n) => (
                  <li key={n.uid}>
                    <a href={href(n)}>{n.name}</a>
                    {inMenu(n.children).length ? (
                      <ul>{inMenu(n.children).map((c) => <li key={c.uid}><a href={href(c)}>{c.name}</a></li>)}</ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </details>

          <a className="hd-logo" href={`/${locale}`}>
            {logoSrc ? <img src={logoSrc} alt={logoAlt || storeName} /> : storeName}
          </a>

          <nav className="hd-nav" aria-label="Main">
            <ul>
              {items.map((n) => {
                const kids = inMenu(n.children);
                return (
                  <li key={n.uid}>
                    <a href={href(n)}>{n.name}{kids.length ? <CaretIcon /> : null}</a>
                    {kids.length ? (
                      <ul className="hd-nav__sub">
                        {kids.map((c) => <li key={c.uid}><a href={href(c)}>{c.name}</a></li>)}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="hd-actions">
            {tokens.header.search ? (
              <a className="hd-action" href={`${base}/catalogsearch/result/`}>
                <SearchIcon /><span className="hd-action__label">Search</span>
              </a>
            ) : null}
            <SignInButton />
            {tokens.header.miniCart ? <MiniCart locale={locale} /> : null}
          </div>
        </div>
      </header>
    </>
  );
}
