// Thin route: implementation lives in @headora/core. Segment config must stay literal here (Next reads it statically).
export { default } from "@headora/core/app/[locale]/page.tsx";
export const revalidate = 300;
