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
    <form onSubmit={submit} className="mt-4 pt-4 border-t border-paper-200 space-y-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button type="button" key={n} onClick={() => setRating(n)}
            className={`text-2xl transition ${n <= rating ? 'text-stamp-amber' : 'text-paper-300'}`}
            aria-label={`${n} stars`}>★</button>
        ))}
      </div>
      <textarea className="input" rows="2" placeholder="How did it go?"
        value={comment} onChange={e => setComment(e.target.value)} required />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="btn-primary !py-2" disabled={busy}>{busy ? 'Posting…' : 'Post review'}</button>
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
    if (!confirm('Cancel this booking?')) return;
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-ink-900">My bookings</h1>
        <Link to="/browse" className="btn-primary">Book more help</Link>
      </div>
      {error && <p className="mt-6 text-red-600">{error}</p>}
      {!bookings && !error && <p className="mt-6 text-ink-500">Loading…</p>}

      {bookings && bookings.length === 0 && (
        <div className="card p-10 mt-6 text-center">
          <span className="text-4xl">🗓️</span>
          <p className="mt-3 font-semibold text-lg">Nothing booked yet</p>
          <p className="text-ink-500 mt-1">Find a trusted pro and get that first job off your list.</p>
          <Link to="/browse" className="btn-primary mt-5">Browse pros</Link>
        </div>
      )}

      {upcoming.length > 0 && (
        <>
          <h2 className="mt-8 mb-3 font-semibold text-lg text-ink-900">Upcoming</h2>
          <div className="space-y-4">
            {upcoming.map(b => (
              <BookingCard key={b.id} booking={b} viewer="CUSTOMER"
                actions={<button onClick={() => cancel(b.id)} className="btn-danger !py-1.5 !px-3 !text-xs">Cancel</button>} />
            ))}
          </div>
        </>
      )}

      {past.length > 0 && (
        <>
          <h2 className="mt-10 mb-3 font-semibold text-lg text-ink-900">Past & closed</h2>
          <div className="space-y-4">
            {past.map(b => (
              <BookingCard key={b.id} booking={b} viewer="CUSTOMER"
                actions={
                  b.status === 'COMPLETED' && !b.review ? (
                    <button onClick={() => setReviewing(reviewing === b.id ? null : b.id)}
                      className="btn-ghost !py-1.5 !px-3 !text-xs">
                      {reviewing === b.id ? 'Close' : 'Leave a review'}
                    </button>
                  ) : b.review ? (
                    <span className="text-xs text-ink-400">Reviewed ★{b.review.rating}</span>
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
