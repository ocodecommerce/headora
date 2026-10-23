"use client";
import { useState } from "react";
import { ReviewForm, Star } from "./ReviewForm.js";
import { useWishlist } from "../catalog/wishlistStore.js";

export type ReviewItem = { nickname: string; summary: string; text: string; created_at: string; average_rating: number; ratings_breakdown: { name: string; value: string }[] };

const openLogin = (e: React.MouseEvent) => { e.preventDefault(); window.dispatchEvent(new Event("openLoginModal")); };
const openSignup = (e: React.MouseEvent) => { e.preventDefault(); window.dispatchEvent(new Event("openSignUpModal")); };

function Stars({ percent, size = 18 }: { percent: number; size?: number }) {
  const rating = (percent / 100) * 5;
  return (
    <span className="hd-stars" role="img" aria-label={`${rating.toFixed(1)} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => <Star key={i} size={size} filled={rating - i >= 1} half={rating - i >= 0.5 && rating - i < 1} />)}
    </span>
  );
}

// Legacy v1 Reviews tab:
// - signed out: yellow "Only registered users can write reviews" notice (+ list when reviews exist)
// - signed in, no reviews: "Customer Reviews" + "Be the first to write a review!" -> form
// - reviews exist: overall rating + list, then "Add Your Review" / "Log In to Review"
export function ReviewsList({ items, count, ratingSummary, sku, locale }: {
  items: ReviewItem[]; count: number; ratingSummary: number; sku: string; locale?: string;
}) {
  const session = useWishlist(locale ?? "en");
  const [formOpen, setFormOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const top = [...(items ?? [])].sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0)).slice(0, 10);

  const form = <ReviewForm sku={sku} locale={locale} onClose={() => setFormOpen(false)} onDone={() => { setFormOpen(false); setSubmitted(true); }} />;
  const thanks = submitted ? <p className="hd-reviews__thanks" role="status">Thank you for submitting your review! Your review will be displayed soon.</p> : null;
  const notice = (
    <div className="hd-reviews__alert">
      <span aria-hidden="true">⚠️</span> Only registered users can write reviews. Please{" "}
      <a href="#login" onClick={openLogin}>Login Here</a> or <a href="#register" onClick={openSignup}>create an account</a>
    </div>
  );

  if (!top.length) {
    return (
      <div className="hd-reviews">
        {thanks}
        {formOpen && session.loggedIn ? form : (
          <div className="hd-reviews__box">
            {session.loggedIn ? (
              <div className="hd-reviews__empty">
                <span className="hd-reviews__heading">Customer Reviews</span>
                <Stars percent={100} />
                <p>We&apos;re looking for stars!<br />Let us know what you think</p>
                <button type="button" className="hd-reviews__cta" onClick={() => setFormOpen(true)}>Be the first to write a review!</button>
              </div>
            ) : notice}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="hd-reviews">
      <div className="hd-reviews__overall">
        <span className="hd-reviews__overall-label">Overall Rating</span>
        <Stars percent={ratingSummary} size={14} />
        <span className="hd-reviews__count">({count} review{count === 1 ? "" : "s"})</span>
      </div>
      <ul className="hd-reviews__list">
        {top.map((r, i) => (
          <li key={i} className="hd-reviews__item">
            <div className="hd-reviews__item-head">
              <strong>{r.summary}</strong>
              <Stars percent={r.average_rating ?? 0} size={12} />
            </div>
            <p>{r.text}</p>
            <small>{r.nickname} · {new Date(r.created_at.replace(" ", "T")).toLocaleDateString(locale ?? "en", { year: "numeric", month: "short", day: "numeric" })}</small>
          </li>
        ))}
      </ul>
      {thanks}
      {session.loggedIn
        ? (formOpen ? form : <div className="hd-reviews__add"><button type="button" className="hd-reviews__cta" onClick={() => setFormOpen(true)}>Add Your Review</button></div>)
        : <div className="hd-reviews__add">{notice}</div>}
    </div>
  );
}
