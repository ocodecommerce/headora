// Next.js config wrapper for sites built on @headora/core.
// Usage (site next.config.mjs):  export default withHeadora({ ...yourConfig });
//
// Core ships TypeScript source (no build step), so the site must transpile it and
// resolve core's TS-ESM imports ("./x.js" -> x.ts / x.tsx).

const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_LOCALE || "en";
// HIDE_DEFAULT_LOCALE=true drops the default locale from URLs ("/shirt.html" instead of
// "/en/shirt.html"). Other locales keep their prefix. Build-time, like BASE_URL.
const HIDE_DEFAULT_LOCALE = process.env.HIDE_DEFAULT_LOCALE === "true";
const OTHER_LOCALES = [...new Set((process.env.NEXT_PUBLIC_LOCALES || "").split(",").map((s) => s.trim()))]
  .filter((l) => l && l !== DEFAULT_LOCALE);

// BASE_URL = public storefront URL. Its path becomes Next's basePath, so
// BASE_URL=https://shop.example.com/dev serves every page under /dev ("/dev" -> "/dev/en").
// Build-time: change it and rebuild. Empty or a bare domain = served at the root.
function basePath() {
  try { return new URL(process.env.BASE_URL || "http://x").pathname.replace(/\/+$/, ""); } catch { return ""; }
}

// Hosts whose product images may be resized by /_next/image: the Magento base URL plus any
// media/CDN hosts in HEADORA_IMAGE_HOSTS (comma list of hosts, e.g. "cdn.example.com").
function imageHosts() {
  const hosts = new Set((process.env.HEADORA_IMAGE_HOSTS || "").split(",").map((h) => h.trim()).filter(Boolean));
  try { if (process.env.MAGENTO_BASE_URL) hosts.add(new URL(process.env.MAGENTO_BASE_URL).host); } catch {}
  return [...hosts];
}

/** @param {import('next').NextConfig} config */
export function withHeadora(config = {}) {
  const hosts = imageHosts();
  const base = config.basePath ?? basePath();
  return {
    ...config,
    ...(base ? { basePath: base } : {}),
    env: { ...config.env, NEXT_PUBLIC_HEADORA_IMAGE_HOSTS: hosts.join(","), NEXT_PUBLIC_BASE_PATH: base, NEXT_PUBLIC_HIDE_DEFAULT_LOCALE: String(HIDE_DEFAULT_LOCALE) },
    images: {
      ...config.images,
      formats: config.images?.formats ?? ["image/avif", "image/webp"],
      // Magento keeps a product image's URL when nothing changes; replaced images get a new name.
      minimumCacheTTL: config.images?.minimumCacheTTL ?? 60 * 60 * 24 * 7,
      remotePatterns: [
        ...(config.images?.remotePatterns ?? []),
        ...hosts.map((h) => {
          const [hostname, port] = h.split(":");
          return { protocol: "https", hostname, ...(port ? { port } : {}) };
        }),
        ...hosts.map((h) => {
          const [hostname, port] = h.split(":");
          return { protocol: "http", hostname, ...(port ? { port } : {}) };
        }),
      ],
    },
    transpilePackages: [...new Set([...(config.transpilePackages ?? []), "@headora/core"])],
    // Next 15.2+ streams page metadata into <body> for most user agents and lets JS hoist it.
    // Pages here render fully before sending, so nothing is gained; keep title/description/
    // canonical/OG in <head> for every crawler and link-preview bot.
    htmlLimitedBots: config.htmlLimitedBots ?? /.*/,
    // Core serves app/[locale]/* only; "/" goes to the default locale. With HIDE_DEFAULT_LOCALE the
    // old prefixed URLs redirect to the bare ones (307, so turning the option off again is safe).
    async redirects() {
      const own = config.redirects ? await config.redirects() : [];
      const locale = HIDE_DEFAULT_LOCALE
        ? [{ source: `/${DEFAULT_LOCALE}`, destination: "/", permanent: false },
           { source: `/${DEFAULT_LOCALE}/:path*`, destination: "/:path*", permanent: false }]
        : [{ source: "/", destination: `/${DEFAULT_LOCALE}`, permanent: false }];
      return [...locale, ...own];
    },
    // Bare paths are served by app/[locale] as the default locale. afterFiles runs after public
    // files and static routes (api/*), before the [locale] dynamic route would claim them.
    async rewrites() {
      const own = config.rewrites ? await config.rewrites() : [];
      if (!HIDE_DEFAULT_LOCALE) return own;
      const skip = OTHER_LOCALES.map((l) => `${l}(?:/|$)|`).join("");
      const ours = [
        { source: "/", destination: `/${DEFAULT_LOCALE}` },
        { source: `/:path((?!${skip}_next/|api/).+)`, destination: `/${DEFAULT_LOCALE}/:path` },
      ];
      if (Array.isArray(own)) return [...ours, ...own];
      return { ...own, afterFiles: [...ours, ...(own.afterFiles ?? [])] };
    },
    webpack(webpackConfig, ctx) {
      webpackConfig.resolve.extensionAlias = {
        ...webpackConfig.resolve.extensionAlias,
        ".js": [".ts", ".tsx", ".js"],
        ".jsx": [".tsx", ".jsx"],
        ".mjs": [".mts", ".mjs"],
      };
      return config.webpack ? config.webpack(webpackConfig, ctx) : webpackConfig;
    },
  };
}

export default withHeadora;
