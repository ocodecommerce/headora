# Headora 2.0

> Headora 2.0 is a vertical-agnostic headless storefront for Magento 2 built on Next.js App Router. One base preset with minimal/bold/classic style variants, multi-store auto-discovery with locale routing, all Magento product types, headless review writes (moderation stays in Magento admin), and hybrid checkout — browse headless, pay via native Magento `/checkout` through `/api/handoff`. Ships with a bare-theme content contract (`audit:cms`), health-gated blue-green deploys, PM2 cluster reloads, and a Magento revalidate observer.

## Branches

| Branch | Purpose |
|---|---|
| `headora2.0` | Active 2.0 line (you are here) |
| `rebuild/2.0` | Prior 2.0 line |
| `dev` | Legacy v1 deploy line — CI and the server deploy script target this branch only |
| `main` | Default branch |

> Gap: `.github/workflows/deploy.yml` triggers on `dev` pushes only, and the server checks out `dev`. 2.0 branches get no CI and cannot ship through this pipeline until the trigger is extended.

## Quick start

```bash
cp sites/demo-fashion/.env.example sites/demo-fashion/.env  # then point MAGENTO_* at a real backend
npm install            # at repo ROOT (npm workspaces). Do NOT `npm --prefix sites/... install`
npm run doctor         # version contract + theme JSON + Magento reachability
npm run dev:fashion    # dev server for the demo site
```

`npm run doctor` fails without a reachable Magento backend — that is expected when `.env` still points at the `magento.test` placeholder. `Versions OK` + `Theme JSON OK` is the green signal for a backend-less checkout.

## Scripts (repo root)

| Script | What it does |
|---|---|
| `npm run dev:fashion` | `next dev` for `sites/demo-fashion` |
| `npm run build:core` | Build `@headora/core` |
| `npm run doctor` | Gate: site pin must match core version (`1.0.0-beta.0`), `HEADORA_PRESET` must be `minimal\|bold\|classic`, preset JSONs must parse, Magento GraphQL must answer |
| `npm run audit:cms` | Bare-theme content audit against the live backend (`--strict` exits 1 if custom content is live) |

## Environment (`sites/demo-fashion/.env`)

| Variable | Required | Notes |
|---|---|---|
| `MAGENTO_GRAPHQL_URL` | Yes | Storefront GraphQL endpoint |
| `MAGENTO_BASE_URL` | Yes | Used for native-checkout handoff redirects |
| `NEXT_PUBLIC_STORE` | Yes | Default store view (`Store` header per request) |
| `NEXT_PUBLIC_LOCALE` / `NEXT_PUBLIC_CURRENCY` | Yes | Defaults for locale routing / pricing |
| `NEXT_PUBLIC_STORES` / `NEXT_PUBLIC_LOCALES` / `NEXT_PUBLIC_CURRENCIES` | Multi-store | Comma lists mapping 1:1 to Magento store views |
| `HEADORA_PRESET` | Yes | `minimal` (default) \| `bold` \| `classic`. Config-only theming — never code |
| `REVALIDATE_SECRET` | Yes | Min 8 chars. Guards `/api/revalidate` |
| `CHECKOUT_STRATEGY` | Yes | Locked to `native-magento` |
| `COMMERCE_FEATURES` | Yes | `os` (default) \| `adobe` |
| `NEXT_URL` + `HEADORA_REVALIDATE_SECRET` | Magento server side | Env for the `Revalidate` observer (purge tags on product save) |

## Architecture

- **Presets, not verticals.** `packages/preset-base` (`tokens.json`, `blocks.json`) plus `minimal` / `bold` / `classic` variants (`preset.json`). Switching theme is config (`HEADORA_PRESET`); `packages/core/lib/theme.ts` validates and resolves tokens. Child override: `sites/<site>/themes/child/tokens.json` (deep-merge).
- **Multi-store.** Magento websites/stores/views; locale routing via `app/[locale]`; `Store` (and currency) resolved per request (`packages/core/lib/config.ts`, `stores.ts` → `magento.ts`).
- **Product types.** Simple, configurable, grouped, bundle, downloadable, virtual per Magento defaults (coverage end-to-end is unverified — treat as intent, not tested fact).
- **Reviews (headless write).** `POST /api/reviews` → `createProductReview`; login-only; ratings metadata per store; top-10 highest-rated surface; moderation stays in Magento admin.
- **Hybrid checkout.** Next.js is browse-only. `/api/handoff?masked_quote=…` 302-redirects to Magento native `/headora/handoff` for `/checkout`.
- **Auth.** Headless login/register/logout/forgot via `app/api/auth/*` backed by Magento GraphQL (`packages/core/graphql/auth.ts`), with modal UI (`AuthModals.tsx`).

