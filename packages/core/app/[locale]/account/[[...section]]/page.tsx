import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPresetName } from "../../../../lib/theme.js";
import { getConfig } from "../../../../lib/magento.js";
import { AccountPage } from "../../../../components/standard/AccountPage.js";
import { ACCOUNT_SECTIONS } from "../../../../components/standard/accountSections.js";

export const revalidate = 0;
export const metadata: Metadata = { title: "My account", robots: { index: false } };

// Customer account, Venia-style: /<locale>/account/<order-history|wishlist|address-book|communications|account-information>.
export default async function Account({ params }: { params: Promise<{ locale: string; section?: string[] }> }) {
  const { locale, section } = await params;
  // Other presets keep the native Magento account pages.
  if (getPresetName() !== "standard") redirect(`${getConfig().MAGENTO_BASE_URL.replace(/\/$/, "")}/customer/account`);
  const slug = section?.[0] ?? "order-history";
  if ((section?.length ?? 0) > 1 || !ACCOUNT_SECTIONS.some((s) => s.slug === slug)) notFound();
  return <AccountPage locale={locale} section={slug} />;
}
