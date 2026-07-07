import { categoryIcon } from '../lib/categories.js';
import { money, fmtDate, fmtTime } from '../lib/format.js';

const STAMPS = {
  PENDING:   { cls: 'stamp-pending', text: 'PENDING' },
  CONFIRMED: { cls: 'stamp-confirmed', text: 'CONFIRMED ✓' },
  COMPLETED: { cls: 'stamp-completed', text: 'DONE ✓' },
  CANCELLED: { cls: 'stamp-void', text: 'VOID' },
  DECLINED:  { cls: 'stamp-void', text: 'DECLINED' },
};

const COPY_TINT = {
  PENDING: 'bg-carbon-canary/40',
  CONFIRMED: 'bg-carbon-mint/40',
  COMPLETED: 'bg-carbon-sky/30',
  CANCELLED: 'bg-carbon-rose/30',
  DECLINED: 'bg-carbon-rose/30',
};

// A booking rendered as a work-order slip from the pad.
export default function BookingCard({ booking, viewer, actions, children }) {
  const other = viewer === 'PROVIDER' ? booking.customer : booking.provider.user;
  const stamp = STAMPS[booking.status];
  return (
    <div className={`slip overflow-hidden ${COPY_TINT[booking.status]}`}>
      {/* Slip header */}
      <div className="flex items-center justify-between px-5 py-2 border-b-2 border-ink-900 bg-paper-50">
        <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-ink-900">
          Work order <span className="text-stamp-red">No. {booking.id.slice(-6).toUpperCase()}</span>
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-400 hidden sm:inline">
          filed {fmtDate(booking.createdAt)}
        </span>
      </div>

      <div className="px-5 py-4 flex flex-wrap gap-6 justify-between">
        {/* Form lines */}
        <div className="flex-1 min-w-[240px]">
          <div className="field-row">
            <span className="field-label">Service</span>
            <span className="field-value">{categoryIcon(booking.service.category)} {booking.service.title}</span>
          </div>
          <div className="field-row">
            <span className="field-label">{viewer === 'PROVIDER' ? 'Client' : 'Pro'}</span>
            <span className="field-value">
              {other.name}
              {(booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') && other.phone && (
                <span className="text-ink-500"> · ☏ {other.phone}</span>
              )}
            </span>
          </div>
          <div className="field-row">
            <span className="field-label">When</span>
            <span className="field-value">
              {fmtDate(booking.start)} · {fmtTime(booking.start)}–{fmtTime(booking.end)} ({booking.hours}h)
            </span>
          </div>
          <div className="field-row">
            <span className="field-label">Address</span>
            <span className="field-value">{booking.address}</span>
          </div>
          {booking.notes && (
            <div className="field-row">
              <span className="field-label">Notes</span>
              <span className="field-value italic text-ink-500">“{booking.notes}”</span>
            </div>
          )}
        </div>

        {/* Stamp + actions */}
        <div className="flex flex-col items-end justify-between gap-3">
          <span key={booking.status} className={stamp.cls}>{stamp.text}</span>
          {actions && <div className="flex flex-col gap-2 items-end">{actions}</div>}
        </div>
      </div>

      {/* Tear-off total stub */}
      <div className="perf-top px-5 py-2.5 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-400">
          ✂ customer copy — pay pro directly
        </span>
        <span className="font-mono text-sm font-bold text-ink-900">
          TOTAL {money(booking.totalCents)}
        </span>
      </div>

      {children && <div className="px-5 pb-4">{children}</div>}
    </div>
  );
}
