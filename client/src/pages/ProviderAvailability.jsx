import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { fmtDate, fmtTime } from '../lib/format.js';

export default function ProviderAvailability() {
  const [profile, setProfile] = useState(undefined);
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState('');
  const [from, setFrom] = useState('09:00');
  const [to, setTo] = useState('17:00');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const { profile } = await api('/providers/me');
      setProfile(profile);
      if (profile) {
        const { slots } = await api(`/availability/${profile.id}`);
        setSlots(slots);
      }
    } catch (e) {
      setError(e.message);
    }
  };
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api('/availability', {
        method: 'POST',
        body: {
          start: new Date(`${date}T${from}`).toISOString(),
          end: new Date(`${date}T${to}`).toISOString(),
        },
      });
      setDate('');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    try {
      await api(`/availability/${id}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  if (profile === null) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-ink-500">Create your <Link to="/pro/profile" className="text-pine-700 font-semibold hover:underline">pro profile</Link> first, then set your availability.</p>
      </div>
    );
  }

  const byDay = slots.reduce((acc, s) => {
    const key = fmtDate(s.start);
    (acc[key] = acc[key] || []).push(s);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-pine-900">Availability</h1>
      <p className="mt-1 text-ink-500">Customers can only book times inside these windows.</p>

      <form onSubmit={add} className="card p-6 mt-6 grid sm:grid-cols-[1fr,auto,auto,auto] gap-3 items-end">
        <div>
          <label className="label">Date</label>
          <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
        </div>
        <div>
          <label className="label">From</label>
          <input className="input" type="time" value={from} onChange={e => setFrom(e.target.value)} required />
        </div>
        <div>
          <label className="label">To</label>
          <input className="input" type="time" value={to} onChange={e => setTo(e.target.value)} required />
        </div>
        <button className="btn-accent !py-3" disabled={busy}>{busy ? 'Adding…' : 'Add window'}</button>
        {error && <p className="text-sm text-red-600 sm:col-span-4">{error}</p>}
      </form>

      <div className="mt-8 space-y-5">
        {slots.length === 0 && (
          <p className="text-ink-500">No upcoming windows. Add some so customers can book you.</p>
        )}
        {Object.entries(byDay).map(([day, daySlots]) => (
          <div key={day}>
            <h2 className="font-bold text-ink-900">{day}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {daySlots.map(s => (
                <span key={s.id} className="inline-flex items-center gap-2 rounded-xl bg-white border border-linen-300 px-3.5 py-2 text-sm font-semibold">
                  {fmtTime(s.start)} – {fmtTime(s.end)}
                  <button onClick={() => remove(s.id)} className="text-ink-400 hover:text-red-600 transition" aria-label="Remove window">✕</button>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
