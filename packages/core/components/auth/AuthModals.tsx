"use client";
import { useEffect, useRef, useState } from "react";
// Ported from legacy Header.tsx: listens for openLoginModal / openSignUpModal,
// renders sign-in + create-account modals, closes on outside click / Escape.
export function AuthModals() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const loginRef = useRef<HTMLDivElement>(null);
  const signupRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const openLogin = () => { setLoginOpen(true); setSignupOpen(false); setError(""); };
    const openSignup = () => { setSignupOpen(true); setLoginOpen(false); setError(""); };
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
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setLoginOpen(false); setSignupOpen(false); }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [loginOpen, signupOpen]);
  async function doLogin(e: any) {
    e.preventDefault();
    setLoading(true); setError("");
    const r = await fetch("/api/auth/login", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const j = await r.json().catch(() => ({}));
    setLoading(false);
    if (!r.ok) { setError(j.error ?? "Login failed"); return; }
    setLoginOpen(false);
    window.dispatchEvent(new Event("headora:auth-changed"));
  }
  async function doSignup(e: any) {
    e.preventDefault();
    setLoading(true); setError("");
    const r = await fetch("/api/auth/register", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ firstname: firstName, lastname: lastName, email, password }) });
    const j = await r.json().catch(() => ({}));
    setLoading(false);
    if (!r.ok) { setError(j.error ?? "Signup failed"); return; }
    setSignupOpen(false);
    window.dispatchEvent(new Event("headora:auth-changed"));
  }
  if (!loginOpen && !signupOpen) return null;
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
    </div>
  );
}
