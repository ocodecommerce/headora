"use client";
import { Component, type ReactNode } from "react";
import type { PresetName } from "../../lib/theme.js";

type BlockProps = { variant?: PresetName; [k: string]: any };

const BLOCKS: Record<string, (p: BlockProps) => any> = {
  Hero: ({ variant }) => (
    <section
      style={{
        padding: variant === "bold" ? 64 : 48,
        background: variant === "bold" ? "var(--headora-primary)" : "transparent",
        color: variant === "bold" ? "#fff" : "inherit",
        borderRadius: "var(--headora-radius)",
      }}
    >
      <h1 style={{ color: variant === "minimal" ? "inherit" : "var(--headora-accent)" }}>
        Preset hero ({variant ?? "minimal"}) - override in sites/&lt;site&gt;/themes/child
      </h1>
    </section>
  ),
  CategoryTiles: () => <section style={{ padding: 24 }}>Category tiles from Magento categoryTree</section>,
  ProductCarousel: () => <section style={{ padding: 24 }}>Product carousel from Magento products query</section>,
  CMSHtml: ({ html }: any) => <div dangerouslySetInnerHTML={{ __html: html ?? "" }} />,
};

class BlockErrorBoundary extends Component<{ type: string; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <section style={{ padding: 16 }}>Block &ldquo;{this.props.type}&rdquo; failed to render.</section>;
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
