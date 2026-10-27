"use client";
import { useEffect, useRef, useState } from "react";

// Venia PageLoadingIndicator: a 2px brand-blue bar along the bottom of the header. "loading" slides
// it to 75%, "done" fills it, and 750ms later it hides. Our pages mostly use plain links (full page
// loads), so a same-site link click or form submit starts it, a sessionStorage flag lets the next
// page play "done", and in-place filter loads (html.hd-plp-loading) drive it directly.
type State = "off" | "resume" | "loading" | "done";
const FLAG = "hd-page-loading";
const DONE_MS = 750;

export function PageLoadingIndicator() {
  const [state, setState] = useState<State>("off");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const start = (navigating: boolean) => {
      clearTimeout(timer.current);
      setState("loading");
      if (navigating) try { sessionStorage.setItem(FLAG, String(Date.now())); } catch {}
    };
    const finish = () => {
      clearTimeout(timer.current);
      setState("done");
      timer.current = setTimeout(() => setState("off"), DONE_MS);
    };

    // Arrived from a link click on the previous page: pick the bar up where that page left it (75%,
    // no animation) and finish it, so it reads as one load like Venia's single-page app, not two.
    try {
      const t = Number(sessionStorage.getItem(FLAG));
      sessionStorage.removeItem(FLAG);
      if (t && Date.now() - t < 15000) {
        setState("resume");
        requestAnimationFrame(() => requestAnimationFrame(finish));
      }
    } catch {}
    document.documentElement.classList.remove("hd-pageload-resume");

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.("a");
      if (!a || !a.href || a.hasAttribute("download") || (a.target && a.target !== "_self")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
      start(true);
    };
    const onSubmit = (e: SubmitEvent) => { if (!e.defaultPrevented) start(true); };

    const html = document.documentElement;
    let filtering = html.classList.contains("hd-plp-loading");
    const mo = new MutationObserver(() => {
      const now = html.classList.contains("hd-plp-loading");
      if (now !== filtering) { filtering = now; if (now) start(false); else finish(); }
    });
    mo.observe(html, { attributes: true, attributeFilter: ["class"] });

    // Back/forward cache restores the old page with the bar still running.
    const onShow = (e: PageTransitionEvent) => { if (e.persisted) { clearTimeout(timer.current); setState("off"); } };

    document.addEventListener("click", onClick);
    document.addEventListener("submit", onSubmit);
    window.addEventListener("pageshow", onShow);
    return () => {
      clearTimeout(timer.current);
      mo.disconnect();
      document.removeEventListener("click", onClick);
      document.removeEventListener("submit", onSubmit);
      window.removeEventListener("pageshow", onShow);
    };
  }, []);

  return (
    <div className={`hd-pageload${state === "off" ? "" : " hd-pageload--on"}`} aria-hidden="true">
      <div className={`hd-pageload__bar hd-pageload__bar--${state}`} />
      {/* Runs while the HTML parses, before first paint: shows the bar at 75% until hydration takes over. */}
      <script dangerouslySetInnerHTML={{ __html: `try{if(sessionStorage.getItem("${FLAG}"))document.documentElement.classList.add("hd-pageload-resume")}catch(e){}` }} />
    </div>
  );
}
