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
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <span className="stamp-pending">FILE INCOMPLETE</span>
        <h1 className="mt-5 text-3xl font-bold text-ink-900">Finish your pro file</h1>
        <p className="mt-2 text-ink-500">Add your headline, bio, and services so customers can find and book you.</p>
        <Link to="/pro/profile" className="btn-accent mt-6">Set up my file</Link>
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
      <p className="section-tag">The clipboard</p>
      <h1 className="mt-2 text-4xl font-bold text-ink-900">My slips</h1>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { label: 'Inbox', value: pending.length },
          { label: 'Stamped', value: confirmed.length },
          { label: 'Earned', value: money(earnedCents) },
        ].map(s => (
          <div key={s.label} className="slip p-4 text-center">
            <p className="font-display font-bold text-2xl text-ink-900">{s.value}</p>
            <p className="font-mono text-[10px] font-bold text-ink-500 uppercase tracking-[0.2em] mt-1 border-t-2 border-dotted border-paper-300 pt-1">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {error && <p className="mt-6 font-mono text-sm text-stamp-red">{error}</p>}
      {!bookings && !error && <p className="mt-6 font-mono text-sm text-ink-500 animate-pulse">Flipping the pad…</p>}

      {bookings && bookings.length === 0 && (
        <div className="slip p-10 mt-8 text-center max-w-md mx-auto">
          <span className="stamp-pending">INBOX EMPTY</span>
          <p className="mt-4 font-display font-bold text-xl">No slips yet</p>
          <p className="mt-1 text-sm text-ink-500">
            Keep your <Link to="/pro/availability" className="font-bold text-ink-900 underline decoration-dotted underline-offset-4">posted hours</Link> up
            to date so customers can file orders with you.
          </p>
        </div>
      )}

      {pending.length > 0 && (
        <>
          <h2 className="mt-10 mb-3 section-tag">— Waiting for your stamp —</h2>
          <div className="space-y-5">
            {pending.map(b => (
              <BookingCard key={b.id} booking={b} viewer="PROVIDER"
                actions={
                  <>
                    <button onClick={() => setStatus(b.id, 'CONFIRMED')} className="btn-stamp-green">STAMP: CONFIRM ✓</button>
                    <button onClick={() => setStatus(b.id, 'DECLINED')} className="btn-stamp-red !text-[10px]">DECLINE</button>
                  </>
                } />
            ))}
          </div>
        </>
      )}

      {confirmed.length > 0 && (
        <>
          <h2 className="mt-12 mb-3 section-tag">— On the schedule —</h2>
          <div className="space-y-5">
            {confirmed.map(b => (
              <BookingCard key={b.id} booking={b} viewer="PROVIDER"
                actions={
                  <>
                    {new Date(b.end) <= new Date() && (
                      <button onClick={() => setStatus(b.id, 'COMPLETED')} className="btn-stamp-blue">STAMP: DONE ✓</button>
                    )}
                    <button onClick={() => setStatus(b.id, 'CANCELLED')} className="btn-stamp-red !text-[10px]">VOID</button>
                  </>
                } />
            ))}
          </div>
        </>
      )}

      {done.length > 0 && (
        <>
          <h2 className="mt-12 mb-3 section-tag">— Filed away —</h2>
          <div className="space-y-5">
            {done.map(b => <BookingCard key={b.id} booking={b} viewer="PROVIDER" />)}
          </div>
        </>
      )}
    </div>
  );
}
