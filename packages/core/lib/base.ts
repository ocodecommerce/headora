// Sub-path the storefront is served under, from BASE_URL at build time ("/dev" for
// https://shop.example.com/dev, "" at a domain root). Next adds it to its own routing,
// redirect() and /_next assets; plain <a href>, fetch() and location.assign() need it here.
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
