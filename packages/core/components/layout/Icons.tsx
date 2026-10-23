import type { ReactNode } from "react";

// Inline stroke icons (currentColor) so the shell needs no icon dependency.
// Search/bag/chevron/social are the same Feather icons the legacy v1 storefront used.
const base = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" {...base}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);
// Matches legacy personHeader.png (head + rounded body block).
export const UserIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" {...base} strokeWidth={1.5}><circle cx="12" cy="7" r="4.25" /><path d="M4 21.25v-2.5A4.25 4.25 0 0 1 8.25 14.5h7.5A4.25 4.25 0 0 1 20 18.75v2.5Z" /></svg>
);
export const BagIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" {...base}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
);
export const MenuIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" {...base}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const CaretIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" className="hd-nav__caret" {...base}><polyline points="6 9 12 15 18 9" /></svg>
);

const SOCIAL: Record<string, ReactNode> = {
  instagram: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></>,
  facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  twitter: <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />,
  youtube: <><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></>,
};
export const SocialIcon = ({ name }: { name: string }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...base}>{SOCIAL[name.toLowerCase()] ?? <circle cx="12" cy="12" r="9" />}</svg>
);
