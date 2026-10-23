"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

// Legacy v1 auth panels (Header.tsx): "Sign-In To Your Account", "Create an Account",
// "Recover Password". Opened by the openLoginModal / openSignUpModal window events.
// Desktop: panel drops under the header's right edge; mobile: centred over a dimmed page.
// Success dispatches headora:auth-changed so hearts/reviews re-check the session.
type Panel = "login" | "signup" | "forgot" | null;

function localeFromPath(): string | undefined {
  try { return window.location.pathname.split("/").filter(Boolean)[0] || undefined; } catch { return undefined; }
}

const EyeIcon = ({ off }: { off: boolean }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {off
      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>}
  </svg>
);

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="hd-auth__group">
      <label htmlFor={id} className="hd-auth__label">{label}</label>
      {children}
    </div>
  );
}

function PasswordInput({ id, value, onChange, autoComplete, minLength }: {
  id: string; value: string; onChange: (v: string) => void; autoComplete: string; minLength?: number;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="hd-auth__pw">
      <input id={id} className="hd-auth__input" type={show ? "text" : "password"} value={value} required
        autoComplete={autoComplete} minLength={minLength} onChange={(e) => onChange(e.target.value)} />
      <button type="button" className="hd-auth__eye" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>
        <EyeIcon off={show} />
      </button>
    </div>
  );
}

