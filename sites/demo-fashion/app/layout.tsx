import type { ReactNode } from "react";
import "@headora/core/styles/headora.css";
import "@headora/core/styles/cms-home.css";

// Site-owned document shell. Core layouts render inside <body>.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
