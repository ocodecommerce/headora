"use client";
import { useEffect, useRef, useState } from "react";
// Ported from legacy Header.tsx: listens for openLoginModal / openSignUpModal,
// plus forgot-password. Renders sign-in + create-account + forgot modals.
// Closes on outside click / Escape. Session left to header via headora:auth-changed.
export function AuthModals() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const loginRef = useRef<HTMLDivElement>(null);
  const signupRef = useRef<HTMLDivElement>(null);
  const forgotRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const openLogin = () => { setLoginOpen(true); setSignupOpen(false); setForgotOpen(false); setError(""); setNotice(""); };
    const openSignup = () => { setSignupOpen(true); setLoginOpen(false); setForgotOpen(false); setError(""); setNotice(""); };
    window.addEventListener("openLoginModal", openLogin);
    window.addEventListener("openSignUpModal", openSignup);
    return () => {
      window.removeEventListener("openLoginModal", openLogin);
      window.removeEventListener("openSignUpModal", openSignup);
    };
  }, []);
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (loginOpen && loginRef.current && !loginRef.current.contains(t)) setLoginOpen(false);
      if (signupOpen && signupRef.current && !signupRef.current.contains(t)) setSignupOpen(false);
      if (forgotOpen && forgotRef.current && !forgotRef.current.contains(t)) setForgotOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setLoginOpen(false); setSignupOpen(false); setForgotOpen(false); }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [loginOpen, signupOpen, forgotOpen]);
  async function doLogin(e: any) {
    e.preventDefault();
    setLoading(true); setError("");
    const r = await fetch("/api/auth/login", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), password }) });
    const j = await r.json().catch(() => ({}));
    setLoading(false);
    if (!r.ok) { setError(j.error ?? "Login failed"); return; }
    setLoginOpen(false);
    window.dispatchEvent(new Event("headora:auth-changed"));
  }
  async function doSignup(e: any) {
    e.preventDefault();
    setLoading(true); setError("");
    const r = await fetch("/api/auth/register", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ firstname: firstName.trim(), lastname: lastName.trim(), email: email.trim(), password }) });
    const j = await r.json().catch(() => ({}));
    setLoading(false);
    if (!r.ok) { setError(j.error ?? "Signup failed"); return; }
    setSignupOpen(false);
    window.dispatchEvent(new Event("headora:auth-changed"));
  }
  async function doForgot(e: any) {
    e.preventDefault();
    setLoading(true); setError(""); setNotice("");
    const r = await fetch("/api/auth/forgot", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim() }) });
    const j = await r.json().catch(() => ({}));
    setLoading(false);
    if (!r.ok) { setError(j.error ?? "Reset failed"); return; }
    setNotice("Reset email sent if account exists.");
  }
  if (!loginOpen && !signupOpen && !forgotOpen) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 50, display: "grid", placeItems: "center" }}>
      {loginOpen && (
        <div ref={loginRef} style={{ background: "#fff", padding: 24, minWidth: 320 }}>
          <h2>Sign in</h2>
          <form onSubmit={doLogin} style={{ display: "grid", gap: 8 }}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required />
            {error && <p>{error}</p>}
            <button disabled={loading}>{loading ? "..." : "Sign in"}</button>
          </form>
          <p><a href="#signup" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event("openSignUpModal")); }}>Create account</a></p>
          <p><a href="#forgot" onClick={(e) => { e.preventDefault(); setForgotOpen(true); setLoginOpen(false); }}>Forgot password?</a></p>
        </div>
      )}
      {signupOpen && (
        <div ref={signupRef} style={{ background: "#fff", padding: 24, minWidth: 320 }}>
          <h2>Create account</h2>
          <form onSubmit={doSignup} style={{ display: "grid", gap: 8 }}>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" required />
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" required />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required />
            {error && <p>{error}</p>}
            <button disabled={loading}>{loading ? "..." : "Create account"}</button>
          </form>
          <p><a href="#login" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event("openLoginModal")); }}>Back to sign in</a></p>
        </div>
      )}
      {forgotOpen && (
        <div ref={forgotRef} style={{ background: "#fff", padding: 24, minWidth: 320 }}>
          <h2>Reset password</h2>
          <form onSubmit={doForgot} style={{ display: "grid", gap: 8 }}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
            {error && <p>{error}</p>}
            {notice && <p>{notice}</p>}
            <button disabled={loading}>{loading ? "..." : "Send reset email"}</button>
          </form>
          <p><a href="#login" onClick={(e) => { e.preventDefault(); setForgotOpen(false); window.dispatchEvent(new Event("openLoginModal")); }}>Back to sign in</a></p>
        </div>
      )}
    </div>
  );
}
