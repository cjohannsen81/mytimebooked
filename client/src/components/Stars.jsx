export default function Stars({ rating, count, size = 'text-sm' }) {
  if (rating == null) {
    return <span className={`${size} font-mono text-ink-400 uppercase tracking-wider text-xs`}>— new pro —</span>;
  }
  const full = Math.round(rating);
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono ${size}`}>
      <span className="text-stamp-amber tracking-tighter" aria-hidden>
        {'★'.repeat(full)}{'☆'.repeat(5 - full)}
      </span>
      <span className="font-semibold text-ink-900">{rating}</span>
      {count != null && <span className="text-ink-400">({count})</span>}
    </span>
  );
}
