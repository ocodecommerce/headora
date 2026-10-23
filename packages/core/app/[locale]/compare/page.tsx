import { ComparePage } from "../../../components/product/ComparePage.js";

export const metadata = { title: "Compare Products", robots: { index: false } };

export default async function Compare({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <ComparePage locale={locale} />;
}
