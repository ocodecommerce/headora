# create-headora-app

Create a [Headora](https://github.com/ocodecommerce/headora) storefront: a headless Next.js (App Router) frontend for Magento 2 / Adobe Commerce.

```bash
npx create-headora-app my-store
cd my-store
npm run dev
```

It asks for:

| Prompt | Example |
|---|---|
| Project folder | `my-store` |
| Magento GraphQL URL | `https://shop.example.com/graphql` |
| Magento store view code | `default` |
| Currency | `USD` |
| Preset | `minimal`, `bold` or `classic` |
| Store name | `My Shop` (header/footer text when Magento has no logo) |

Skip the prompts with options:

```bash
npx create-headora-app my-store --url=https://shop.example.com/graphql --store=default \
  --currency=USD --preset=bold --site-name="My Shop" --yes
```

| Option | Effect |
|---|---|
| `--yes` | Use the defaults for anything not given |
| `--no-install` | Create the files only; run `npm install` yourself |
| `--local=/path/to/headora` | Install `@headora/*` from a Headora checkout (npm-pack tarballs) instead of npm |

## What you get

- `app/`: thin route files that re-export pages and API routes from [`@headora/core`](https://www.npmjs.com/package/@headora/core).
- `.env`: your answers plus a random `REVALIDATE_SECRET`. All variables are documented in `.env.example`.
- `next.config.mjs` using `withHeadora()`, and `headora.config.ts`.

The CLI checks that the Magento GraphQL URL answers and warns if it doesn't; fix `MAGENTO_GRAPHQL_URL` in `.env` later if needed.

## Magento side

Install the connector module on the Magento store (it adds the `headoraConfig` GraphQL query and the `/headora/handoff` cart-to-checkout redirect):

```bash
composer require ocode/headora-connector
bin/magento setup:upgrade
```

In production, route `/headora/*`, `/checkout`, `/customer`, `/sales` and the other Magento-only paths to Magento, and everything else to Next.js.

## Requirements

Node.js 20 or newer, Magento 2.4.x with GraphQL enabled.

## License

MIT
