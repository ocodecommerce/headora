"use client";
import { useState, type FormEvent } from "react";

// Footer "Sign In" / "Register" open the headless auth modals (AuthModals listens).
export function AuthLink({ kind, children }: { kind: "login" | "register"; children: string }) {
  return (
    <button type="button" className="hd-footer__link"
      onClick={() => window.dispatchEvent(new Event(kind === "login" ? "openLoginModal" : "openSignUpModal"))}>
      {children}
    </button>
  );
}

export function NewsletterForm({ locale }: { locale: string }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      const j = await res.json();
      if (j.ok) {
        setEmail("");
        setMsg({ ok: true, text: j.status === "NOT_ACTIVE" || j.status === "UNCONFIRMED" ? "Please check your inbox to confirm your subscription." : "Thank you for subscribing!" });
      } else {
        setMsg({ ok: false, text: j.error ?? "Subscription failed." });
      }
    } catch {
      setMsg({ ok: false, text: "The store did not respond. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="hd-subscribe" onSubmit={submit} noValidate>
      <div className="hd-subscribe__row">
        <label htmlFor="hd-newsletter-email" className="hd-visually-hidden">Email address</label>
        <input id="hd-newsletter-email" type="email" required autoComplete="email" value={email}
          onChange={(e) => setEmail(e.target.value)} className="hd-subscribe__input" />
        <button type="submit" className="hd-subscribe__btn" disabled={busy}>{busy ? "…" : "Subscribe"}</button>
      </div>
      <p className={`hd-msg${msg ? (msg.ok ? " hd-msg--ok" : " hd-msg--err") : ""}`} role="status" aria-live="polite">{msg?.text ?? ""}</p>
    </form>
  );
}