## API routes (`packages/core/app/api`)

| Route | Notes |
|---|---|
| `GET /api/health` | Liveness. Always HTTP 200 with `"ok":true`; reports `magento: ok\|degraded\|unconfigured` and `preset`. Degraded Magento does **not** fail the endpoint |
| `api/auth/login|register|logout|forgot` | Headless customer auth |
| `GET /api/ratings`, `POST /api/reviews` | Ratings metadata + review writes |
| `POST /api/revalidate` | Cache-tag purge, guarded by `REVALIDATE_SECRET` |
| `GET /api/handoff` | Native-checkout redirect (`masked_quote` → Magento) |

## CMS content contract (locked agnostic rules)

Live backend must serve only Magento defaults (`home`, `no-route`, `enable-cookies`, `privacy-policy-cookie-restriction-mode`) plus headora-owned slots (`headora_hero_<locale>` blocks, neutral content). No `sell-*`, jewelry, or `venia-*` catalog. Enforce with `npm run audit:cms` (`--strict` fails on custom content live).

- Vertical-agnostic: one base preset + style variants minimal/bold/classic. Sample data interchangeable.
- Multi-store: default Magento websites/stores/views. Auto-discovered, locale routing `app/[locale]`, Store header per request.
- Product types: all magento2 defaults — simple, configurable, grouped, bundle, downloadable, virtual.
- Reviews: headless write via POST /api/reviews → createProductReview. Moderation stays in Magento admin.

## Deploy & ops

- **PM2:** `ecosystem.config.cjs` (cluster, `instances: 2`). Always `pm2 reload headora --update-env`, never `restart`, for zero-downtime deploys.
- **Docker:** `docker-compose.yml` runs `nextjs-blue` by default (healthy-gated behind nginx); `green` profile for blue-green swaps; `legacy` profile for the old single-container shape. Image `ghcr.io/ocodecommerce/headora:${TAG:-1.0}`.
- **Pipeline:** `gate` job (`npm ci` → `doctor` → typecheck) then SSH deploy: pull, `npm ci`, `doctor`, workspace build, PM2 reload, then a 30×5s `/api/health` gate checking `"ok":true` with automatic `git reset --hard $BEFORE` rollback on failure.
- **Magento observer:** `packages/magento-connector/Observer/Revalidate.php` POSTs purge tags (`pdp:<sku>`, `reviews:<sku>`, `cat:<id>`) to `/api/revalidate` on product save. Best-effort — never blocks the admin save.

## Repo map

```text
packages/core/                  App Router core (app/[locale], app/api, components, graphql, lib)
packages/preset-base/           tokens.json + blocks.json (single source of truth)
packages/preset-minimal|bold|classic/
packages/cli/                   doctor.mjs, audit-cms.mjs
packages/magento-connector/     Magento 2 module (Revalidate observer)
sites/demo-fashion/             Demo site (.env.example, headora.config.ts)
docker/ + docker-compose.yml    nginx + blue-green storefront containers
ecosystem.config.cjs            PM2 cluster config
legacy/                         Frozen v1 Pages-router code (archive — see its README)
```

## Known limitations

- No `packages/core/tsconfig.json`, so the CI typecheck step always prints "skipping strict gate" instead of checking types.
- `doctor` hard-fails without a reachable Magento backend; with placeholder URLs only the version/theme checks are meaningful.
- Never commit `node_modules` — including `sites/demo-fashion/node_modules/` from a stray `--prefix` install (root `.gitignore` covers only root-level).
- Local toolchain is Node 25 / npm 11; CI pins Node 20. Next 15.1.2 carries a known CVE (see npm audit) — upgrade path is open.
