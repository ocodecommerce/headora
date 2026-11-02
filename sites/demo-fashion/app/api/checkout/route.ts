// Thin route: implementation lives in @headora/core. Segment config must stay literal here (Next reads it statically).
export { GET, POST } from "@headora/core/app/api/checkout/route.ts";
export const revalidate = 0;
