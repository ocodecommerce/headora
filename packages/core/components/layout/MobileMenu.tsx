"use client";
import { useEffect, useState } from "react";
import { MenuIcon } from "./Icons.js";
import type { MenuNode } from "./Header.js";

// Phone-width menu, like the legacy MobileHeader: a left drawer with "Main Menu", a row per
// category (a "›" opens its sub-categories, "‹" goes back) and an Account sign-in card.
export function MobileMenu({ items, href }: { items: (MenuNode & { kids: MenuNode[] })[]; href: Record<string, string> }) {
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState<string | null>(null);
  const parent = items.find((n) => n.uid === sub);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [open]);

  const close = () => { setOpen(false); setSub(null); };
  const auth = (kind: "openLoginModal" | "openSignUpModal") => { close(); window.dispatchEvent(new Event(kind)); };

  return (
    <div className="hd-mmenu">
      <button type="button" className="hd-mmenu__toggle" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(true)}><MenuIcon /></button>
      {open ? <div className="hd-mmenu__overlay" onClick={close} /> : null}
      <nav className={`hd-mmenu__drawer${open ? " hd-mmenu__drawer--open" : ""}`} aria-label="Main menu" aria-hidden={!open}>
        <div className="hd-mmenu__head">
          <button type="button" className="hd-mmenu__close" aria-label={parent ? "Back" : "Close menu"} onClick={() => (parent ? setSub(null) : close())}>
            {parent ? "‹" : "×"}
          </button>
          <span>Main Menu</span>
        </div>
        <ul className="hd-mmenu__list">
          {(parent ? parent.kids : items).map((n) => {
            const kids = parent ? [] : (n as MenuNode & { kids: MenuNode[] }).kids;
            return (
              <li key={n.uid}>
                <a href={href[n.uid]}>{n.name}</a>
                {kids.length ? (
                  <button type="button" className="hd-mmenu__more" aria-label={`Show ${n.name} categories`} onClick={() => setSub(n.uid)}>›</button>
                ) : null}
              </li>
            );
          })}
        </ul>
        <div className="hd-mmenu__foot">
          <div className="hd-mmenu__account">
            <p>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><polyline points="12 16 16 12 12 8" /><line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Account
            </p>
            <span>
              <button type="button" onClick={() => auth("openLoginModal")}>Sign In</button> | <button type="button" onClick={() => auth("openSignUpModal")}>Sign Up</button>
            </span>
          </div>
        </div>
      </nav>
    </div>
  );
}
