import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import Stars from '../components/Stars.jsx';
import TimeBar from '../components/TimeBar.jsx';
import { categoryIcon, categoryLabel } from '../lib/categories.js';
import { money, fmtDate, fmtTime, fmtDateTime } from '../lib/format.js';

function initials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && aEnd > bStart;

export default function ProviderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  // Booking form state
  const [serviceId, setServiceId] = useState('');
  const [slotId, setSlotId] = useState('');
  const [startIso, setStartIso] = useState('');
  const [hours, setHours] = useState(1);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookError, setBookError] = useState('');
  const [booked, setBooked] = useState(null);

  useEffect(() => {
    api(`/providers/${id}`)
      .then(setData)
      .catch(e => setError(e.message));
  }, [id]);

  const provider = data?.provider;
  const busy = useMemo(() => (data?.busy || []).map(b => ({ start: new Date(b.start), end: new Date(b.end) })), [data]);
  const service = provider?.services.find(s => s.id === serviceId);
  const slot = provider?.slots.find(s => s.id === slotId);

  useEffect(() => {
    if (provider && !serviceId && provider.services.length) {
      setServiceId(provider.services[0].id);
    }
  }, [provider, serviceId]);

  useEffect(() => {
    if (service) setHours(service.minHours);
  }, [serviceId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Hourly start options inside the chosen window that fit `hours` and avoid busy times.
  const startOptions = useMemo(() => {
    if (!slot || !hours) return [];
    const out = [];
    const windowStart = new Date(slot.start);
    const windowEnd = new Date(slot.end);
    const now = new Date();
    for (let t = windowStart.getTime(); t + hours * 36e5 <= windowEnd.getTime(); t += 36e5) {
      const s = new Date(t);
      const e = new Date(t + hours * 36e5);
      if (s <= now) continue;
      if (busy.some(b => overlaps(s, e, b.start, b.end))) continue;
      out.push(s.toISOString());
    }
    return out;
  }, [slot, hours, busy]);

  useEffect(() => {
    setStartIso(startOptions[0] || '');
  }, [startOptions]);

  const submit = async (e) => {
    e.preventDefault();
    setBookError('');
    if (!user) return navigate('/login');
    setSubmitting(true);
    try {
      const { booking } = await api('/bookings', {
        method: 'POST',
        body: { serviceId, start: startIso, hours, address, notes },
      });
      setBooked(booking);
    } catch (err) {
      setBookError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (error) return <p className="max-w-6xl mx-auto px-4 py-16 font-mono text-stamp-red">{error}</p>;
  if (!provider) return <p className="max-w-6xl mx-auto px-4 py-16 font-mono text-sm text-ink-500 animate-pulse">Pulling the file…</p>;

  const canBook = !user || user.role === 'CUSTOMER';

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-[1fr,400px] gap-8 items-start">
      {/* Left: the pro's file */}
      <div>
        <div className="slip overflow-hidden">
          <div className="flex items-center justify-between px-6 py-2 border-b-2 border-ink-900 bg-carbon-canary/50">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em]">
              Pro file No. {provider.id.slice(-4).toUpperCase()}
            </span>
            {provider.backgroundChecked && (
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-stamp-green">✓ vetted</span>
            )}
          </div>
          <div className="p-6 flex items-start gap-5">
            <div className="w-20 h-20 rounded-[4px] border-2 border-ink-900 bg-paper-100 font-display font-bold
                            flex items-center justify-center text-3xl shrink-0">
              {initials(provider.user.name)}
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold text-ink-900">{provider.user.name}</h1>
              <p className="text-ink-500 mt-0.5">{provider.headline}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-ink-500">
                <Stars rating={provider.avgRating} count={provider.reviewCount} size="text-xs" />
                <span>·</span>
                <span>{provider.city}, {provider.zip}</span>
                <span>·</span>
                <span>{provider.yearsExperience} yrs on the job</span>
              </div>
            </div>
          </div>
          <div className="px-6 pb-6">
            <p className="section-tag">Notes on file</p>
            <p className="mt-2 text-ink-700 leading-relaxed whitespace-pre-line border-l-4 border-paper-300 pl-4">
              {provider.bio}
            </p>
          </div>
        </div>

        <div className="slip mt-5 p-6">
          <p className="section-tag">Rate card</p>
          <div className="mt-2 divide-y-2 divide-dotted divide-paper-300">
            {provider.services.map(s => (
              <div key={s.id} className="py-3 flex items-start justify-between gap-4">
                <div>
                  <p className="font-display font-bold text-lg text-ink-900">{categoryIcon(s.category)} {s.title}</p>
                  <p className="text-sm text-ink-500 mt-0.5">{s.description}</p>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-ink-400 mt-1">
                    {categoryLabel(s.category)} · {s.minHours}h minimum
                  </p>
                </div>
                <p className="font-display font-bold text-xl text-ink-900 whitespace-nowrap">
                  {money(s.hourlyRateCents)}<span className="font-mono text-xs text-ink-500">/hr</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="slip mt-5 p-6">
          <p className="section-tag">Customer testimony {provider.reviewCount ? `· ${provider.reviewCount} on record` : ''}</p>
          {provider.reviews.length === 0 && (
            <p className="mt-3 font-mono text-sm text-ink-500">Nothing on record yet.</p>
          )}
          <div className="mt-3 space-y-4">
            {provider.reviews.map(r => (
              <div key={r.id} className="border-b-2 border-dotted border-paper-300 last:border-0 pb-4 last:pb-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Stars rating={r.rating} size="text-xs" />
                  <span className="font-mono text-xs font-semibold text-ink-900">{r.customer.name}</span>
                  <span className="font-mono text-[10px] uppercase text-ink-400">{fmtDate(r.createdAt)}</span>
                </div>
                <p className="mt-1.5 text-sm text-ink-700">“{r.comment}”</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: a blank work order to fill in */}
      <div className="slip lg:sticky lg:top-24 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-2 border-b-2 border-ink-900 bg-paper-50">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em]">
            {booked ? <>Work order <span className="text-stamp-red">No. {booked.id.slice(-6).toUpperCase()}</span></> : 'New work order'}
          </span>
          <span className="font-mono text-[10px] text-ink-400">MTB-01</span>
        </div>

        {booked ? (
          <div className="p-6 text-center">
            <span className="stamp-pending !text-base !px-4 !py-2">FILED — AWAITING PRO</span>
            <p className="mt-5 text-sm text-ink-700">
              {provider.user.name.split(' ')[0]} has your slip for{' '}
              <strong className="font-mono">{fmtDateTime(booked.start)}</strong> and will stamp it shortly.
            </p>
            <Link to="/dashboard" className="btn-primary mt-6 w-full">View my orders</Link>
          </div>
        ) : !canBook ? (
          <p className="p-6 font-mono text-sm text-ink-500">
            You're signed in as a pro — switch to a customer account to file an order.
          </p>
        ) : (
          <form onSubmit={submit} className="p-5 space-y-4">
            <div>
              <label className="label">Service</label>
              <select className="input" value={serviceId} onChange={e => setServiceId(e.target.value)}>
                {provider.services.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.title} — {money(s.hourlyRateCents)}/hr
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Day</label>
              {provider.slots.length === 0 ? (
                <p className="font-mono text-sm text-ink-500">No open hours posted — check back soon.</p>
              ) : (
                <select className="input" value={slotId} onChange={e => setSlotId(e.target.value)}>
                  <option value="">Pick a day…</option>
                  {provider.slots.map(s => (
                    <option key={s.id} value={s.id}>
                      {fmtDate(s.start)} · {fmtTime(s.start)}–{fmtTime(s.end)}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {slot && service && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Hours</label>
                    <select className="input" value={hours} onChange={e => setHours(parseInt(e.target.value, 10))}>
                      {Array.from({ length: 8 }, (_, i) => service.minHours + i)
                        .filter(h => h * 36e5 <= new Date(slot.end) - new Date(slot.start))
                        .map(h => <option key={h} value={h}>{h}h</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Start</label>
                    <select className="input" value={startIso} onChange={e => setStartIso(e.target.value)}>
                      {startOptions.length === 0 && <option value="">No times fit</option>}
                      {startOptions.map(iso => (
                        <option key={iso} value={iso}>{fmtTime(iso)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {startIso && (
                  <TimeBar
                    windowStart={slot.start}
                    windowEnd={slot.end}
                    blockStart={startIso}
                    blockEnd={new Date(new Date(startIso).getTime() + hours * 36e5)}
                  />
                )}
                <div>
                  <label className="label">Address</label>
                  <input className="input" placeholder="where should they go?"
                    value={address} onChange={e => setAddress(e.target.value)} required />
                </div>
                <div>
                  <label className="label">Notes</label>
                  <textarea className="input" rows="2" placeholder="gate codes, pets, parking…"
                    value={notes} onChange={e => setNotes(e.target.value)} />
                </div>
                <div className="perf-top -mx-5 px-5 pt-3 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-400">estimated total</span>
                  <span className="font-display font-bold text-2xl text-ink-900">
                    {money(service.hourlyRateCents * hours)}
                  </span>
                </div>
                {bookError && <p className="font-mono text-sm text-stamp-red">{bookError}</p>}
                <button className="btn-accent w-full !py-3" disabled={submitting || !startIso}>
                  {submitting ? 'Filing…' : user ? 'File this order' : 'Log in to file'}
                </button>
                <p className="font-mono text-[10px] uppercase tracking-wider text-ink-400 text-center">
                  no charge to file · pay your pro directly
                </p>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
