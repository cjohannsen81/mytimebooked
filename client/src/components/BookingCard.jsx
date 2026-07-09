import Avatar from './Avatar.jsx';
import CategoryIcon from './CategoryIcon.jsx';
import { money, fmtDate, fmtTime } from '../lib/format.js';

const STATUS = {
  PENDING:   { cls: 'stamp-pending', text: 'Pending' },
  CONFIRMED: { cls: 'stamp-confirmed', text: 'Confirmed' },
  COMPLETED: { cls: 'stamp-completed', text: 'Completed' },
  CANCELLED: { cls: 'stamp-void', text: 'Cancelled' },
  DECLINED:  { cls: 'stamp-void', text: 'Declined' },
};

export default function BookingCard({ booking, viewer, actions, children }) {
  const other = viewer === 'PROVIDER' ? booking.customer : booking.provider.user;
  const photo = viewer === 'PROVIDER' ? null : booking.provider.photoUrl;
  const status = STATUS[booking.status];
  return (
    <div className="card p-5 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <Avatar name={other.name} src={photo} className="w-12 h-12" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span key={booking.status} className={status.cls}>{status.text}</span>
              <span className="text-xs text-ink-400">#{booking.id.slice(-6).toUpperCase()}</span>
            </div>
            <p className="mt-2 font-semibold text-ink-900 flex items-center gap-1.5">
              <CategoryIcon k={booking.service.category} className="w-4 h-4 text-sage-600" />
              {booking.service.title}
            </p>
            <p className="text-sm text-ink-500 mt-0.5">
              {viewer === 'PROVIDER' ? 'For' : 'With'} <span className="font-medium text-ink-700">{other.name}</span>
              {(booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') && other.phone && (
                <span> · {other.phone}</span>
              )}
            </p>
            <p className="text-sm text-ink-500 mt-1">
              {fmtDate(booking.start)} · {fmtTime(booking.start)}–{fmtTime(booking.end)} ({booking.hours}h)
            </p>
            <p className="text-sm text-ink-500">{booking.address}</p>
            {booking.notes && <p className="text-sm text-ink-400 mt-1 italic">“{booking.notes}”</p>}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-xl text-ink-900">{money(booking.totalCents)}</p>
          <p className="text-xs text-ink-400 mt-0.5">pay your pro directly</p>
          {actions && <div className="mt-3 flex flex-col gap-2 items-end">{actions}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}
