import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { useArea } from '../lib/area.jsx';
import { CATEGORIES, categoryLabel } from '../lib/categories.js';
import CategoryIcon from '../components/CategoryIcon.jsx';
import Avatar from '../components/Avatar.jsx';
import Stars from '../components/Stars.jsx';
import { money, fmtDate, fmtTime } from '../lib/format.js';

const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && aEnd > bStart;

export default function WeekPlan() {
  const { user } = useAuth();
  const { area } = useArea();
  const navigate = useNavigate();

  const [providers, setProviders] = useState([]);
  // builder state
  const [cat, setCat] = useState('');
  const [proId, setProId] = useState('');
  const [detail, setDetail] = useState(null);   // { provider, busy }
  const [slotId, setSlotId] = useState('');
  const [hours, setHours] = useState(1);
  const [startIso, setStartIso] = useState('');
  // the plan
  const [plan, setPlan] = useState([]);
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/providers${area?.zip ? `?zip=${area.zip}` : ''}`)
      .then(({ providers }) => setProviders(providers))
      .catch(e => setError(e.message));
  }, [area?.zip]);

  const candidates = useMemo(
    () => providers.filter(p => cat && p.services.some(s => s.category === cat))
      .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0)),
    [providers, cat]
  );

  useEffect(() => {
    setDetail(null); setSlotId(''); setStartIso('');
    if (!proId) return;
    api(`/providers/${proId}`).then(setDetail).catch(e => setError(e.message));
  }, [proId]);

  const provider = detail?.provider;
  const service = provider?.services.find(s => s.category === cat);
  const slot = provider?.slots.find(s => s.id === slotId);

  useEffect(() => { if (service) setHours(service.minHours); }, [service?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // busy = server busy + items already in this plan for the same pro
  const busy = useMemo(() => {
    const server = (detail?.busy || []).map(b => ({ start: new Date(b.start), end: new Date(b.end) }));
    const planned = plan.filter(i => i.providerId === proId)
      .map(i => ({ start: new Date(i.startIso), end: new Date(new Date(i.startIso).getTime() + i.hours * 36e5) }));
    return [...server, ...planned];
  }, [detail, plan, proId]);

  const startOptions = useMemo(() => {
    if (!slot || !hours) return [];
    const out = [];
    const ws = new Date(slot.start), we = new Date(slot.end), now = new Date();
    for (let t = ws.getTime(); t + hours * 36e5 <= we.getTime(); t += 36e5) {
      const s = new Date(t), e = new Date(t + hours * 36e5);
      if (s <= now) continue;
      if (busy.some(b => overlaps(s, e, b.start, b.end))) continue;
      out.push(s.toISOString());
    }
    return out;
  }, [slot, hours, busy]);

  useEffect(() => { setStartIso(startOptions[0] || ''); }, [startOptions]);

  const addToPlan = () => {
    if (!service || !startIso) return;
    setPlan(p => [...p, {
      key: Date.now() + Math.random(),
      category: cat,
      providerId: provider.id,
      providerName: provider.user.name,
      photoUrl: provider.photoUrl,
      serviceId: service.id,
      serviceTitle: service.title,
      startIso, hours,
      priceCents: service.hourlyRateCents * hours,
    }]);
    setSlotId(''); setStartIso('');
  };

  const removeItem = key => setPlan(p => p.filter(i => i.key !== key));
  const total = plan.reduce((a, i) => a + i.priceCents, 0);

  // week columns: next 7 days
  const days = useMemo(() => {
    const out = [];
    for (let d = 1; d <= 7; d++) {
      const t = new Date(); t.setDate(t.getDate() + d); t.setHours(0, 0, 0, 0);
      out.push(t);
    }
    return out;
  }, []);
  const itemsOn = day => plan
    .filter(i => new Date(i.startIso).toDateString() === day.toDateString())
    .sort((a, b) => new Date(a.startIso) - new Date(b.startIso));

  const bookWeek = async () => {
    if (!user) return navigate('/login');
    if (user.role !== 'CUSTOMER') { setError('Switch to a customer account to book.'); return; }
    if (!address.trim()) { setError('Add your address first — every pro needs it.'); return; }
    setError(''); setSubmitting(true);
    const out = [];
    for (const item of plan) {
      try {
        const { booking } = await api('/bookings', {
          method: 'POST',
          body: { serviceId: item.serviceId, start: item.startIso, hours: item.hours, address },
        });
        out.push({ item, ok: true, booking });
      } catch (e) {
        out.push({ item, ok: false, error: e.message });
      }
    }
    setResults(out);
    setPlan(out.filter(r => !r.ok).map(r => r.item));
    setSubmitting(false);
  };

  if (results) {
    const okCount = results.filter(r => r.ok).length;
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 animate-rise">
        <h1 className="text-3xl font-bold text-ink-900">
          {okCount === results.length ? 'Your week is planned' : `${okCount} of ${results.length} requests sent`}
        </h1>
        <p className="mt-2 text-ink-500">Each pro confirms their visit individually — track them all in your bookings.</p>
        <div className="mt-6 space-y-3">
          {results.map((r, i) => (
            <div key={i} className={`card p-4 flex items-center gap-3 ${r.ok ? '' : '!border-red-200'}`}>
              <Avatar name={r.item.providerName} src={r.item.photoUrl} className="w-10 h-10" textSize="text-sm" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink-900 text-sm">{r.item.serviceTitle} · {r.item.providerName}</p>
                <p className="text-xs text-ink-500">{fmtDate(r.item.startIso)} · {fmtTime(r.item.startIso)} · {r.item.hours}h</p>
              </div>
              {r.ok
                ? <span className="stamp-pending">Requested</span>
                : <span className="text-xs text-red-600 max-w-[200px] text-right">{r.error}</span>}
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <Link to="/dashboard" className="btn-primary">View my bookings</Link>
          {plan.length > 0 && <button onClick={() => setResults(null)} className="btn-ghost">Fix the rest</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-ink-900">Plan my week</h1>
      <p className="mt-1 text-ink-500 max-w-2xl">
        Combine different services, pros, and times into one weekly plan — a cleaner Monday,
        dog walks midweek, a sitter Friday night. Book it all at once.
      </p>
      <p className="mt-1.5 text-sm">
        {area
          ? <span className="text-sage-700">Suggesting pros who serve {area.label} ({area.zip}).</span>
          : <span className="text-ink-400">Tip: set your location in the top bar so we only suggest pros who cover your address.</span>}
      </p>

      <div className="mt-8 grid lg:grid-cols-[420px,1fr] gap-6 items-start">
        {/* Builder */}
        <div className="card p-6 lg:sticky lg:top-24">
          <h2 className="font-semibold text-lg text-ink-900">Add to your week</h2>

          <label className="label mt-4">1 · Service</label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(c => (
              <button key={c.key} onClick={() => { setCat(c.key); setProId(''); }}
                className={`chip !px-3 !py-1.5 !text-xs ${cat === c.key
                  ? 'bg-sage-600 border-sage-600 text-white'
                  : 'bg-white border-paper-200 text-ink-700 hover:border-sage-300'}`}>
                <CategoryIcon k={c.key} className="w-3.5 h-3.5" /> {c.label}
              </button>
            ))}
          </div>

          {cat && (
            <>
              <label className="label mt-5">2 · Your person</label>
              {candidates.length === 0 && <p className="text-sm text-ink-500">No pros offer {categoryLabel(cat).toLowerCase()} yet.</p>}
              <div className="space-y-2 max-h-56 overflow-auto pr-1">
                {candidates.map(p => {
                  const svc = p.services.find(s => s.category === cat);
                  return (
                    <button key={p.id} onClick={() => setProId(p.id)}
                      className={`w-full flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                        proId === p.id ? 'border-sage-500 bg-sage-50' : 'border-paper-200 bg-white hover:border-sage-300'}`}>
                      <Avatar name={p.user.name} src={p.photoUrl} className="w-10 h-10" textSize="text-sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink-900 truncate">{p.user.name}</p>
                        <div className="flex items-center gap-1.5">
                          <Stars rating={p.avgRating} count={p.reviewCount} size="text-xs" />
                          {p.distanceMiles != null && <span className="text-[11px] text-ink-400">· {p.distanceMiles} mi</span>}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-ink-900 whitespace-nowrap">{money(svc.hourlyRateCents)}<span className="text-xs text-ink-400 font-normal">/hr</span></span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {provider && service && (
            <>
              <label className="label mt-5">3 · When</label>
              {provider.slots.length === 0 ? (
                <p className="text-sm text-ink-500">{provider.user.name.split(' ')[0]} has no open windows right now.</p>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  <select className="input" value={slotId} onChange={e => setSlotId(e.target.value)}>
                    <option value="">Pick a day…</option>
                    {provider.slots.map(s => (
                      <option key={s.id} value={s.id}>{fmtDate(s.start)} · {fmtTime(s.start)}–{fmtTime(s.end)}</option>
                    ))}
                  </select>
                  {slot && (
                    <div className="grid grid-cols-2 gap-2">
                      <select className="input" value={hours} onChange={e => setHours(parseInt(e.target.value, 10))}>
                        {Array.from({ length: 8 }, (_, i) => service.minHours + i)
                          .filter(h => h * 36e5 <= new Date(slot.end) - new Date(slot.start))
                          .map(h => <option key={h} value={h}>{h}h</option>)}
                      </select>
                      <select className="input" value={startIso} onChange={e => setStartIso(e.target.value)}>
                        {startOptions.length === 0 && <option value="">No times fit</option>}
                        {startOptions.map(iso => <option key={iso} value={iso}>{fmtTime(iso)}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}
              <button onClick={addToPlan} disabled={!startIso}
                className="btn-accent w-full mt-4">
                Add to my week · {service && startIso ? money(service.hourlyRateCents * hours) : '—'}
              </button>
            </>
          )}
        </div>

        {/* The week */}
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {days.map(day => {
              const items = itemsOn(day);
              return (
                <div key={day.toISOString()} className={`rounded-2xl border p-2.5 min-h-[120px] ${items.length ? 'border-sage-200 bg-sage-50/50' : 'border-paper-200 bg-white'}`}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                    {day.toLocaleDateString(undefined, { weekday: 'short' })} <span className="text-ink-900">{day.getDate()}</span>
                  </p>
                  <div className="mt-2 space-y-2">
                    {items.map(i => (
                      <div key={i.key} className="rounded-xl bg-white border border-paper-200 p-2 shadow-sm animate-rise">
                        <div className="flex items-center gap-1.5">
                          <Avatar name={i.providerName} src={i.photoUrl} className="w-6 h-6" textSize="text-[9px]" />
                          <CategoryIcon k={i.category} className="w-3.5 h-3.5 text-sage-600 shrink-0" />
                        </div>
                        <p className="mt-1 text-[11px] font-semibold text-ink-900 leading-tight">{i.serviceTitle}</p>
                        <p className="text-[10px] text-ink-500">{fmtTime(i.startIso)} · {i.hours}h · {money(i.priceCents)}</p>
                        <button onClick={() => removeItem(i.key)} className="text-[10px] text-ink-400 hover:text-red-500 mt-0.5">remove</button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card p-6 mt-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-ink-500">{plan.length ? `${plan.length} visit${plan.length > 1 ? 's' : ''} · ${new Set(plan.map(i => i.providerId)).size} pro${new Set(plan.map(i => i.providerId)).size > 1 ? 's' : ''}` : 'Your week is empty — add a service on the left.'}</p>
                <p className="font-bold text-2xl text-ink-900 mt-0.5">{money(total)}<span className="text-sm text-ink-400 font-normal"> / week</span></p>
              </div>
              <div className="flex-1 min-w-[220px] max-w-sm">
                <input className="input" placeholder="Your address (shared with your pros)"
                  value={address} onChange={e => setAddress(e.target.value)} />
              </div>
              <button onClick={bookWeek} disabled={!plan.length || submitting} className="btn-primary !px-7 !py-3">
                {submitting ? 'Booking…' : user ? `Book my week` : 'Log in & book my week'}
              </button>
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <p className="mt-3 text-xs text-ink-400">Each visit goes to its pro as a separate request — they confirm individually, and you pay each pro directly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
