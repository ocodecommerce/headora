"use client";
import { useEffect, useState } from "react";
import { BASE } from "../../lib/base.js";

// One wishlist fetch per page, shared by every heart (product cards, PDP "Add To Favorites").
export type WishState = { loggedIn: boolean; items: Record<string, string> };
let wishPromise: Promise<WishState> | null = null;
const listeners = new Set<(s: WishState) => void>();

function load(locale: string, force = false): Promise<WishState> {
  if (!wishPromise || force) {
    wishPromise = fetch(`${BASE}/api/wishlist?locale=${encodeURIComponent(locale)}`)
      .then(async (r) => {
        if (r.status === 401) return { loggedIn: false, items: {} };
        const j = await r.json();
        return { loggedIn: j.loggedIn !== false, items: j.items ?? {} };
      })
      .catch(() => ({ loggedIn: false, items: {} }));
  }
  return wishPromise;
}

function publish(s: WishState) {
  wishPromise = Promise.resolve(s);
  listeners.forEach((l) => l(s));
}

export function useWishlist(locale: string) {
  const [wish, setWish] = useState<WishState>({ loggedIn: false, items: {} });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    const set = (s: WishState) => { if (live) setWish(s); };
    listeners.add(set);
    load(locale).then(set);
    const onAuth = () => load(locale, true).then(publish);
    window.addEventListener("headora:auth-changed", onAuth);
    return () => { live = false; listeners.delete(set); window.removeEventListener("headora:auth-changed", onAuth); };
  }, [locale]);

  // Signed out -> login modal. Returns an error message, or "" on success.
  async function toggle(sku: string): Promise<string> {
    if (!wish.loggedIn) { window.dispatchEvent(new Event("openLoginModal")); return ""; }
    const on = !!wish.items[sku];
    setBusy(true);
    try {
      const res = await fetch(BASE + "/api/wishlist", {
        method: on ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, sku }),
      });
      if (res.status === 401) { publish({ loggedIn: false, items: {} }); window.dispatchEvent(new Event("openLoginModal")); return ""; }
      const j = await res.json();
      if (j.items) publish({ loggedIn: true, items: j.items });
      return j.ok ? "" : j.error ?? "Could not update your wishlist.";
    } catch {
      return "Could not reach the store. Please try again.";
    } finally {
      setBusy(false);
    }
  }

  // loggedIn doubles as the headless session check (the wishlist call validates the customer token).
  return { wished: (sku: string) => !!wish.items[sku], toggle, busy, loggedIn: wish.loggedIn };
}
