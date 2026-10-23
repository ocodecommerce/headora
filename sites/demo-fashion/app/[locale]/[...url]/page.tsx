// Thin route: implementation lives in @headora/core. Segment config must stay literal here (Next reads it statically).
export { default, generateMetadata } from "@headora/core/app/[locale]/[...url]/page.tsx";
export const revalidate = 120;
