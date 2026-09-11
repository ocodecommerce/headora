export type ReviewItem = { nickname: string; summary: string; text: string; created_at: string; average_rating: number; ratings_breakdown: { name: string; value: string }[] };
export function ReviewsList({ items, count, summary }: { items: ReviewItem[]; count: number; summary: number }) {
  if (!items?.length) return <p>Be the first to review this product.</p>;
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <p style={{ margin: 0 }}>{count} review(s). Average: {summary}%</p>
      {items.map((r, i) => (
        <article key={i} style={{ borderTop: "1px solid #eee", paddingTop: 12 }}>
          <strong>{r.summary}</strong>
          <p style={{ margin: "4px 0" }}>{r.text}</p>
          <small>{r.nickname} - {r.created_at} - {r.average_rating}%</small>
        </article>
      ))}
    </div>
  );
}
