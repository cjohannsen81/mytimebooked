import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { money } from '../lib/format.js';
import BookingCard from '../components/BookingCard.jsx';

export default function ProviderDashboard() {
  const [bookings, setBookings] = useState(null);
  const [profile, setProfile] = useState(undefined);
  const [error, setError] = useState('');

  const load = () => {
    api('/bookings/me').then(({ bookings }) => setBookings(bookings)).catch(e => setError(e.message));
    api('/providers/me').then(({ profile }) => setProfile(profile)).catch(() => setProfile(null));
  };
  useEffect(load, []);

  const setStatus = async (id, status) => {
    try {
      await api(`/bookings/${id}/status`, { method: 'PATCH', body: { status } });
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  if (profile === null) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center animate-rise">
        <span className="text-4xl">🧰</span>
        <h1 className="mt-4 text-2xl font-bold text-ink-900">Finish setting up your pro profile</h1>
        <p className="mt-2 text-ink-500">Add your headline, bio, and services so customers can find and book you.</p>
        <Link to="/pro/profile" className="btn-primary mt-6">Set up my profile</Link>
      </div>
    );
  }

  const pending = (bookings || []).filter(b => b.status === 'PENDING');
  const confirmed = (bookings || []).filter(b => b.status === 'CONFIRMED');
  const done = (bookings || []).filter(b => ['COMPLETED', 'CANCELLED', 'DECLINED'].includes(b.status));
  const earnedCents = (bookings || [])
    .filter(b => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.totalCents, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-ink-900">My jobs</h1>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { label: 'Requests', value: pending.length },
          { label: 'Confirmed', value: confirmed.length },
          { label: 'Earned', value: money(earnedCents) },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className="font-bold text-2xl text-ink-900">{s.value}</p>
            <p className="text-xs font-semibold text-ink-400 uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {error && <p className="mt-6 text-red-600">{error}</p>}
      {!bookings && !error && <p className="mt-6 text-ink-500">Loading…</p>}

      {bookings && bookings.length === 0 && (
        <div className="card p-10 mt-6 text-center">
          <span className="text-4xl">📭</span>
          <p className="mt-3 font-semibold text-lg">No booking requests yet</p>
          <p className="text-ink-500 mt-1">
            Make sure your <Link to="/pro/availability" className="text-sage-700 font-semibold hover:underline">availability</Link> is
            up to date so customers can find open times.
          </p>
        </div>
      )}

      {pending.length > 0 && (
        <>
          <h2 className="mt-8 mb-3 font-semibold text-lg text-ink-900">Requests waiting on you</h2>
          <div className="space-y-4">
            {pending.map(b => (
              <BookingCard key={b.id} booking={b} viewer="PROVIDER"
                actions={
                  <>
                    <button onClick={() => setStatus(b.id, 'CONFIRMED')} className="btn-stamp-green">Accept</button>
                    <button onClick={() => setStatus(b.id, 'DECLINED')} className="btn-stamp-red">Decline</button>
                  </>
                } />
            ))}
          </div>
        </>
      )}

      {confirmed.length > 0 && (
        <>
          <h2 className="mt-10 mb-3 font-semibold text-lg text-ink-900">Confirmed</h2>
          <div className="space-y-4">
            {confirmed.map(b => (
              <BookingCard key={b.id} booking={b} viewer="PROVIDER"
                actions={
                  <>
                    {new Date(b.end) <= new Date() && (
                      <button onClick={() => setStatus(b.id, 'COMPLETED')} className="btn-stamp-blue">Mark completed</button>
                    )}
                    <button onClick={() => setStatus(b.id, 'CANCELLED')} className="btn-stamp-red">Cancel</button>
                  </>
                } />
            ))}
          </div>
        </>
      )}

      {done.length > 0 && (
        <>
          <h2 className="mt-10 mb-3 font-semibold text-lg text-ink-900">History</h2>
          <div className="space-y-4">
            {done.map(b => <BookingCard key={b.id} booking={b} viewer="PROVIDER" />)}
          </div>
        </>
      )}
    </div>
  );
}
