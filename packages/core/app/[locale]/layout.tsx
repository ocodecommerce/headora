import type { ReactNode } from "react";
import { AuthModals } from "../../components/auth/AuthModals.js";
import { getPresetName, getTokens, tokensToCssVars } from "../../lib/theme.js";

export async function generateMetadata() {
  return { title: { default: "Headora 2.0", template: "%s | Headora" } };
}

// NOTE: no <html>/<body> here — the site root layout owns the document.
// This layout only applies the active preset (tokens -> CSS vars) + global modals,
// so a theme switch never unmounts functionality providers.
export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const preset = getPresetName();
  const cssVars = tokensToCssVars(getTokens(preset));
  const { locale } = await params;
  return (
    <div data-headora-preset={preset} style={{ margin: 0, fontFamily: "var(--headora-font, Inter)", ["--headora-preset" as any]: preset } as any}>
      <style>{`:root{${cssVars}}`}</style>
      {children}
      <AuthModals locale={locale} />
    </div>
  );
}
