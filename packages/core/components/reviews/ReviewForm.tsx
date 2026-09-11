"use client";
import { useState } from "react";
export function ReviewForm({ sku }: { sku: string }) {
  const [state, setState] = useState("idle");
  async function submit(e: any) {
    e.preventDefault();
    setState("sending");
    const fd = new FormData(e.target);
    const r = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sku, nickname: fd.get("nickname"), summary: fd.get("summary"), text: fd.get("text"), ratings: [{ id: fd.get("ratingId") ?? "4", value_id: "5" }] }) });
    setState(r.ok ? "done" : "error");
  }
  if (state === "done") return <p>Thanks. Review submitted for moderation.</p>;
  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 8, maxWidth: 480 }}>
      <input name="nickname" required placeholder="Nickname" />
      <input name="summary" required placeholder="Summary" />
      <textarea name="text" required placeholder="Review" />
      <button disabled={state === "sending"}>{state === "sending" ? "Sending..." : "Write review"}</button>
      {state === "error" && <p>Failed. Login may be required.</p>}
    </form>
  );
}
