import { z } from "zod";

export const TokensSchema = z.object({
  font: z.string().default("Inter"),
  primary: z.string().default("#111111"),
  accent: z.string().default("#2E7D32"),
  radius: z.number().default(10),
  header: z.object({ search: z.boolean().default(true), miniCart: z.boolean().default(true), storeSwitcher: z.boolean().default(true) }).default({}),
  footer: z.object({ columns: z.number().default(4) }).default({}),
});
export type ThemeTokens = z.infer<typeof TokensSchema>;

export const PresetNameSchema = z.enum(["minimal", "bold", "classic"]);
export type PresetName = z.infer<typeof PresetNameSchema>;

// Mirrors packages/preset-base/tokens.json + per-variant preset.json overrides.
// Single source of truth until preset packages export real code.
// Child override: sites/<site>/themes/child/tokens.json (optional, deep-merges on top).
const BASE_TOKENS: ThemeTokens = {
  font: "Inter", primary: "#111111", accent: "#2E7D32", radius: 10,
  header: { search: true, miniCart: true, storeSwitcher: true }, footer: { columns: 4 },
};
const VARIANT_OVERRIDES: Record<PresetName, Partial<ThemeTokens>> = {
  minimal: { primary: "#111111", accent: "#111111" },
  bold: { primary: "#0B1F3A", accent: "#E53935" },
  classic: { primary: "#1A1A1A", accent: "#2E7D32" },
};

const BASE_HOME_BLOCKS = ["Hero", "CategoryTiles", "ProductCarousel", "CMSHtml"];

export function getPresetName(): PresetName {
  const raw = (process.env.HEADORA_PRESET ?? "minimal").trim().toLowerCase();
  const parsed = PresetNameSchema.safeParse(raw);
  return parsed.success ? parsed.data : "minimal";
}

export function getTokens(preset?: PresetName): ThemeTokens {
  const name = preset ?? getPresetName();
  return TokensSchema.parse({ ...BASE_TOKENS, ...(VARIANT_OVERRIDES[name] ?? {}) });
}

export function getHomeBlocks(): string[] {
  return [...BASE_HOME_BLOCKS];
}

export function tokensToCssVars(t: ThemeTokens): string {
  return [
    `--headora-font:${t.font}`,
    `--headora-primary:${t.primary}`,
    `--headora-accent:${t.accent}`,
    `--headora-radius:${t.radius}px`,
  ].join(";");
}
