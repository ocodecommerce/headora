"use client";
import { useEffect, useState } from "react";

// Promo ribbon with a close button; stays closed for the browser session (legacy behaviour).
export function Ribbon({ text }: { text: string }) {
  const [shown, setShown] = useState(true);
  useEffect(() => {
    try { if (sessionStorage.getItem("headora:ribbonClosed") === "1") setShown(false); } catch { /* storage blocked */ }
  }, []);
  if (!shown) return null;
  return (
    <div className="hd-ribbon">
      <span>{text}</span>
      <button type="button" className="hd-ribbon__close" aria-label="Close announcement"
        onClick={() => { setShown(false); try { sessionStorage.setItem("headora:ribbonClosed", "1"); } catch { /* ignore */ } }}>
        ×
      </button>
    </div>
  );
}
