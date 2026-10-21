"use client";
import { useEffect, useState } from "react";
type RatingValue = { value_id: string; value: string };
type RatingMeta = { id: string; name: string; values: RatingValue[] };
// Login-required only. Rating IDs + option value_ids resolved per store via /api/ratings. Never hardcoded.
// Opens login modal event, falls back to navigation if no listener (scaffold-safe).
function openModal(name: "openLoginModal" | "openSignUpModal", fallback?: string) {
  const e = new CustomEvent(name, { cancelable: true });
  window.dispatchEvent(e);
  if (!e.defaultPrevented && fallback) window.location.href = fallback;
}
export function ReviewForm({ sku, locale, loginUrl }: { sku: string; locale?: string; loginUrl?: string }) {
  const [ratings, setRatings] = useState<RatingMeta[]>([]);
  const [state, setState] = useState<"idle" | "loading-ratings" | "sending" | "done" | "login" | "error">("loading-ratings");
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  useEffect(() => {
    fetch(`/api/ratings${locale ? `?locale=${encodeURIComponent(locale)}` : ""}`, { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        if (j.ok && j.items?.length) {
          const items: RatingMeta[] = j.items.slice(0, 10);
          setRatings(items);
          setPicks(Object.fromEntries(items.map((r) => [r.id, r.values?.[r.values.length - 1]?.value_id ?? ""])));
          setState("idle");
        } else setState("error");
      })
      .catch(() => setState("error"));
  }, [locale]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const fd = new FormData(e.currentTarget);
    const nickname = String(fd.get("nickname") ?? "").trim();
    const summary = String(fd.get("summary") ?? "").trim();
    const text = String(fd.get("text") ?? "").trim();
    if (!nickname || !summary || !text) { setFormError("All fields required."); return; }
    if (!ratings.length) { setFormError("Rating options not loaded yet."); return; }
    setState("sending");
    const payload = { sku, locale, nickname, summary, text, ratings: ratings.map((r) => ({ id: r.id, value_id: picks[r.id] })) };
    const r = await fetch("/api/reviews", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (r.status === 401) { setState("login"); openModal("openLoginModal", loginUrl); return; }
    setState(r.ok ? "done" : "error");
  }
  if (state === "done") return <p>Thanks. Review submitted for moderation.</p>;
  if (state === "login")
    return (
      <p>
        Login required to write reviews.{" "}
        <a href={loginUrl ?? "/customer/account/login"} onClick={(e) => { e.preventDefault(); openModal("openLoginModal", loginUrl); }}>
          Login here
        </a>
      </p>
    );
  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 8, maxWidth: 480 }}>
      <p style={{ margin: 0 }}>
        Login required to write reviews.{" "}
        <a href={loginUrl ?? "#login"} onClick={(e) => { e.preventDefault(); openModal("openLoginModal", loginUrl); }}>Login</a>
      </p>
      {state === "loading-ratings" && <p>Loading rating options for this store...</p>}
      {ratings.map((r) => (
        <label key={r.id}>{r.name}
          <select value={picks[r.id] ?? ""} onChange={(e) => setPicks({ ...picks, [r.id]: e.target.value })}>
            {(r.values?.length ? r.values : []).map((v) => <option key={v.value_id} value={v.value_id}>{v.value}</option>)}
          </select>
        </label>
      ))}
      <input name="nickname" required placeholder="Nickname" maxLength={60} />
      <input name="summary" required placeholder="Summary" maxLength={120} />
      <textarea name="text" required placeholder="Review" maxLength={2000} />
      <button disabled={state === "sending" || state === "loading-ratings"}>{state === "sending" ? "Sending..." : "Write review"}</button>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={() => openModal("openLoginModal", loginUrl)}>Login</button>
        <button type="button" onClick={() => openModal("openSignUpModal", loginUrl)}>Sign up</button>
      </div>
      {(state === "error" || formError) && <p>{formError || "Failed to load or submit. Try again logged in."}</p>}
    </form>
  );
}
