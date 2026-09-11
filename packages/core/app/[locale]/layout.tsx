import type { ReactNode } from "react";
import { AuthModals } from "../../components/auth/AuthModals.js";
export async function generateMetadata() {
  return { title: { default: "Headora 2.0", template: "%s | Headora" } };
}
export default function LocaleLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "var(--headora-font, Inter)" }}>
        {children}
        <AuthModals />
      </body>
    </html>
  );
}
