"use client";
import { UserIcon } from "./Icons.js";

// Opens the headless login modal (AuthModals listens for this event).
export function SignInButton() {
  return (
    <button type="button" className="hd-action" onClick={() => window.dispatchEvent(new Event("openLoginModal"))}>
      <UserIcon />
      <span className="hd-action__label">Sign In</span>
    </button>
  );
}
