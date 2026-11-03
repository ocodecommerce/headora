// Sub-path the storefront is served under, from BASE_URL at build time ("/dev" for
// https://shop.example.com/dev, "" at a domain root). Next adds it to its own routing,
// redirect() and /_next assets; plain <a href>, fetch() and location.assign() need it here.
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// HIDE_DEFAULT_LOCALE=true serves the default locale without its prefix ("/shirt.html", not
// "/en/shirt.html"); next.mjs rewrites those paths to app/[locale] and redirects the old ones.
const HIDE_DEFAULT = process.env.NEXT_PUBLIC_HIDE_DEFAULT_LOCALE === "true";
const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_LOCALE || "en";
// Locale's URL segment: "/fr", or "" for the hidden default locale.
export const seg = (locale: string) => (HIDE_DEFAULT && locale === DEFAULT_LOCALE ? "" : `/${locale}`);
// Link prefix for a locale's pages ("/dev/en", "/dev" or ""); append "/path".
export const lp = (locale: string) => BASE + seg(locale);
// Locale home link (never empty).
export const home = (locale: string) => lp(locale) || "/";
