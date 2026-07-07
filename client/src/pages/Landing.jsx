import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { CATEGORIES } from '../lib/categories.js';
import ProviderCard from '../components/ProviderCard.jsx';

const STEPS = [
  { n: '1', title: 'Tell us what you need', text: 'Pick a service — housekeeping, a sitter for Saturday, a dog walker for the workweek.' },
  { n: '2', title: 'Choose your pro', text: 'Compare local pros by rate, reviews, and real availability. No phone tag.' },
  { n: '3', title: 'Book a time that works', text: 'Grab an open slot in seconds. Your pro confirms and shows up — it\'s their job to.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api('/providers')
      .then(({ providers }) => {
        const sorted = [...providers].sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
        setFeatured(sorted.slice(0, 4));
      })
      .catch(() => {});
  }, []);

  const search = (e) => {
    e.preventDefault();
    navigate(q ? `/browse?q=${encodeURIComponent(q)}` : '/browse');
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-pine-900 text-linen-50 overflow-hidden relative">
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fbfaf7 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 relative">
          <div className="max-w-2xl animate-rise">
            <p className="badge bg-pine-800 text-sun-300 mb-5">★ Local pros, real availability</p>
            <h1 className="text-4xl md:text-6xl font-bold leading-[1.05]">
              Your to-do list,<br />
              <span className="text-sun-400">somebody else's</span> today.
            </h1>
            <p className="mt-5 text-lg text-linen-200/90 max-w-xl">
              Book trusted local help for your home and family — housekeeping, babysitting,
              dog walking, yard work, and more. See real open time slots and book in minutes.
            </p>
            <form onSubmit={search} className="mt-8 flex gap-2 max-w-lg">
              <input
                className="input !py-3.5 !text-base"
                placeholder="Try “house cleaning” or “babysitter”…"
                value={q}
                onChange={e => setQ(e.target.value)}
              />
              <button className="btn-accent !px-7 !text-base shrink-0">Search</button>
            </form>
            <div className="mt-6 flex flex-wrap gap-2">
              {CATEGORIES.slice(0, 5).map(c => (
                <Link key={c.key} to={`/browse?category=${c.key}`}
                  className="chip bg-pine-800/70 border-pine-700 text-linen-100 hover:border-sun-400">
                  {c.icon} {c.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-pine-900">What do you need done?</h2>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map(c => (
            <Link key={c.key} to={`/browse?category=${c.key}`}
              className="card p-5 hover:border-pine-300 hover:shadow-md transition group">
              <span className="text-3xl">{c.icon}</span>
              <p className="mt-3 font-bold text-ink-900 group-hover:text-pine-800 transition">{c.label}</p>
              <p className="mt-1 text-sm text-ink-500">{c.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-linen-100 border-y border-linen-200">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-pine-900">How it works</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {STEPS.map(s => (
              <div key={s.n} className="card p-6">
                <span className="w-10 h-10 rounded-xl bg-sun-400 text-pine-950 font-display font-bold
                                 flex items-center justify-center text-lg">{s.n}</span>
                <h3 className="mt-4 font-bold text-lg text-ink-900">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-500 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured pros */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl md:text-3xl font-bold text-pine-900">Top-rated pros near you</h2>
            <Link to="/browse" className="text-sm font-semibold text-pine-700 hover:text-pine-800">
              See all →
            </Link>
          </div>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map(p => <ProviderCard key={p.id} provider={p} />)}
          </div>
        </section>
      )}

      {/* Pro CTA */}
      <section className="max-w-6xl mx-auto px-4 pb-8">
        <div className="rounded-4xl bg-pine-900 text-linen-50 px-8 py-12 md:px-14 md:flex items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Good at what you do?</h2>
            <p className="mt-2 text-linen-200/90 max-w-lg">
              Set your own rates and hours. Get booked by neighbors who need exactly what you offer.
            </p>
          </div>
          <Link to="/become-a-pro" className="btn-accent !px-8 !py-3.5 !text-base mt-6 md:mt-0 shrink-0">
            Become a pro
          </Link>
        </div>
      </section>
    </div>
  );
}
