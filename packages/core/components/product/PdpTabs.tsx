"use client";
import { useState } from "react";
import { ReviewsList, type ReviewItem } from "../reviews/ReviewsList.js";
import { ReviewForm } from "../reviews/ReviewForm.js";
// Magento HTML is admin-authored. Strip scripts + event handlers before inject.
function sanitize(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "");
}
export function PdpTabs({ description, details, reviews, reviewCount, ratingSummary, sku, locale, loginUrl }: {
  description: string; details: string; reviews: ReviewItem[]; reviewCount: number; ratingSummary: number; sku: string; locale?: string; loginUrl?: string;
}) {
  const [tab, setTab] = useState<"desc" | "details" | "reviews">("desc");
  return (
    <section>
      <nav style={{ display: "flex", gap: 8 }}>
        {(["desc", "details", "reviews"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} aria-pressed={tab === t} style={{ fontWeight: tab === t ? 700 : 400 }}>
            {t === "desc" ? "Description" : t === "details" ? "Details" : `Reviews (${reviewCount})`}
          </button>
        ))}
      </nav>
      {tab === "desc" && <div dangerouslySetInnerHTML={{ __html: sanitize(description) }} />}
      {tab === "details" && <div dangerouslySetInnerHTML={{ __html: sanitize(details) }} />}
      {tab === "reviews" && (
        <div style={{ display: "grid", gap: 24 }}>
          <ReviewsList items={reviews} count={reviewCount} ratingSummary={ratingSummary} />
          <ReviewForm sku={sku} locale={locale} loginUrl={loginUrl} />
        </div>
      )}
    </section>
  );
}
