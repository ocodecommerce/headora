# Headora 2.0

> Headora 2.0 is a vertical-agnostic headless storefront for Magento 2 built on Next.js App Router. One base preset with minimal/bold/classic style variants, multi-store auto-discovery with locale routing, all Magento product types, headless review writes (moderation stays in Magento admin), and hybrid checkout — browse headless, pay via native Magento `/checkout` through `/api/handoff`. Ships with a bare-theme content contract (`audit:cms`), health-gated blue-green deploys, PM2 cluster reloads, and a Magento revalidate observer.

Legacy Pages-router code preserved in `/legacy`.
New App Router core in `packages/core`. Presets in `packages/preset-*`.
Quick start: cp sites/demo-fashion/.env.example sites/demo-fashion/.env && npm --prefix sites/demo-fashion install && npm --prefix sites/demo-fashion run dev
Hybrid checkout: Next.js browse only, Magento native /checkout via /api/handoff.

## Agnostic rules (locked)
- Vertical-agnostic: one base preset + style variants minimal/bold/classic. Sample data interchangeable.
- Multi-store: default Magento websites/stores/views. Auto-discovered, locale routing `app/[locale]`, Store header per request.
- Product types: all magento2 defaults - simple, configurable, grouped, bundle, downloadable, virtual.
- Reviews: headless write via POST /api/reviews -> createProductReview. Moderation stays in Magento admin.
- Bare-theme content contract (headora, not venia): live backend must serve only Magento defaults
  (`home`, `no-route`, `enable-cookies`, `privacy-policy-cookie-restriction-mode`) plus headora-owned
  slots (`headora_hero_<locale>` blocks, neutral content). No `sell-*`, jewelry, or `venia-*` catalog.
  Enforce with `npm run audit:cms` (`--strict` fails on custom content live).
