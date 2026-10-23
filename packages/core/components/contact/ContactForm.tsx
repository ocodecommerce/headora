"use client";
import { useState, type FormEvent } from "react";

// Venia ContactPage form: Name, Email, Phone Number (optional), Message -> /api/contact.
export function ContactForm({ locale }: { locale?: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, locale }),
      });
      const json = await res.json().catch(() => ({}));
      if (json.ok) {
        form.reset();
        setMsg({ ok: true, text: "Your message has been sent." });
      } else {
        setMsg({ ok: false, text: json.error ?? "Your message could not be sent. Please try again." });
      }
    } catch {
      setMsg({ ok: false, text: "Your message could not be sent. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="hd-contact__form" onSubmit={submit}>
      <label className="hd-contact__field">
        <span className="hd-contact__label">Name</span>
        <input className="hd-contact__input" name="name" autoComplete="name" required maxLength={255} />
      </label>
      <label className="hd-contact__field">
        <span className="hd-contact__label">Email</span>
        <input className="hd-contact__input" name="email" type="email" autoComplete="email" placeholder="abc@xyz.com" required maxLength={254} />
      </label>
      <label className="hd-contact__field">
        <span className="hd-contact__label">Phone Number <em>Optional</em></span>
        <input className="hd-contact__input" name="telephone" type="tel" autoComplete="tel" placeholder="(222)-222-2222" maxLength={40} />
      </label>
      <label className="hd-contact__field">
        <span className="hd-contact__label">Message</span>
        <textarea className="hd-contact__input hd-contact__textarea" name="comment" placeholder="Tell us what's on your mind" required maxLength={5000} />
      </label>
      {msg ? <p className={`hd-msg ${msg.ok ? "hd-msg--ok" : "hd-msg--err"}`} role={msg.ok ? "status" : "alert"}>{msg.text}</p> : null}
      <div className="hd-contact__buttons">
        <button type="submit" className="hd-contact__submit" disabled={busy}>{busy ? "Sending…" : "Send"}</button>
      </div>
    </form>
  );
}
