import { fmtTime } from '../lib/format.js';

// The window as a strip of the day; the chosen block is inked in.
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
      <div className="relative h-4 border-2 border-ink-900 rounded-[3px] bg-paper-50 overflow-hidden"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent 0, transparent 14px, rgba(36,43,35,0.18) 14px, rgba(36,43,35,0.18) 15px)',
        }}>
        {width > 0 && (
          <div className="absolute top-0 bottom-0 bg-ink-900" style={{ left: `${left}%`, width: `${width}%` }} />
        )}
      </div>
      <div className="flex justify-between font-mono text-[10px] uppercase tracking-wider text-ink-400 mt-1">
        <span>{fmtTime(windowStart)}</span>
        {blockStart && blockEnd && (
          <span className="text-ink-900 font-bold">▓ {fmtTime(blockStart)}–{fmtTime(blockEnd)}</span>
        )}
        <span>{fmtTime(windowEnd)}</span>
      </div>
    </div>
  );
}
