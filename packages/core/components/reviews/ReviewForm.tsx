"use client";
import { useEffect, useState } from "react";
type RatingMeta = { id: string; name: string };
// Login-required only. Rating IDs resolved per store via /api/ratings, top 10. Never hardcoded.
// Login via modal event (legacy pattern): dispatches openLoginModal, falls back to link.
function openLoginModal() {
  window.dispatchEvent(new Event("openLoginModal"));
}
export function ReviewForm({ sku, loginUrl }: { sku: string; loginUrl?: string }) {
  const [ratings, setRatings] = useState<RatingMeta[]>([]);
  const [state, setState] = useState<"idle" | "loading-ratings" | "sending" | "done" | "login" | "error">("loading-ratings");
  const [picks, setPicks] = useState<Record<string, string>>({});
  useEffect(() => {
    fetch("/api/ratings", { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        if (j.ok && j.items?.length) {
          setRatings(j.items.slice(0, 10));
          setState("idle");
        } else setState("error");
      })
      .catch(() => setState("error"));
  }, []);
  async function submit(e: any) {
    e.preventDefault();
    setState("sending");
    const fd = new FormData(e.target);
    const payload = {
      sku,
      nickname: fd.get("nickname"),
      summary: fd.get("summary"),
      text: fd.get("text"),
      ratings: ratings.map((r) => ({ id: r.id, value_id: picks[r.id] ?? "5" })),
    };
    const r = await fetch("/api/reviews", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (r.status === 401) { setState("login"); openLoginModal(); return; }
    setState(r.ok ? "done" : "error");
  }
  if (state === "done") return <p>Thanks. Review submitted for moderation.</p>;
  if (state === "login")
    return (
      <p>
        Login required to write reviews.{" "}
        <a href={loginUrl ?? "/customer/account/login"} onClick={(e) => { e.preventDefault(); openLoginModal(); }}>
          Login here
        </a>
      </p>
    );
  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 8, maxWidth: 480 }}>
      <p style={{ margin: 0 }}>
        Login required to write reviews.{" "}
        <a href={loginUrl ?? "#login"} onClick={(e) => { e.preventDefault(); openLoginModal(); }}>
          Login
        </a>
      </p>
      {state === "loading-ratings" && <p>Loading rating options for this store...</p>}
      {ratings.map((r) => (
        <label key={r.id}>{r.name} (1-5)
          <select value={picks[r.id] ?? "5"} onChange={(e) => setPicks({ ...picks, [r.id]: e.target.value })}>
            {["5", "4", "3", "2", "1"].map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
      ))}
      <input name="nickname" required placeholder="Nickname" />
      <input name="summary" required placeholder="Summary" />
      <textarea name="text" required placeholder="Review" />
      <button disabled={state === "sending" || state === "loading-ratings"}>{state === "sending" ? "Sending..." : "Write review"}</button>
      <div style={{ display: "flex", gap: 8 }}><button type="button" onClick={openLoginModal}>Login</button><button type="button" onClick={() => window.dispatchEvent(new Event("openSignUpModal"))}>Sign up</button></div>
      {state === "error" && <p>Failed to load or submit. Try again logged in.</p>}
    </form>
  );
}
