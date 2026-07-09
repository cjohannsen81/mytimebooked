import { fmtTime } from '../lib/format.js';

// The provider's window as a strip of the day; the chosen block is filled in.
export default function TimeBar({ windowStart, windowEnd, blockStart, blockEnd }) {
  const ws = new Date(windowStart).getTime();
  const we = new Date(windowEnd).getTime();
  const span = we - ws;
  if (span <= 0) return null;
  const bs = blockStart ? Math.max(ws, new Date(blockStart).getTime()) : null;
  const be = blockEnd ? Math.min(we, new Date(blockEnd).getTime()) : null;
  const left = bs != null ? ((bs - ws) / span) * 100 : 0;
  const width = bs != null && be != null ? ((be - bs) / span) * 100 : 0;

  return (
    <div>
      <div className="relative h-3 rounded-full bg-paper-100 border border-paper-200 overflow-hidden">
        {width > 0 && (
          <div className="absolute top-0 bottom-0 bg-sage-gradient rounded-full transition-all duration-300"
            style={{ left: `${left}%`, width: `${width}%` }} />
        )}
      </div>
      <div className="flex justify-between text-[11px] text-ink-400 mt-1">
        <span>{fmtTime(windowStart)}</span>
        {blockStart && blockEnd && (
          <span className="text-sage-700 font-semibold">{fmtTime(blockStart)}–{fmtTime(blockEnd)}</span>
        )}
        <span>{fmtTime(windowEnd)}</span>
      </div>
    </div>
  );
}
