export type ReviewItem = { nickname: string; summary: string; text: string; created_at: string; average_rating: number; ratings_breakdown: { name: string; value: string }[] };
// Top 10 highest rated first.
export function ReviewsList({ items, count, summary }: { items: ReviewItem[]; count: number; ratingSummary?: number; summary?: number }) {
  const avg = ratingSummary ?? summary ?? 0;
  const top = [...(items ?? [])].sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0)).slice(0, 10);
  if (!top.length) return <p>Be the first to review this product.</p>;
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <p style={{ margin: 0 }}>{count} review(s). Average: {avg}% - showing top {top.length} highest rated</p>
      {top.map((r, i) => (
        <article key={i} style={{ borderTop: "1px solid #eee", paddingTop: 12 }}>
          <strong>{r.summary}</strong>
          <p style={{ margin: "4px 0" }}>{r.text}</p>
          <small>{r.nickname} - {r.created_at} - {r.average_rating}%</small>
        </article>
      ))}
    </div>
  );
}
