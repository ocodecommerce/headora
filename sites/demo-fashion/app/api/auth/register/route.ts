// Thin route: implementation lives in @headora/core. Segment config must stay literal here (Next reads it statically).
export { POST } from "@headora/core/app/api/auth/register/route.ts";
export const revalidate = 0;
