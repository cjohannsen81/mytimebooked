import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { CATEGORIES } from '../lib/categories.js';
import ProviderCard from '../components/ProviderCard.jsx';

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const q = params.get('q') || '';
  const [search, setSearch] = useState(q);
  const [providers, setProviders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setProviders(null);
    const qs = new URLSearchParams();
    if (category) qs.set('category', category);
    if (q) qs.set('q', q);
    api(`/providers?${qs}`)
      .then(({ providers }) => setProviders(providers))
      .catch(e => setError(e.message));
  }, [category, q]);

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
      <h1 className="text-3xl font-bold text-pine-900">Find help</h1>

      <form onSubmit={submitSearch} className="mt-5 flex gap-2 max-w-md">
        <input className="input" placeholder="Search by name, service, or city…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn-primary shrink-0">Search</button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {CATEGORIES.map(c => (
          <button key={c.key} onClick={() => setCategory(c.key)}
            className={`chip ${category === c.key
              ? 'bg-pine-800 border-pine-800 text-linen-50'
              : 'bg-white border-linen-300 text-ink-700 hover:border-pine-400'}`}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {error && <p className="mt-8 text-red-600">{error}</p>}
      {!providers && !error && <p className="mt-8 text-ink-500">Loading pros…</p>}
      {providers && providers.length === 0 && (
        <p className="mt-8 text-ink-500">No pros match that search yet — try a different category.</p>
      )}
      {providers && providers.length > 0 && (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map(p => <ProviderCard key={p.id} provider={p} />)}
        </div>
      )}
    </div>
  );
}
