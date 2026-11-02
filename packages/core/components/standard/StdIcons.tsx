// Standard preset icon set (stroke, currentColor). Basket and account differ from Venia's bag/person.
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export const BasketIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...base}><path d="M3 10h18l-1.8 8.6a2 2 0 0 1-2 1.6H6.8a2 2 0 0 1-2-1.6z" /><path d="M8 10l3.2-6M16 10l-3.2-6M9.5 13.5v3.5M14.5 13.5v3.5" /></svg>
);
export const AccountIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...base}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="10" r="3" /><path d="M6.6 18.2a6.5 6.5 0 0 1 10.8 0" /></svg>
);
export const HeartLineIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...base}><path d="M12 20s-7.5-4.6-7.5-10.1A4.4 4.4 0 0 1 12 7.3a4.4 4.4 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" /></svg>
);
export const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...base} strokeWidth={2}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const ChevronIcon = ({ dir }: { dir: "left" | "right" }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...base} strokeWidth={2}><path d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} /></svg>
);
export const UspIcon = ({ i }: { i: number }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...base}>
    {[
      <path key="0" d="M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a1.5 1.5 0 1 0 0-.01M17 19a1.5 1.5 0 1 0 0-.01" />,
      <path key="1" d="M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4" />,
      <path key="2" d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6zM9 12l2 2 4-4" />,
      <path key="3" d="M4 13a8 8 0 0 1 16 0v4a2 2 0 0 1-2 2h-1v-6h3M4 13v4a2 2 0 0 0 2 2h1v-6H4" />,
    ][i % 4]}
  </svg>
);
