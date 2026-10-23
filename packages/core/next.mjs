// Next.js config wrapper for sites built on @headora/core.
// Usage (site next.config.mjs):  export default withHeadora({ ...yourConfig });
//
// Core ships TypeScript source (no build step), so the site must transpile it and
// resolve core's TS-ESM imports ("./x.js" -> x.ts / x.tsx).

const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_LOCALE || "en";

/** @param {import('next').NextConfig} config */
export function withHeadora(config = {}) {
  return {
    ...config,
    transpilePackages: [...new Set([...(config.transpilePackages ?? []), "@headora/core"])],
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
