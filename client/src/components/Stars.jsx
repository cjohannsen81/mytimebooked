export default function Stars({ rating, count, size = 'text-sm' }) {
  if (rating == null) {
    return <span className={`${size} text-ink-400`}>New pro</span>;
  }
  const full = Math.round(rating);
  return (
    <span className={`inline-flex items-center gap-1 ${size}`}>
      <span className="text-stamp-amber" aria-hidden>
        {'★'.repeat(full)}{'☆'.repeat(5 - full)}
      </span>
      <span className="font-semibold text-ink-900">{rating}</span>
      {count != null && <span className="text-ink-400">({count})</span>}
    </span>
  );
}
