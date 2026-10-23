"use client";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { SearchIcon } from "../layout/Icons.js";

type Hit = { uid: string; name: string; url_key: string; image: string | null };
type Cat = { uid: string; name: string; url_path: string };

// Header search, like the legacy storefront's QuickSearch: a full-width panel under the
// header with live product suggestions; Enter (or the last row) opens /<locale>/search.
export function QuickSearch({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) input.current?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setHits([]); setCats([]); return; }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}&locale=${encodeURIComponent(locale)}`, { signal: ctrl.signal });
        const j = await res.json();
        setHits(j.products ?? []);
        setCats(j.categories ?? []);
      } catch { /* aborted or offline: keep previous suggestions */ } finally {
        setLoading(false);
      }
    }, 250);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q, locale]);

  const resultsHref = `/${locale}/search?query=${encodeURIComponent(q.trim())}`;
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && q.trim()) window.location.assign(resultsHref);
  };

  return (
    <>
      <button type="button" className="hd-action" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <SearchIcon /><span className="hd-action__label">Search</span>
      </button>
      {open ? (
        <>
          <div className="hd-qs__overlay" onClick={() => setOpen(false)} />
          <div className="hd-qs" role="search">
            <div className="hd-qs__inner">
              <div className="hd-qs__field">
                <span className="hd-qs__icon" aria-hidden="true"><SearchIcon /></span>
                <input ref={input} type="text" placeholder="Search products..." aria-label="Search products"
                  value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKeyDown} />
                <button type="button" className="hd-qs__close" aria-label="Close search" onClick={() => setOpen(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              {loading && !hits.length ? (
                <div className="hd-qs__status">Loading...</div>
              ) : q.trim().length >= 2 ? (
                <ul className="hd-qs__results">
                  {cats.map((c) => (
                    <li key={c.uid} className="hd-qs__item">
                      <a href={`/${locale}/${c.url_path}.html`}><span><strong>{q.trim()}</strong> in {c.name}</span></a>
                    </li>
                  ))}
                  {hits.length ? <li className="hd-qs__head"><h3>PRODUCT SUGGESTIONS</h3></li> : null}
                  {hits.map((h) => (
                    <li key={h.uid} className="hd-qs__item">
                      <a href={`/${locale}/${h.url_key}.html`}>
                        {h.image ? <img src={h.image} alt="" width={50} height={50} loading="lazy" /> : null}
                        <span>{h.name}</span>
                      </a>
                    </li>
                  ))}
                  <li className="hd-qs__item hd-qs__all">
                    <a href={resultsHref}><span>Search for &quot;<strong>{q.trim()}</strong>&quot;</span><span aria-hidden="true">&rarr;</span></a>
                  </li>
                </ul>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
