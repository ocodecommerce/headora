# @headora/preset-standard

The **standard** Headora storefront look: Bricolage Grotesque + Inter, cobalt accent, hero slider homepage, pill-style PLP, editorial PDP, basket page and a headless one-page checkout. Works with Magento (Venia) sample data out of the box.

Installed automatically with [`@headora/core`](https://www.npmjs.com/package/@headora/core). Select it with `HEADORA_PRESET=standard` in your storefront's `.env`.

Hero slides, the "shop the look" banner and USP row are set in `preset.json` (`home`). Image paths are served from the site's `public/` folder (`/std/hero-*.webp` ship with `create-headora-app`). `{category:N}` links to the Nth menu category, `{locale}` to the active locale.

Start a store: `npx create-headora-app my-store`

License: MIT
