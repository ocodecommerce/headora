// Thin route: implementation lives in @headora/core. Segment config must stay literal here (Next reads it statically).
export { GET } from "@headora/core/app/api/search/route.ts";
export const revalidate = 0;
