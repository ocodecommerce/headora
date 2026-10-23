import type { ThemeTokens } from "../../lib/theme.js";
import { CaretIcon } from "./Icons.js";
import { SignInButton } from "./SignInButton.js";
import { MiniCart } from "./MiniCart.js";
import { QuickSearch } from "../search/QuickSearch.js";
import { MobileMenu } from "./MobileMenu.js";
import { HeartIcon } from "../catalog/CardActions.js";
import { Ribbon } from "./Ribbon.js";

export type MenuNode = { uid: string; name: string; url_path: string; image?: string | null; include_in_menu?: number; position?: number; children?: MenuNode[] };
export type ShellStore = { code: string; name: string; locale: string };

const inMenu = (nodes: MenuNode[] = []) =>
  nodes.filter((n) => n.include_in_menu !== 0).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
// Dropdown entries are alphabetical, like the legacy storefront.
const byName = (nodes: MenuNode[]) => [...nodes].sort((a, b) => a.name.localeCompare(b.name));
// Banner beside the mega menu when the category has no image (site public/ asset).
const MENU_BANNER = "/Images/menu-banner.jpg";

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
          <MobileMenu
            items={items.map((n) => ({ ...n, kids: byName(inMenu(n.children)) }))}
            href={Object.fromEntries(items.flatMap((n) => [n, ...inMenu(n.children)]).map((n) => [n.uid, href(n)]))}
          />

          <a className="hd-logo" href={`/${locale}`}>
            {logoSrc ? <img src={logoSrc} alt={logoAlt || storeName} /> : storeName}
          </a>

          <nav className="hd-nav" aria-label="Main">
            <ul>
              {items.map((n) => {
                const kids = byName(inMenu(n.children));
                // Legacy rule: more than 5 children, or a third level, opens the full-width mega menu.
                const mega = kids.length > 5 || kids.some((c) => inMenu(c.children).length);
                return (
                  <li key={n.uid} className={mega ? "hd-nav__item--mega" : undefined}>
                    <a href={href(n)}>{n.name}{kids.length ? <CaretIcon /> : null}</a>
                    {mega ? (
                      <div className="hd-mega">
                        <div className="hd-mega__inner">
                          <ul className="hd-mega__grid" style={{ gridTemplateColumns: `repeat(${Math.min(kids.length, 4)}, 177px)` }}>
                            {kids.map((c) => {
                              const sub = byName(inMenu(c.children));
                              return (
                                <li key={c.uid}>
                                  <a href={href(c)}>{c.name}</a>
                                  {sub.length ? (
                                    <ul className="hd-mega__sub">
                                      {sub.slice(0, 4).map((s) => <li key={s.uid}><a href={href(s)}>{s.name}</a></li>)}
                                      {sub.length > 4 ? <li><a href={href(c)}>View All</a></li> : null}
                                    </ul>
                                  ) : null}
                                </li>
                              );
                            })}
                          </ul>
                          <img className="hd-mega__banner" src={n.image || MENU_BANNER} alt={`${n.name} banner`} loading="lazy" />
                        </div>
                      </div>
                    ) : kids.length ? (
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
            {tokens.header.search ? <QuickSearch locale={locale} /> : null}
            {/* Phone width only, like legacy MobileHeader: wishlist instead of sign-in (that moves into the menu). */}
            <a className="hd-action hd-action--wish" href={`${base}/wishlist`} aria-label="Wishlist"><HeartIcon filled={false} width={23} height={20} /></a>
            <SignInButton />
            {tokens.header.miniCart ? <MiniCart locale={locale} /> : null}
          </div>
        </div>
      </header>
    </>
  );
}
