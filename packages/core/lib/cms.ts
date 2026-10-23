// Magento CMS HTML is written for the Magento storefront: root-relative or absolute
// same-store links ("/venia-dresses", "http://shop/luna-scarf.html"). Point them at the
// headless routes (/<locale>/...) except paths Magento itself must serve.
const NATIVE = /^(admin|headora|checkout|customer|cart|catalogsearch|contact|sales|wishlist|newsletter|review|media|static|rest|graphql|api)(\/|$|\?)/;

export function rewriteCmsLinks(html: string, locale: string, magentoBaseUrl: string): string {
  if (!html) return html;
  let origin = "";
  try { origin = new URL(magentoBaseUrl).host; } catch { /* keep relative-only rewriting */ }
  return html.replace(/href="([^"]*)"/g, (whole, href: string) => {
    let path: string | null = null;
    if (/^https?:\/\//i.test(href)) {
      try {
        const u = new URL(href);
        if (origin && u.host === origin) path = (u.pathname + u.search + u.hash).replace(/^\//, "");
      } catch { /* leave as is */ }
    } else if (href.startsWith("/") && !href.startsWith("//")) {
      path = href.slice(1);
    }
    if (path === null || path === "" || NATIVE.test(path) || path.startsWith(`${locale}/`)) return whole;
    return `href="/${locale}/${path}"`;
  });
}
