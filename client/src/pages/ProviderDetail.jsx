import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { useArea } from '../lib/area.jsx';
import Stars from '../components/Stars.jsx';
import TimeBar from '../components/TimeBar.jsx';
import Avatar from '../components/Avatar.jsx';
import CategoryIcon from '../components/CategoryIcon.jsx';
import { categoryLabel } from '../lib/categories.js';
import { money, fmtDate, fmtTime, fmtDateTime } from '../lib/format.js';

const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && aEnd > bStart;

export default function ProviderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { area } = useArea();
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
    api(`/providers/${id}${area?.zip ? `?zip=${area.zip}` : ''}`)
      .then(setData)
      .catch(e => setError(e.message));
  }, [id, area?.zip]);

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

  if (error) return <p className="max-w-6xl mx-auto px-4 py-16 text-red-600">{error}</p>;
  if (!provider) return <p className="max-w-6xl mx-auto px-4 py-16 text-ink-500">Loading…</p>;

  const canBook = !user || user.role === 'CUSTOMER';

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-[1fr,380px] gap-8 items-start">
      {/* Left: profile */}
      <div className="animate-fade-in">
        <div className="flex items-start gap-4">
          <Avatar name={provider.user.name} src={provider.photoUrl} className="w-24 h-24" textSize="text-3xl" />
          <div>
            <h1 className="text-3xl font-bold text-ink-900">{provider.user.name}</h1>
            <p className="text-ink-500">{provider.headline}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-500">
              <Stars rating={provider.avgRating} count={provider.reviewCount} />
              <span>·</span>
              <span>{provider.city}, {provider.zip}</span>
              <span>·</span>
              <span>{provider.yearsExperience} yrs experience</span>
              {provider.backgroundChecked && (
                <span className="badge !bg-sage-100 !text-sage-700">✓ Background checked</span>
              )}
            </div>
            <p className="mt-2 text-sm text-ink-500">
              Serves within <span className="font-semibold text-ink-700">{provider.serviceRadiusMiles} miles</span> of {provider.city}
              {provider.distanceMiles != null && (
                provider.servesYou
                  ? <span className="text-sage-700 font-medium"> — covers you ({provider.distanceMiles} mi away)</span>
                  : <span className="text-red-600 font-medium"> — {provider.distanceMiles} mi from you, outside their area</span>
              )}
            </p>
          </div>
        </div>

        <div className="card p-6 mt-6">
          <h2 className="font-semibold text-lg text-ink-900">About</h2>
          <p className="mt-2 text-ink-700 leading-relaxed whitespace-pre-line">{provider.bio}</p>
        </div>

        <div className="card p-6 mt-4">
          <h2 className="font-semibold text-lg text-ink-900">Services & rates</h2>
          <div className="mt-3 divide-y divide-paper-200">
            {provider.services.map(s => (
              <div key={s.id} className="py-3 flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-ink-900 flex items-center gap-1.5">
                    <CategoryIcon k={s.category} className="w-4 h-4 text-sage-600" /> {s.title}
                  </p>
                  <p className="text-sm text-ink-500 mt-0.5">{s.description}</p>
                  <p className="text-xs text-ink-400 mt-1">{categoryLabel(s.category)} · {s.minHours}h minimum</p>
                </div>
                <p className="font-bold text-lg text-ink-900 whitespace-nowrap">
                  {money(s.hourlyRateCents)}<span className="text-sm text-ink-400 font-normal">/hr</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6 mt-4">
          <h2 className="font-semibold text-lg text-ink-900">Reviews {provider.reviewCount ? `(${provider.reviewCount})` : ''}</h2>
          {provider.reviews.length === 0 && (
            <p className="mt-2 text-sm text-ink-500">No reviews yet.</p>
          )}
          <div className="mt-3 space-y-4">
            {provider.reviews.map(r => (
              <div key={r.id} className="border-b border-paper-200 last:border-0 pb-4 last:pb-0">
                <div className="flex items-center gap-2">
                  <Stars rating={r.rating} />
                  <span className="text-sm font-medium text-ink-900">{r.customer.name}</span>
                  <span className="text-xs text-ink-400">{fmtDate(r.createdAt)}</span>
                </div>
                <p className="mt-1.5 text-sm text-ink-700">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: booking panel */}
      <div className="card p-6 lg:sticky lg:top-24">
        {booked ? (
          <div className="text-center py-6 animate-rise">
            <span className="mx-auto w-12 h-12 rounded-full bg-sage-100 text-sage-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            </span>
            <h2 className="mt-3 font-bold text-xl text-ink-900">Request sent!</h2>
            <p className="mt-2 text-sm text-ink-500 leading-relaxed">
              {provider.user.name.split(' ')[0]} has your request for{' '}
              <strong>{fmtDateTime(booked.start)}</strong> and will confirm shortly.
            </p>
            <Link to="/dashboard" className="btn-primary mt-6 w-full">View my bookings</Link>
          </div>
        ) : (
          <>
            <h2 className="font-bold text-xl text-ink-900">Book {provider.user.name.split(' ')[0]}</h2>
            {provider.servesYou === false && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2.5">
                Heads up: {area?.label} is outside {provider.user.name.split(' ')[0]}'s service area
                ({provider.serviceRadiusMiles} mi around {provider.city}). You can still request — they may decline.
              </p>
            )}
            {!canBook && (
              <p className="mt-3 text-sm text-ink-500">
                You're signed in as a pro — switch to a customer account to book.
              </p>
            )}
            {canBook && (
              <form onSubmit={submit} className="mt-4 space-y-4">
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
                    <p className="text-sm text-ink-500">No open availability right now — check back soon.</p>
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
                        <label className="label">Start time</label>
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
                      <input className="input" placeholder="Where should they go?"
                        value={address} onChange={e => setAddress(e.target.value)} required />
                    </div>
                    <div>
                      <label className="label">Notes (optional)</label>
                      <textarea className="input" rows="2" placeholder="Gate codes, pets, parking…"
                        value={notes} onChange={e => setNotes(e.target.value)} />
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-paper-100 px-4 py-3">
                      <span className="text-sm font-medium text-ink-700">Estimated total</span>
                      <span className="font-bold text-xl text-ink-900">
                        {money(service.hourlyRateCents * hours)}
                      </span>
                    </div>
                    {bookError && <p className="text-sm text-red-600">{bookError}</p>}
                    <button className="btn-primary w-full !py-3" disabled={submitting || !startIso}>
                      {submitting ? 'Sending…' : user ? 'Request booking' : 'Log in to book'}
                    </button>
                    <p className="text-xs text-ink-400 text-center">
                      You pay your pro directly after the job. No charge to request.
                    </p>
                  </>
                )}
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
