// Thin route: implementation lives in @headora/core. Segment config must stay literal here (Next reads it statically).
export { GET, POST, DELETE } from "@headora/core/app/api/cart/route.ts";
export const revalidate = 0;
