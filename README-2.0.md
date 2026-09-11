# Headora 2.0 (rebuild/2.0)
Legacy Pages-router code preserved in `/legacy`.
New App Router core in `packages/core`. Presets in `packages/preset-*`.
Quick start: cp sites/demo-fashion/.env.example sites/demo-fashion/.env && npm --prefix sites/demo-fashion install && npm --prefix sites/demo-fashion run dev
Hybrid checkout: Next.js browse only, Magento native /checkout via /api/handoff.

## Agnostic rules (locked)
- Vertical-agnostic: one base preset + style variants minimal/bold/classic. Sample data interchangeable.
- Multi-store: default Magento websites/stores/views. Auto-discovered, locale routing `app/[locale]`, Store header per request.
- Product types: all magento2 defaults - simple, configurable, grouped, bundle, downloadable, virtual.
- Reviews: headless write via POST /api/reviews -> createProductReview. Moderation stays in Magento admin.
