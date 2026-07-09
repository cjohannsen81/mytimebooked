import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { CATEGORIES } from '../lib/categories.js';
import CategoryIcon from '../components/CategoryIcon.jsx';
import Avatar from '../components/Avatar.jsx';
import { money } from '../lib/format.js';

const EMPTY_SERVICE = { category: 'HOUSEKEEPING', title: '', description: '', hourlyRate: '', minHours: 1 };

function ServiceForm({ initial = EMPTY_SERVICE, onSave, onCancel, busy }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="rounded-2xl border border-paper-200 bg-paper-50 p-4 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Category</label>
          <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Title</label>
          <input className="input" placeholder="e.g. Standard home cleaning"
            value={form.title} onChange={e => set('title', e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input" rows="2" placeholder="What's included?"
          value={form.description} onChange={e => set('description', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Hourly rate ($)</label>
          <input className="input" type="number" min="1" step="1" placeholder="45"
            value={form.hourlyRate} onChange={e => set('hourlyRate', e.target.value)} />
        </div>
        <div>
          <label className="label">Minimum hours</label>
          <input className="input" type="number" min="1" max="12"
            value={form.minHours} onChange={e => set('minHours', e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSave(form)} disabled={busy} className="btn-primary !py-2">Save service</button>
        <button onClick={onCancel} className="btn-ghost !py-2">Cancel</button>
      </div>
    </div>
  );
}

export default function ProviderProfileEdit() {
  const [profile, setProfile] = useState(undefined);
  const [form, setForm] = useState({ headline: '', bio: '', city: '', zip: '', yearsExperience: 0, photoUrl: '' });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(null); // null | 'new' | serviceId

  const load = () => {
    api('/providers/me').then(({ profile }) => {
      setProfile(profile);
      if (profile) {
        setForm({
          headline: profile.headline,
          bio: profile.bio,
          city: profile.city,
          zip: profile.zip,
          yearsExperience: profile.yearsExperience,
          photoUrl: profile.photoUrl || '',
        });
      }
    }).catch(e => setError(e.message));
  };
  useEffect(load, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      const { profile } = await api('/providers/me', { method: 'PUT', body: form });
      setProfile(profile);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const saveService = async (svc, id) => {
    setBusy(true);
    setError('');
    try {
      const body = {
        category: svc.category,
        title: svc.title,
        description: svc.description,
        hourlyRateCents: Math.round(parseFloat(svc.hourlyRate) * 100),
        minHours: svc.minHours,
      };
      if (id) await api(`/providers/me/services/${id}`, { method: 'PUT', body });
      else await api('/providers/me/services', { method: 'POST', body });
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const deleteService = async (id) => {
    if (!confirm('Remove this service?')) return;
    try {
      await api(`/providers/me/services/${id}`, { method: 'DELETE' });
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  if (profile === undefined && !error) {
    return <p className="max-w-3xl mx-auto px-4 py-16 text-ink-500">Loading…</p>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-ink-900">My pro profile</h1>
      {!profile && (
        <p className="mt-2 text-ink-500">
          This is what customers see. Fill it in, add at least one service, then set your{' '}
          <Link to="/pro/availability" className="text-sage-700 font-semibold hover:underline">availability</Link>.
        </p>
      )}

      <form onSubmit={saveProfile} className="card p-6 mt-6 space-y-4">
        <div className="flex items-center gap-4">
          <Avatar name={form.headline ? 'Your Photo' : 'You'} src={form.photoUrl} className="w-16 h-16" />
          <div className="flex-1">
            <label className="label">Your photo (URL)</label>
            <input className="input" type="url" placeholder="https://… — a friendly face gets booked more"
              value={form.photoUrl} onChange={e => set('photoUrl', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Headline</label>
          <input className="input" placeholder="e.g. Meticulous housekeeping with a personal touch"
            value={form.headline} onChange={e => set('headline', e.target.value)} required />
        </div>
        <div>
          <label className="label">About you</label>
          <textarea className="input" rows="4" placeholder="Experience, approach, what customers can expect…"
            value={form.bio} onChange={e => set('bio', e.target.value)} required />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="label">City</label>
            <input className="input" value={form.city} onChange={e => set('city', e.target.value)} required />
          </div>
          <div>
            <label className="label">ZIP</label>
            <input className="input" value={form.zip} onChange={e => set('zip', e.target.value)} required />
          </div>
        </div>
        <div>
          <label className="label">Years of experience</label>
          <input className="input" type="number" min="0" max="60"
            value={form.yearsExperience} onChange={e => set('yearsExperience', e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-sage-700 font-semibold">✓ Profile saved</p>}
        <div>
          <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : profile ? 'Save profile' : 'Create profile'}</button>
        </div>
      </form>

      {profile && (
        <div className="card p-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-lg text-ink-900">Services</h2>
              <p className="text-xs text-ink-400 mt-0.5">
                Every extra skill you list is extra booked hours — cleaning pros who add organizing or
                errands fill more of their week.
              </p>
            </div>
            {editing !== 'new' && (
              <button onClick={() => setEditing('new')} className="btn-accent !py-2 shrink-0">
                + Add {profile.services.length ? 'another' : 'a'} service
              </button>
            )}
          </div>

          {editing === 'new' && (
            <div className="mt-4">
              <ServiceForm onSave={svc => saveService(svc)} onCancel={() => setEditing(null)} busy={busy} />
            </div>
          )}

          <div className="mt-4 space-y-3">
            {profile.services.length === 0 && editing !== 'new' && (
              <p className="text-sm text-ink-500">No services yet — add one so customers can book you.</p>
            )}
            {profile.services.map(s => (
              editing === s.id ? (
                <ServiceForm key={s.id}
                  initial={{
                    category: s.category, title: s.title, description: s.description,
                    hourlyRate: s.hourlyRateCents / 100, minHours: s.minHours,
                  }}
                  onSave={svc => saveService(svc, s.id)}
                  onCancel={() => setEditing(null)}
                  busy={busy} />
              ) : (
                <div key={s.id} className="flex items-start justify-between gap-3 rounded-2xl border border-paper-200 p-4">
                  <div>
                    <p className="font-medium text-ink-900 flex items-center gap-1.5">
                      <CategoryIcon k={s.category} className="w-4 h-4 text-sage-600" /> {s.title}
                    </p>
                    <p className="text-sm text-ink-500 mt-0.5">{s.description}</p>
                    <p className="text-sm text-sage-700 font-semibold mt-1">
                      {money(s.hourlyRateCents)}/hr · {s.minHours}h min
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setEditing(s.id)} className="btn-ghost !py-1.5 !px-3 !text-xs">Edit</button>
                    <button onClick={() => deleteService(s.id)} className="btn-danger !py-1.5 !px-3 !text-xs">Delete</button>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
