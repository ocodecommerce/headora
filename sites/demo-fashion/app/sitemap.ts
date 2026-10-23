// Thin route: implementation lives in @headora/core. Segment config must stay literal here (Next reads it statically).
export { default } from "@headora/core/app/sitemap.ts";
export const revalidate = 3600;
