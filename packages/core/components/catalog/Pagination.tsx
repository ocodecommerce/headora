export function Pagination({ current, total, href }: { current: number; total: number; href: (page: number) => string }) {
  if (total < 2) return null;
  // First, last, and two either side of the current page.
  const pages = [...new Set([1, total, ...[-2, -1, 0, 1, 2].map((d) => current + d)])].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  return (
    <nav className="hd-pager" aria-label="Pagination">
      {current > 1 ? <a href={href(current - 1)} rel="prev" aria-label="Previous page">‹</a> : null}
      {pages.map((p, i) => (
        <span key={p}>
          {i > 0 && p - pages[i - 1] > 1 ? <span className="hd-pager__gap">…</span> : null}
          {p === current ? <span aria-current="page">{p}</span> : <a href={href(p)}>{p}</a>}
        </span>
      ))}
      {current < total ? <a href={href(current + 1)} rel="next" aria-label="Next page">›</a> : null}
    </nav>
  );
}
