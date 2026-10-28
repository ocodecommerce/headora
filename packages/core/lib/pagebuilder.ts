// Magento PageBuilder HTML needs two things the Magento storefront does in JS:
// - column/row background images live in data-background-images JSON, not in CSS;
// - "html" content types are stored entity-escaped and must be decoded before render.
// Its <style> rules are scoped to `#html-body`, so render the result inside an element with that id.
const decode = (s: string) =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, "&");

export function preparePageBuilder(html: string): string {
  if (!html) return html;
  return html
    .replace(/data-background-images="([^"]*)"([^>]*?)data-pb-style="([^"]+)"/g, (whole, raw: string) => {
      let img: { desktop_image?: string; mobile_image?: string } = {};
      try { img = JSON.parse(decode(raw).replace(/\\"/g, '"')); } catch { /* no image */ }
      const css = (u?: string) => (u && /^https?:\/\//.test(u) ? `url('${u.replace(/'/g, "%27")}')` : "");
      const desktop = css(img.desktop_image), mobile = css(img.mobile_image);
      if (!desktop && !mobile) return whole;
      // Mobile image via a custom property: headora.css swaps it in below 768px only (as Magento does).
      return `${whole} style="${desktop ? `background-image:${desktop};` : ""}${mobile ? `--hd-pb-mobile:${mobile};` : ""}"`;
    })
    .replace(/(<div data-content-type="html"[^>]*>)([\s\S]*?)(<\/div>)/g, (_, open: string, body: string, close: string) => open + decode(body) + close);
}

export type PbProducts = { urlKeys: string[]; carousel: boolean };
// html = balanced markup; el = an ancestor <div> of a products widget (rendered as a React element).
export type PbNode = { html: string } | { el: Record<string, string>; children: PbNode[] } | PbProducts;

// Index just past the </div> closing the <div> that opens at `at`.
function divEnd(html: string, at: number): number {
  const tag = /<\/?div\b/g;
  tag.lastIndex = at;
  let depth = 0;
  for (let m; (m = tag.exec(html)); ) {
    depth += m[0] === "<div" ? 1 : -1;
    if (!depth) return html.indexOf(">", m.index) + 1;
  }
  return html.length;
}

// The "products" content type is Magento's Luma widget HTML (its forms post to Magento). Like
// Venia, keep only each widget's product URL keys so it renders as headless cards. The widget's
// ancestor <div>s become elements, so every raw-HTML chunk stays balanced (no hydration mismatch).
export function pageBuilderTree(html: string): PbNode[] {
  const at = html.search(/<div[^>]*data-content-type="products"/);
  if (at < 0) return html ? [{ html }] : [];
  // Outermost <div> still open at the widget, if any.
  let outer = -1;
  const tag = /<\/?div\b/g;
  for (let m, stack: number[] = []; (m = tag.exec(html)) && m.index < at; ) {
    if (m[0] === "<div") stack.push(m.index); else stack.pop();
    outer = stack.length ? stack[0] : -1;
  }
  if (outer >= 0) {
    const open = html.indexOf(">", outer) + 1, end = divEnd(html, outer), close = html.lastIndexOf("</div", end);
    return [...pageBuilderTree(html.slice(0, outer)), { el: attrs(html.slice(outer, open)), children: pageBuilderTree(html.slice(open, close)) }, ...pageBuilderTree(html.slice(end))];
  }
  const end = divEnd(html, at), widget = html.slice(at, end);
  const urlKeys = [...new Set([...widget.matchAll(/class="product-item-link"[^>]*?href="([^"]+)"|href="([^"]+)"[^>]*?class="product-item-link"/g)]
    .map((m) => (m[1] ?? m[2]).split(/[?#]/)[0].split("/").pop()!.replace(/\.html$/, "")).filter(Boolean))];
  return [...pageBuilderTree(html.slice(0, at)), { urlKeys, carousel: /data-appearance="carousel"/.test(widget.slice(0, widget.indexOf(">"))) }, ...pageBuilderTree(html.slice(end))];
}

// `<div a="b" c>` -> { a: "b", c: "" } with entities decoded (React re-escapes on output).
function attrs(openTag: string): Record<string, string> {
  return Object.fromEntries([...openTag.slice(4, -1).matchAll(/([\w:-]+)(?:="([^"]*)")?/g)].map((m) => [m[1], decode(m[2] ?? "")]));
}
