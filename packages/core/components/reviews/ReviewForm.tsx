"use client";
import { useEffect, useState, type FormEvent } from "react";
type RatingValue = { value_id: string; value: string };
type RatingMeta = { id: string; name: string; values: RatingValue[] };

// Legacy v1 "Submit Your Opinion" form: star rating per Magento rating (ids + value_ids
// resolved per store via /api/ratings, never hardcoded), Name, Heading, Your Review.
// Shown only to signed-in customers; reviews go to Magento moderation.
export function ReviewForm({ sku, locale, onClose, onDone }: { sku: string; locale?: string; onClose: () => void; onDone: () => void }) {
  const [ratings, setRatings] = useState<RatingMeta[]>([]);
  const [stars, setStars] = useState<Record<string, number>>({});
  const [nickname, setNickname] = useState("");
  const [summary, setSummary] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/ratings${locale ? `?locale=${encodeURIComponent(locale)}` : ""}`, { credentials: "include" })
      .then((r) => r.json())
      .then((j) => { if (j.ok && j.items?.length) setRatings(j.items.slice(0, 10)); else setError("Rating options could not be loaded."); })
      .catch(() => setError("Rating options could not be loaded."));
  }, [locale]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!nickname.trim() || !summary.trim() || !text.trim()) { setError("Please fill in Name, Heading and Your Review."); return; }
    if (ratings.some((r) => !stars[r.id])) { setError("Please rate every category."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku, locale, nickname: nickname.trim(), summary: summary.trim(), text: text.trim(),
          ratings: ratings.map((r) => ({ id: r.id, value_id: r.values[stars[r.id] - 1]?.value_id })),
        }),
      });
      if (res.status === 401) { window.dispatchEvent(new Event("openLoginModal")); return; }
      if (!res.ok) { setError("Your review could not be submitted. Please try again."); return; }
      onDone();
    } catch {
      setError("Your review could not be submitted. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="hd-review-form" onSubmit={submit}>
      <div className="hd-review-form__head">
        <h4>Submit Your Opinion</h4>
        <button type="button" className="hd-review-form__close" onClick={onClose} aria-label="Close review form">−</button>
      </div>
      <div className="hd-review-form__stars">
        {ratings.map((r) => (
          <fieldset key={r.id} className="hd-review-form__field">
            <legend className="hd-review-form__label">{r.name}</legend>
            <div className="hd-stars hd-stars--input">
              {r.values.map((v, i) => (
                <button key={v.value_id} type="button" aria-label={`${r.name} ${i + 1} star${i ? "s" : ""}`} aria-pressed={(stars[r.id] ?? 0) === i + 1}
                  onClick={() => setStars((s) => ({ ...s, [r.id]: i + 1 }))}>
                  <Star filled={(stars[r.id] ?? 0) > i} size={20} />
                </button>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <div className="hd-review-form__row">
        <label className="hd-review-form__field" style={{ flex: "1 2" }}>
          <span className="hd-review-form__label">Name</span>
          <input className="hd-review-form__input" value={nickname} maxLength={60} onChange={(e) => setNickname(e.target.value)} />
        </label>
        <label className="hd-review-form__field" style={{ flex: "2 2" }}>
          <span className="hd-review-form__label">Heading</span>
          <input className="hd-review-form__input" value={summary} maxLength={120} onChange={(e) => setSummary(e.target.value)} />
        </label>
      </div>
      <label className="hd-review-form__field">
        <span className="hd-review-form__label">Your Review</span>
        <textarea className="hd-review-form__textarea" value={text} maxLength={2000} onChange={(e) => setText(e.target.value)} />
      </label>
      {error ? <p className="hd-msg hd-msg--err" role="alert">{error}</p> : null}
      <div>
        <button type="submit" className="hd-review-form__submit" disabled={busy}>{busy ? "Submitting…" : "Submit Your Opinion"}</button>
      </div>
    </form>
  );
}

export function Star({ filled, half = false, size = 18 }: { filled: boolean; half?: boolean; size?: number }) {
  const id = `hd-star-half-${size}`;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      {half ? <defs><linearGradient id={id}><stop offset="50%" stopColor="#f5a623" /><stop offset="50%" stopColor="#fff" /></linearGradient></defs> : null}
      <path d="M12 2.5l2.94 5.96 6.56.95-4.75 4.63 1.12 6.53L12 17.5l-5.87 3.07 1.12-6.53L2.5 9.41l6.56-.95z"
        fill={half ? `url(#${id})` : filled ? "#f5a623" : "#fff"} stroke="#f5a623" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}
