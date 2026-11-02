// Next.js config wrapper for sites built on @headora/core.
// Usage (site next.config.mjs):  export default withHeadora({ ...yourConfig });
//
// Core ships TypeScript source (no build step), so the site must transpile it and
// resolve core's TS-ESM imports ("./x.js" -> x.ts / x.tsx).

const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_LOCALE || "en";

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
  return {
    ...config,
    env: { ...config.env, NEXT_PUBLIC_HEADORA_IMAGE_HOSTS: hosts.join(",") },
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
    // Core serves app/[locale]/* only; "/" goes to the default locale.
    async redirects() {
      const own = config.redirects ? await config.redirects() : [];
      return [{ source: "/", destination: `/${DEFAULT_LOCALE}`, permanent: false }, ...own];
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
