"use client";
import { useState } from "react";
import { ReviewsList, type ReviewItem } from "../reviews/ReviewsList.js";
import { ReviewForm } from "../reviews/ReviewForm.js";
export function PdpTabs({ description, details, reviews, reviewCount, ratingSummary, sku, loginUrl }: {
  description: string; details: string; reviews: ReviewItem[]; reviewCount: number; ratingSummary: number; sku: string; loginUrl?: string;
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
      {tab === "desc" && <div dangerouslySetInnerHTML={{ __html: description }} />}
      {tab === "details" && <div dangerouslySetInnerHTML={{ __html: details }} />}
      {tab === "reviews" && (
        <div style={{ display: "grid", gap: 24 }}>
          <ReviewsList items={reviews} count={reviewCount} summary={ratingSummary} />
          <ReviewForm sku={sku} loginUrl={loginUrl} />
        </div>
      )}
    </section>
  );
}
