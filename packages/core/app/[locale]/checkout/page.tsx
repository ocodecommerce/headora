import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Checkout } from "../../../components/standard/Checkout.js";
import { getPresetName } from "../../../lib/theme.js";

export const revalidate = 0;
export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

// Headless one-page checkout (standard preset). Other presets hand off to native Magento checkout.
export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (getPresetName() !== "standard") redirect("/api/handoff");
  return <Checkout locale={locale} defaultCountry={(locale.split("-")[1] ?? "US").toUpperCase()} />;
}
