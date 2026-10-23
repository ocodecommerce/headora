import { z } from "zod";
import baseTokens from "@headora/preset-base/tokens.json";
import baseBlocks from "@headora/preset-base/blocks.json";
import minimal from "@headora/preset-minimal/preset.json";
import bold from "@headora/preset-bold/preset.json";
import classic from "@headora/preset-classic/preset.json";

export const TokensSchema = z.object({
  font: z.string(),
  fontDisplay: z.string(),
  fontsHref: z.string().default(""),
  primary: z.string(),
  accent: z.string(),
  accentDark: z.string(),
  muted: z.string(),
  border: z.string(),
  surface: z.string(),
  ribbonBg: z.string(),
  ribbonText: z.string(),
  storeBarBg: z.string(),
  highlight: z.string().default("#0000ff"),
  radius: z.number(),
  buttonRadius: z.number(),
  container: z.number(),
  header: z.object({
    search: z.boolean().default(true),
    miniCart: z.boolean().default(true),
    storeSwitcher: z.boolean().default(true),
    ribbon: z.string().default(""),
  }).default({}),
  footer: z.object({ columns: z.number().default(4) }).default({}),
});
export type ThemeTokens = z.infer<typeof TokensSchema>;

export const PresetNameSchema = z.enum(["minimal", "bold", "classic"]);
export type PresetName = z.infer<typeof PresetNameSchema>;

// Tokens come from the @headora/preset-* packages: base tokens.json + the variant's preset.json overrides.
const VARIANTS: Record<PresetName, { tokens?: Partial<ThemeTokens> }> = { minimal, bold, classic } as any;

export function getPresetName(): PresetName {
  const raw = (process.env.HEADORA_PRESET ?? "minimal").trim().toLowerCase();
  const parsed = PresetNameSchema.safeParse(raw);
  return parsed.success ? parsed.data : "minimal";
}

export function getTokens(preset?: PresetName): ThemeTokens {
  const name = preset ?? getPresetName();
  const over = VARIANTS[name]?.tokens ?? {};
  return TokensSchema.parse({
    ...baseTokens,
    ...over,
    header: { ...baseTokens.header, ...(over.header ?? {}) },
    footer: { ...baseTokens.footer, ...(over.footer ?? {}) },
  });
}

export function getHomeBlocks(): string[] {
  return [...baseBlocks.home];
}

export type FooterLink = { label: string; href: string };
export type FooterConfig = {
  columns: { title: string; links: FooterLink[] }[];
  follow: { title: string; text: string };
  subscribe: { title: string; text: string };
  legal: FooterLink[];
};
export function getFooterConfig(): FooterConfig {
  return baseBlocks.footer as FooterConfig;
}

export function tokensToCssVars(t: ThemeTokens): string {
  return [
    `--headora-font:${t.font}`,
    `--headora-font-display:${t.fontDisplay}`,
    `--headora-primary:${t.primary}`,
    `--headora-accent:${t.accent}`,
    `--headora-accent-dark:${t.accentDark}`,
    `--headora-muted:${t.muted}`,
    `--headora-border:${t.border}`,
    `--headora-surface:${t.surface}`,
    `--headora-ribbon-bg:${t.ribbonBg}`,
    `--headora-ribbon-text:${t.ribbonText}`,
    `--headora-storebar-bg:${t.storeBarBg}`,
    `--headora-highlight:${t.highlight}`,
    `--headora-radius:${t.radius}px`,
    `--headora-btn-radius:${t.buttonRadius}px`,
    `--headora-container:${t.container}px`,
  ].join(";");
}
