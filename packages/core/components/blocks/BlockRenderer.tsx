"use client";
import { Component, type ReactNode } from "react";
import type { PresetName } from "../../lib/theme.js";
import { ProductCard } from "../catalog/ProductCard.js";

type BlockProps = { variant?: PresetName; [k: string]: any };

const BLOCKS: Record<string, (p: BlockProps) => any> = {
  Hero: ({ html, locale = "en", categories = [] }: any) => (
    <section className="hd-hero">
      <div className="hd-container hd-hero__inner">
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          // Preset hero when the CMS hero block (HEADORA_HERO_BLOCK) is absent.
          <div>
            <h1>New arrivals</h1>
            <p>Discover the latest pieces from our collection.</p>
            {categories[0] ? (
              <p style={{ marginTop: 24 }}>
                <a className="hd-btn" href={`/${locale}/${categories[0].url_path}.html`}>Shop now</a>
              </p>
            ) : null}
          </div>
        )}
      </div>
    </section>
  ),
  CategoryTiles: ({ categories = [], locale = "en" }: any) => {
    if (!categories.length) return null;
    return (
      <section className="hd-section hd-container">
        <h2 className="hd-section__title">Shop by category</h2>
        <ul className="hd-tiles">
          {categories.map((c: any) => (
            <li key={c.uid} className="hd-tile">
              <a href={`/${locale}/${c.url_path}.html`}>
                {c.image ? (
                  <img className="hd-tile__img" src={c.image} alt={c.name} loading="lazy" />
                ) : (
                  <div className="hd-tile__img" />
                )}
                <span className="hd-tile__name">{c.name}</span>
                {c.product_count != null ? <span className="hd-tile__count">{c.product_count} items</span> : null}
              </a>
            </li>
          ))}
        </ul>
      </section>
    );
  },
  ProductCarousel: ({ products = [], locale = "en" }: any) => {
    if (!products.length) return null;
    return (
      <section className="hd-section hd-container">
        <h2 className="hd-section__title">Featured products</h2>
        <ul className="hd-carousel">
          {products.map((p: any) => (
            <li key={p.sku}><ProductCard product={p} locale={locale} /></li>
          ))}
        </ul>
      </section>
    );
  },
  CMSHtml: ({ html }: any) => (html ? <div className="hd-container" dangerouslySetInnerHTML={{ __html: html }} /> : null),
};

class BlockErrorBoundary extends Component<{ type: string; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <section className="hd-container hd-empty">Block &ldquo;{this.props.type}&rdquo; failed to render.</section>;
    return this.props.children;
  }
}

export function BlockRenderer({ blocks, variant = "minimal" }: { blocks: { type: string; [k: string]: any }[]; variant?: PresetName }) {
  return (
    <>
      {blocks.map((b, i) => {
        const C = (b.type && (BLOCKS as any)[b.type]) ?? BLOCKS.CMSHtml;
        return (
          <BlockErrorBoundary key={i} type={b.type ?? "CMSHtml"}>
            <C {...b} variant={variant} />
          </BlockErrorBoundary>
        );
      })}
    </>
  );
}
