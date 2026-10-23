# @headora/core

The Headora storefront engine: Next.js App Router pages, API routes, components, GraphQL queries and theming for a headless Magento 2 / Adobe Commerce store.

Start a new store with the scaffolder (recommended):

```bash
npx create-headora-app my-store
```

## Adding it to an existing Next.js app

```bash
npm install @headora/core next@^15.5.28 react react-dom
```

`next.config.mjs`:

```js
import { withHeadora } from "@headora/core/next";
export default withHeadora({});
```

`withHeadora()` transpiles core (it ships TypeScript source, no build step), resolves its `.js` imports to `.ts`, and redirects `/` to the default locale.

Routes are thin files that re-export core. Route segment config (`revalidate`, `dynamic`) must be written literally in your file, because Next reads it statically:

```ts
// app/[locale]/page.tsx
export { default } from "@headora/core/app/[locale]/page.tsx";
export const revalidate = 300;
```

`tsconfig.json` needs `"allowImportingTsExtensions": true`. The root `app/layout.tsx` imports the styles:

```ts
import "@headora/core/styles/headora.css";
import "@headora/core/styles/cms-home.css";
```

See the [demo site](https://github.com/ocodecommerce/headora/tree/main/sites/demo-fashion/app) for the full list of route files.

## What's included

- **Pages:** homepage (Magento CMS `home` page or preset blocks), category listing with filters, sort and pagination, product page with configurable options and reviews, Magento CMS pages, contact page.
- **Cart:** guest and customer carts via GraphQL, mini-cart drawer, checkout handoff to native Magento checkout.
- **Account:** sign in, create account, forgot password, wishlist, newsletter.
- **API routes:** `cart`, `wishlist`, `auth/*`, `reviews`, `ratings`, `newsletter`, `contact`, `handoff`, `revalidate`, `health`.
- **Theming:** presets (`@headora/preset-minimal`, `-bold`, `-classic`) turn design tokens into `--headora-*` CSS variables. Switch with `HEADORA_PRESET`; no code changes.

## Environment

| Variable | Notes |
|---|---|
| `MAGENTO_GRAPHQL_URL` | Storefront GraphQL endpoint |
| `MAGENTO_BASE_URL` | Magento base URL (checkout handoff, Magento-only links) |
| `NEXT_PUBLIC_STORE`, `NEXT_PUBLIC_LOCALE`, `NEXT_PUBLIC_CURRENCY` | Default store view, locale and currency |
| `NEXT_PUBLIC_STORES`, `NEXT_PUBLIC_LOCALES`, `NEXT_PUBLIC_CURRENCIES` | Multi-store: comma lists mapping 1:1 to Magento store views |
| `HEADORA_PRESET` | `minimal` (default), `bold` or `classic` |
| `REVALIDATE_SECRET` | At least 8 characters; guards `/api/revalidate` |
| `HEADORA_SITE_NAME`, `HEADORA_COPYRIGHT`, `HEADORA_SOCIAL_LINKS` | Header/footer text and social links |
| `HEADORA_HOME_PAGE` | Magento CMS page used as the homepage (default `home`) |
| `HEADORA_PUBLIC_URL` | Public storefront URL; keeps Magento-only links relative when on the same host |

## Magento side

Install the connector module: `composer require ocode/headora-connector && bin/magento setup:upgrade`.

## License

MIT
