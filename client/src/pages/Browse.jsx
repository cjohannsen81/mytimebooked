import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useArea } from '../lib/area.jsx';
import { CATEGORIES } from '../lib/categories.js';
import CategoryIcon from '../components/CategoryIcon.jsx';
import ProviderCard from '../components/ProviderCard.jsx';

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const { area } = useArea();
  const category = params.get('category') || '';
  const q = params.get('q') || '';
  const [search, setSearch] = useState(q);
  const [maxMiles, setMaxMiles] = useState(0); // 0 = any distance
  const [providers, setProviders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setProviders(null);
    const qs = new URLSearchParams();
    if (category) qs.set('category', category);
    if (q) qs.set('q', q);
    if (area?.zip) qs.set('zip', area.zip);
    api(`/providers?${qs}`)
      .then(({ providers }) => setProviders(providers))
      .catch(e => setError(e.message));
  }, [category, q, area?.zip]);

  const setCategory = (key) => {
    const next = new URLSearchParams(params);
    if (key && key !== category) next.set('category', key);
    else next.delete('category');
    setParams(next);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(params);
    if (search) next.set('q', search);
    else next.delete('q');
    setParams(next);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-ink-900">Find help</h1>
      <p className="mt-1 text-sm text-ink-500">
        {area
          ? <>Showing pros who serve <span className="font-semibold text-sage-700">{area.label} ({area.zip})</span> — set in the top bar.</>
          : 'Set your location in the top bar to see only pros who serve your area.'}
      </p>

      <form onSubmit={submitSearch} className="mt-5 flex gap-2 max-w-md">
        <input className="input !rounded-full !px-5" placeholder="Search by name, service, or city…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn-primary shrink-0">Search</button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {CATEGORIES.map(c => (
          <button key={c.key} onClick={() => setCategory(c.key)}
            className={`chip ${category === c.key
              ? 'bg-sage-600 border-sage-600 text-white shadow-sm shadow-sage-500/25'
              : 'bg-white border-paper-200 text-ink-700 hover:border-sage-300 hover:text-sage-700'}`}>
            <CategoryIcon k={c.key} className="w-4 h-4" /> {c.label}
          </button>
        ))}
        {area && (
          <select value={maxMiles} onChange={e => setMaxMiles(+e.target.value)}
            className="chip bg-white border-paper-200 text-ink-700 !pr-8 appearance-none cursor-pointer">
            <option value={0}>Any distance</option>
            <option value={5}>Within 5 mi</option>
            <option value={10}>Within 10 mi</option>
            <option value={25}>Within 25 mi</option>
          </select>
        )}
      </div>

      {error && <p className="mt-8 text-red-600">{error}</p>}
      {!providers && !error && <p className="mt-8 text-ink-500">Loading pros…</p>}
      {providers && (() => {
        const shown = maxMiles && area
          ? providers.filter(p => p.distanceMiles == null || p.distanceMiles <= maxMiles)
          : providers;
        return shown.length === 0 ? (
          <div className="card p-10 mt-8 max-w-md text-center">
            <p className="font-semibold text-lg">No pros {area ? `serve ${area.label} for that yet` : 'match that search yet'}</p>
            <p className="text-ink-500 mt-1 text-sm">
              {area ? 'Try a wider distance, another category, or a different ZIP.' : 'Try a different category or a broader search.'}
            </p>
          </div>
        ) : (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shown.map(p => <ProviderCard key={p.id} provider={p} />)}
          </div>
        );
      })()}
    </div>
  );
}
