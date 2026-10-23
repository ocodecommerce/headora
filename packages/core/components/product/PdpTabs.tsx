"use client";
import { useEffect, useState } from "react";
import { ReviewsList, type ReviewItem } from "../reviews/ReviewsList.js";
// Magento HTML is admin-authored. Strip scripts + event handlers before inject.
function sanitize(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "");
}
type Tab = "desc" | "details" | "reviews";
export type DetailRow = { label: string; values: string[] };

export function PdpTabs({ description, details, reviews, reviewCount, ratingSummary, sku, locale, loginUrl }: {
  description: string; details: DetailRow[]; reviews: ReviewItem[]; reviewCount: number; ratingSummary: number; sku: string; locale?: string; loginUrl?: string;
}) {
  const tabs = (["desc", "details", "reviews"] as Tab[]).filter((t) => t === "reviews" || (t === "desc" ? description : details.length));
  const [tab, setTab] = useState<Tab>(tabs[0]);
  // "Be the first to review this product." links to #hd-tab-reviews: open that tab.
  useEffect(() => {
    const sync = () => { if (window.location.hash === "#hd-tab-reviews") setTab("reviews"); };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  return (
    <section className="hd-tabs">
      <div className="hd-tabs__list" role="tablist">
        {tabs.map((t) => (
          <button key={t} type="button" role="tab" id={`hd-tab-${t}`} aria-controls={`hd-panel-${t}`} aria-selected={tab === t}
            className="hd-tabs__tab" onClick={() => setTab(t)}>
            {t === "desc" ? "Description" : t === "details" ? "Details" : "Reviews"}
          </button>
        ))}
      </div>
      <div className="hd-tabs__panel" role="tabpanel" id={`hd-panel-${tab}`} aria-labelledby={`hd-tab-${tab}`}>
        {tab === "desc" && <div dangerouslySetInnerHTML={{ __html: sanitize(description) }} />}
        {tab === "details" && (
          <div className="hd-details">
            {details.map((d) => (
              <p key={d.label}><b>{d.label.replaceAll("_", " ")}:</b>{d.values.map((v) => <span key={v}> {v}</span>)}</p>
            ))}
          </div>
        )}
        {tab === "reviews" && <ReviewsList items={reviews} count={reviewCount} ratingSummary={ratingSummary} sku={sku} locale={locale} />}
      </div>
    </section>
  );
}
