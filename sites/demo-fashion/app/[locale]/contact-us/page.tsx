// Thin route: implementation lives in @headora/core. Segment config must stay literal here (Next reads it statically).
export { default, metadata } from "@headora/core/app/[locale]/contact-us/page.tsx";
export const revalidate = 300;
