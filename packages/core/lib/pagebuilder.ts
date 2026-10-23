// Magento PageBuilder HTML needs two things the Magento storefront does in JS:
// - column/row background images live in data-background-images JSON, not in CSS;
// - "html" content types are stored entity-escaped and must be decoded before render.
// Its <style> rules are scoped to `#html-body`, so render the result inside an element with that id.
const decode = (s: string) =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, "&");

export function preparePageBuilder(html: string): string {
  if (!html) return html;
  return html
    .replace(/data-background-images="([^"]*)"([^>]*?)data-pb-style="([^"]+)"/g, (whole, raw: string, mid: string, id: string) => {
      let url = "";
      try { url = JSON.parse(decode(raw).replace(/\\"/g, '"')).desktop_image ?? ""; } catch { /* no image */ }
      if (!url || !/^https?:\/\//.test(url)) return whole;
      return `${whole} style="background-image:url('${url.replace(/'/g, "%27")}')"`;
    })
    .replace(/(<div data-content-type="html"[^>]*>)([\s\S]*?)(<\/div>)/g, (_, open: string, body: string, close: string) => open + decode(body) + close);
}
