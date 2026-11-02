import { BASE } from "./base.js";
// Resized product images through Next's built-in optimizer (/_next/image: AVIF/WebP, cached).
// Only hosts withHeadora() allowed in images.remotePatterns are rewritten (it also inlines them as
// NEXT_PUBLIC_HEADORA_IMAGE_HOSTS); any other URL is returned unchanged, so a media host that isn't
// configured shows the original image instead of a broken one.
// Widths must be in Next's default imageSizes/deviceSizes.
const HOSTS = new Set((process.env.NEXT_PUBLIC_HEADORA_IMAGE_HOSTS ?? "").split(",").filter(Boolean));

function allowed(url: string): boolean {
  try { return HOSTS.has(new URL(url).host); } catch { return false; }
}

export function optimized(url: string, width: number, quality = 75): string {
  return allowed(url) ? `${BASE}/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=${quality}` : url;
}

export function srcSet(url: string, widths: number[] = [256, 384, 640, 828]): string | undefined {
  return allowed(url) ? widths.map((w) => `${optimized(url, w)} ${w}w`).join(", ") : undefined;
}
