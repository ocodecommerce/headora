"use client";
import { useEffect, useRef, useState } from "react";
import { AccountIcon } from "./StdIcons.js";
import { ACCOUNT_SECTIONS } from "./accountSections.js";


// Readable cookie set next to the httpOnly token at login: present = signed in.
function readName(): string | null {
  const m = document.cookie.match(/(?:^|;\s*)headora_customer_name=([^;]*)/);
  return m ? decodeURIComponent(m[1]) || "there" : null;
}

export async function signOut(locale: string) {
  await fetch("/api/auth/logout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ locale }) }).catch(() => null);
  window.dispatchEvent(new Event("headora:auth-changed"));
  window.location.assign(`/${locale}`);
}

// Signed out: opens the login modal. Signed in: "Hi, Name" + account menu, like Venia.
export function AccountButton({ locale }: { locale: string }) {
  const [name, setName] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setName(readName());
    sync();
    window.addEventListener("headora:auth-changed", sync);
    return () => window.removeEventListener("headora:auth-changed", sync);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  if (name === null) {
    return (
      <button type="button" className="std-icon" aria-label="Sign in or create an account"
        onClick={() => window.dispatchEvent(new Event("openLoginModal"))}>
        <AccountIcon />
      </button>
    );
  }
  return (
    <div className="std-acct" ref={box}>
      <button type="button" className="std-icon std-acct__btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <AccountIcon /><span className="std-acct__hi">Hi, {name}</span>
      </button>
      {open ? (
        <ul className="std-acct__menu" role="menu">
          {ACCOUNT_SECTIONS.map((s) => (
            <li key={s.slug} role="none"><a role="menuitem" href={`/${locale}/account/${s.slug}`}>{s.label}</a></li>
          ))}
          <li role="none"><button type="button" role="menuitem" onClick={() => signOut(locale)}>Sign Out</button></li>
        </ul>
      ) : null}
    </div>
  );
}
