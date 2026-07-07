import { categoryIcon } from '../lib/categories.js';
import { money, fmtDate, fmtTime } from '../lib/format.js';

const STATUS_STYLES = {
  PENDING: 'bg-sun-300/40 text-sun-600',
  CONFIRMED: 'bg-pine-100 text-pine-700',
  COMPLETED: 'bg-linen-200 text-ink-700',
  CANCELLED: 'bg-red-50 text-red-600',
  DECLINED: 'bg-red-50 text-red-600',
};

export default function BookingCard({ booking, viewer, actions, children }) {
  const other = viewer === 'PROVIDER' ? booking.customer : booking.provider.user;
  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`badge ${STATUS_STYLES[booking.status]}`}>{booking.status}</span>
            <span className="text-xs text-ink-400">#{booking.id.slice(-6)}</span>
          </div>
          <p className="mt-2 font-bold text-ink-900">
            {categoryIcon(booking.service.category)} {booking.service.title}
          </p>
          <p className="text-sm text-ink-500 mt-0.5">
            {viewer === 'PROVIDER' ? 'For' : 'With'} <span className="font-semibold text-ink-700">{other.name}</span>
          </p>
          <p className="text-sm text-ink-500 mt-1">
            {fmtDate(booking.start)} · {fmtTime(booking.start)}–{fmtTime(booking.end)} ({booking.hours}h)
          </p>
          <p className="text-sm text-ink-500">📍 {booking.address}</p>
          {booking.notes && <p className="text-sm text-ink-400 mt-1 italic">“{booking.notes}”</p>}
          {(booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') && other.phone && (
            <p className="text-sm text-ink-500 mt-1">📞 {other.phone}</p>
          )}
        </div>
        <div className="text-right">
          <p className="font-display font-bold text-xl text-pine-800">{money(booking.totalCents)}</p>
          {actions && <div className="mt-3 flex flex-col gap-2 items-end">{actions}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}
