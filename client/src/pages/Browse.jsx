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
      <p className="section-tag">The file drawer</p>
      <h1 className="mt-2 text-4xl font-bold text-ink-900">Find a pro</h1>

      <form onSubmit={submitSearch} className="mt-6 max-w-md">
        <label className="label">Look up</label>
        <div className="flex gap-2">
          <input className="input" placeholder="name, service, or city…"
            value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn-primary shrink-0">Search</button>
        </div>
      </form>

      <div className="mt-5 flex flex-wrap gap-2">
        {CATEGORIES.map(c => (
          <button key={c.key} onClick={() => setCategory(c.key)}
            className={`chip ${category === c.key
              ? 'bg-ink-900 border-ink-900 text-paper-50'
              : 'bg-paper-50 border-ink-900 text-ink-900 hover:bg-carbon-canary'}`}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {error && <p className="mt-8 font-mono text-sm text-stamp-red">{error}</p>}
      {!providers && !error && <p className="mt-8 font-mono text-sm text-ink-500 animate-pulse">Riffling the drawer…</p>}
      {providers && providers.length === 0 && (
        <div className="slip p-8 mt-8 max-w-md text-center">
          <span className="stamp-void">NO MATCH</span>
          <p className="mt-4 font-mono text-sm text-ink-500">Nothing filed under that yet — try another category.</p>
        </div>
      )}
      {providers && providers.length > 0 && (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map(p => <ProviderCard key={p.id} provider={p} />)}
        </div>
      )}
    </div>
  );
}
