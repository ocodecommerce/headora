import type { Metadata } from "next";
import { CartPage } from "../../../components/standard/CartPage.js";
import { getPresetName, getStdHome } from "../../../lib/theme.js";
import { getConfig } from "../../../lib/magento.js";
import { redirect } from "next/navigation";

export const revalidate = 0;
export const metadata: Metadata = { title: "Your basket", robots: { index: false } };

// Basket page (standard preset). Other presets keep the cart drawer + native Magento cart.
export default async function Cart({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (getPresetName() !== "standard") redirect(`${getConfig().MAGENTO_BASE_URL.replace(/\/$/, "")}/checkout/cart`);
  return <CartPage locale={locale} freeOver={getStdHome().freeShippingOver} />;
}
