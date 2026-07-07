import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import BookingCard from '../components/BookingCard.jsx';

function ReviewForm({ booking, onDone }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/reviews', { method: 'POST', body: { bookingId: booking.id, rating, comment } });
      onDone();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-2 pt-4 border-t-2 border-dashed border-ink-400 space-y-3">
      <p className="section-tag">Customer testimony</p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button type="button" key={n} onClick={() => setRating(n)}
            className={`text-2xl transition ${n <= rating ? 'text-stamp-amber' : 'text-paper-300'}`}
            aria-label={`${n} stars`}>★</button>
        ))}
      </div>
      <textarea className="input" rows="2" placeholder="how did it go?"
        value={comment} onChange={e => setComment(e.target.value)} required />
      {error && <p className="font-mono text-sm text-stamp-red">{error}</p>}
      <button className="btn-primary !py-2" disabled={busy}>{busy ? 'Filing…' : 'File review'}</button>
    </form>
  );
}

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState(null);
  const [reviewing, setReviewing] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    api('/bookings/me')
      .then(({ bookings }) => setBookings(bookings))
      .catch(e => setError(e.message));
  };
  useEffect(load, []);

  const cancel = async (id) => {
    if (!confirm('Void this work order?')) return;
    try {
      await api(`/bookings/${id}/status`, { method: 'PATCH', body: { status: 'CANCELLED' } });
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const now = new Date();
  const upcoming = (bookings || []).filter(b => new Date(b.end) >= now && ['PENDING', 'CONFIRMED'].includes(b.status));
  const past = (bookings || []).filter(b => !upcoming.includes(b));

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-tag">Your side of the pad</p>
          <h1 className="mt-2 text-4xl font-bold text-ink-900">My orders</h1>
        </div>
        <Link to="/browse" className="btn-primary">+ New work order</Link>
      </div>
      {error && <p className="mt-6 font-mono text-sm text-stamp-red">{error}</p>}
      {!bookings && !error && <p className="mt-6 font-mono text-sm text-ink-500 animate-pulse">Flipping the pad…</p>}

      {bookings && bookings.length === 0 && (
        <div className="slip p-10 mt-8 text-center max-w-md mx-auto">
          <span className="stamp-pending">PAD EMPTY</span>
          <p className="mt-4 font-display font-bold text-xl">Nothing filed yet</p>
          <p className="mt-1 text-sm text-ink-500">Write your first work order and get that job off your list.</p>
          <Link to="/browse" className="btn-accent mt-6">Browse pros</Link>
        </div>
      )}

      {upcoming.length > 0 && (
        <>
          <h2 className="mt-10 mb-3 section-tag">— Open orders —</h2>
          <div className="space-y-5">
            {upcoming.map(b => (
              <BookingCard key={b.id} booking={b} viewer="CUSTOMER"
                actions={<button onClick={() => cancel(b.id)} className="btn-stamp-red !text-[10px]">VOID</button>} />
            ))}
          </div>
        </>
      )}

      {past.length > 0 && (
        <>
          <h2 className="mt-12 mb-3 section-tag">— Filed away —</h2>
          <div className="space-y-5">
            {past.map(b => (
              <BookingCard key={b.id} booking={b} viewer="CUSTOMER"
                actions={
                  b.status === 'COMPLETED' && !b.review ? (
                    <button onClick={() => setReviewing(reviewing === b.id ? null : b.id)}
                      className="btn-stamp-blue !text-[10px]">
                      {reviewing === b.id ? 'CLOSE' : 'RATE ★'}
                    </button>
                  ) : b.review ? (
                    <span className="font-mono text-[11px] text-ink-400 uppercase">rated ★{b.review.rating}</span>
                  ) : null
                }>
                {reviewing === b.id && (
                  <ReviewForm booking={b} onDone={() => { setReviewing(null); load(); }} />
                )}
              </BookingCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
