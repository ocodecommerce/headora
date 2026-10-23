import type { PresetName } from "../../lib/theme.js";
import { ProductCard, type CardProduct } from "./ProductCard.js";

export function ProductGrid({
  items,
  locale,
}: {
  items: CardProduct[];
  locale: string;
  variant?: PresetName;
}) {
  if (!items?.length) return <p className="hd-empty">No products in this category.</p>;

  return (
    <ul className="hd-grid">
      {items.map((p) => (
        <li key={p.sku}>
          <ProductCard product={p} locale={locale} actions />
          {/* Venia GalleryItemShimmer: image, name, price, add-to-cart; shown while filters load in place */}
          <div className="hd-shimmer-card" aria-hidden="true">
            <span className="hd-shimmer hd-shimmer--img" />
            <span className="hd-shimmer hd-shimmer--name" />
            <span className="hd-shimmer hd-shimmer--price" />
            <span className="hd-shimmer hd-shimmer--btn" />
          </div>
        </li>
      ))}
    </ul>
  );
}