export function AuthModals({ locale: localeProp }: { locale?: string }) {
  const [panel, setPanel] = useState<Panel>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [subscribe, setSubscribe] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [top, setTop] = useState(80);
  const boxRef = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const locale = localeProp ?? (typeof window !== "undefined" ? localeFromPath() : undefined);

  function open(p: Exclude<Panel, null>, keepEmail = false) {
    setError(""); setNotice(""); setPassword("");
    if (!keepEmail) setEmail("");
    if (p === "signup") { setFirstName(""); setLastName(""); setSubscribe(false); }
    setPanel(p);
  }
  function close() {
    setPanel(null);
    opener.current?.focus?.();
  }

  useEffect(() => {
    const onLogin = () => { opener.current = document.activeElement as HTMLElement; open("login"); };
    const onSignup = () => { opener.current = document.activeElement as HTMLElement; open("signup"); };
    window.addEventListener("openLoginModal", onLogin);
    window.addEventListener("openSignUpModal", onSignup);
    return () => { window.removeEventListener("openLoginModal", onLogin); window.removeEventListener("openSignUpModal", onSignup); };
  }, []);

  useEffect(() => {
    if (!panel) return;
    // Anchor under the sticky header, like the legacy dropdown.
    const header = document.querySelector(".hd-header");
    setTop(Math.max(0, header?.getBoundingClientRect().bottom ?? 80));
    boxRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    const onDown = (e: MouseEvent) => { if (boxRef.current && !boxRef.current.contains(e.target as Node)) close(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [panel]);

  async function post(url: string, body: Record<string, unknown>) {
    setLoading(true); setError(""); setNotice("");
    try {
      const r = await fetch(url, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, locale }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) setError(j.error ?? "Something went wrong. Please try again.");
      return r.ok;
    } catch {
      setError("Something went wrong. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function doLogin(e: FormEvent) {
    e.preventDefault();
    if (await post("/api/auth/login", { email: email.trim(), password })) {
      setPanel(null);
      window.dispatchEvent(new Event("headora:auth-changed"));
    }
  }
  async function doSignup(e: FormEvent) {
    e.preventDefault();
    if (await post("/api/auth/register", { firstname: firstName.trim(), lastname: lastName.trim(), email: email.trim(), password, is_subscribed: subscribe })) {
      setPanel(null);
      window.dispatchEvent(new Event("headora:auth-changed"));
    }
  }
  async function doForgot(e: FormEvent) {
    e.preventDefault();
    if (await post("/api/auth/forgot", { email: email.trim() })) {
      setNotice("If an account exists with this email, you will receive a password reset link shortly.");
    }
  }

  if (!panel) return null;
  const title = panel === "login" ? "Sign-In To Your Account" : panel === "signup" ? "Create an Account" : "Recover Password";

  return (
    <div className="hd-auth" style={{ ["--hd-auth-top" as any]: `${top}px` }}>
      <div ref={boxRef} className="hd-auth__box" role="dialog" aria-modal="true" aria-labelledby="hd-auth-title">
        <h2 id="hd-auth-title" className="hd-auth__title">{title}</h2>

        {panel === "login" && (
          <form className="hd-auth__form" onSubmit={doLogin}>
            <Field id="hd-auth-email" label="Email address">
              <input id="hd-auth-email" className="hd-auth__input" type="email" value={email} required autoComplete="email" onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field id="hd-auth-password" label="Password">
              <PasswordInput id="hd-auth-password" value={password} onChange={setPassword} autoComplete="current-password" />
            </Field>
            <div className="hd-auth__forgot">
              <button type="button" className="hd-auth__link" onClick={() => open("forgot", true)}>Forgot Password?</button>
            </div>
            {error ? <p className="hd-auth__error" role="alert">{error}</p> : null}
            <div className="hd-auth__stack">
              <button type="submit" className="hd-auth__primary" disabled={loading}>{loading ? "SIGNING IN..." : "SIGN IN"}</button>
              <button type="button" className="hd-auth__secondary" onClick={() => open("signup")}>CREATE AN ACCOUNT</button>
            </div>
          </form>
        )}

        {panel === "signup" && (
          <form className="hd-auth__form" onSubmit={doSignup}>
            <Field id="hd-auth-first" label="First Name">
              <input id="hd-auth-first" className="hd-auth__input" value={firstName} required autoComplete="given-name" onChange={(e) => setFirstName(e.target.value)} />
            </Field>
            <Field id="hd-auth-last" label="Last Name">
              <input id="hd-auth-last" className="hd-auth__input" value={lastName} required autoComplete="family-name" onChange={(e) => setLastName(e.target.value)} />
            </Field>
            <Field id="hd-auth-cemail" label="Email">
              <input id="hd-auth-cemail" className="hd-auth__input" type="email" value={email} required autoComplete="email" onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field id="hd-auth-cpassword" label="Password">
              <PasswordInput id="hd-auth-cpassword" value={password} onChange={setPassword} autoComplete="new-password" minLength={8} />
            </Field>
            <label className="hd-auth__check">
              <input type="checkbox" checked={subscribe} onChange={(e) => setSubscribe(e.target.checked)} />
              <span>Subscribe to news and updates</span>
            </label>
            {error ? <p className="hd-auth__error" role="alert">{error}</p> : null}
            <div className="hd-auth__row">
              <button type="button" className="hd-auth__secondary" onClick={close}>CANCEL</button>
              <button type="submit" className="hd-auth__primary" disabled={loading}>{loading ? "CREATING..." : "CREATE AN ACCOUNT"}</button>
            </div>
          </form>
        )}

        {panel === "forgot" && (
          <form className="hd-auth__form" onSubmit={doForgot}>
            <p className="hd-auth__text">Please enter the email address associated with this account.</p>
            <Field id="hd-auth-femail" label="Email address">
              <input id="hd-auth-femail" className="hd-auth__input" type="email" value={email} required autoComplete="email" onChange={(e) => setEmail(e.target.value)} />
            </Field>
            {error ? <p className="hd-auth__error" role="alert">{error}</p> : null}
            {notice ? <p className="hd-auth__success" role="status">{notice}</p> : null}
            <div className="hd-auth__row">
              <button type="button" className="hd-auth__secondary" onClick={() => open("login", true)}>CANCEL</button>
              <button type="submit" className="hd-auth__primary" disabled={loading}>{loading ? "SUBMITTING..." : "SUBMIT"}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
