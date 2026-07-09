import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { CATEGORIES } from '../lib/categories.js';
import CategoryIcon from '../components/CategoryIcon.jsx';
import Avatar from '../components/Avatar.jsx';
import Stars from '../components/Stars.jsx';
import ProviderCard from '../components/ProviderCard.jsx';

const HERO_IMG = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80';

const STEPS = [
  { n: '1', title: 'Tell us what you need', text: 'Pick a service — housekeeping, a sitter for Saturday, a dog walker for the workweek.' },
  { n: '2', title: 'Choose your person', text: 'Real people with faces, reviews, and real open time slots. No phone tag, no strangers.' },
  { n: '3', title: 'Book a time that works', text: 'Grab an open slot in seconds — or plan your whole week in one go.' },
];

const PRO_PERKS = [
  { title: 'Keep every dollar of your rate', text: 'You set the price, customers pay you directly. The platform takes nothing in v1.' },
  { title: 'Offer everything you\'re good at', text: 'Cleaning and organizing? Lawns and handyman work? List every service you offer — more skills on your profile means more booked hours.' },
  { title: 'Win regulars, not one-offs', text: 'Weekly plans put you in a household\'s routine — the same families, the same slots, income you can count on.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [pros, setPros] = useState([]);

  useEffect(() => {
    api('/providers')
      .then(({ providers }) => {
        setPros([...providers].sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0)));
      })
      .catch(() => {});
  }, []);

  const search = (e) => {
    e.preventDefault();
    navigate(q ? `/browse?q=${encodeURIComponent(q)}` : '/browse');
  };

  const featured = pros.slice(0, 4);
  const faces = pros.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-sage-50 blur-3xl" aria-hidden />
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative grid lg:grid-cols-[1.1fr,0.9fr] gap-12 items-center">
          <div className="animate-rise">
            <span className="badge !bg-sage-100 !text-sage-700 mb-5">Local pros with real availability</span>
            <h1 className="text-4xl md:text-6xl font-bold leading-[1.05] text-ink-900">
              Real people.<br />
              <span className="text-sage-600">Trusted help.</span>
            </h1>
            <p className="mt-5 text-lg text-ink-500 max-w-xl leading-relaxed">
              Housekeeping, babysitting, dog walking, yard work, and more — book vetted
              neighbors by name, see their real open time slots, and plan your whole week in minutes.
            </p>
            <form onSubmit={search} className="mt-8 flex gap-2 max-w-lg">
              <input
                className="input !py-3.5 !rounded-full !px-5"
                placeholder="Try “house cleaning” or “babysitter”…"
                value={q}
                onChange={e => setQ(e.target.value)}
              />
              <button className="btn-primary !px-7 shrink-0">Search</button>
            </form>
            <div className="mt-6 flex flex-wrap gap-2">
              {CATEGORIES.slice(0, 5).map(c => (
                <Link key={c.key} to={`/browse?category=${c.key}`}
                  className="chip bg-white border-paper-200 text-ink-700 hover:border-sage-300 hover:text-sage-700">
                  <CategoryIcon k={c.key} className="w-4 h-4 text-sage-600" /> {c.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden lg:block relative animate-fade-in">
            <img src={HERO_IMG} alt="A pro at work in a bright home"
              className="rounded-4xl object-cover w-full h-[440px] shadow-press" />
            {faces[0] && (
              <div className="absolute -left-8 bottom-10 card !rounded-2xl p-3 pr-5 flex items-center gap-3 shadow-press animate-rise">
                <Avatar name={faces[0].user.name} src={faces[0].photoUrl} className="w-11 h-11" />
                <div>
                  <p className="text-sm font-semibold text-ink-900">{faces[0].user.name}</p>
                  <Stars rating={faces[0].avgRating} size="text-xs" />
                </div>
              </div>
            )}
            {faces[1] && (
              <div className="absolute -right-4 top-8 card !rounded-2xl p-3 pr-5 flex items-center gap-3 shadow-press animate-rise" style={{ animationDelay: '.15s' }}>
                <Avatar name={faces[1].user.name} src={faces[1].photoUrl} className="w-11 h-11" />
                <div>
                  <p className="text-sm font-semibold text-ink-900">{faces[1].user.name}</p>
                  <p className="text-xs text-ink-500">booked 3× this week</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-ink-900">What do you need done?</h2>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map(c => (
            <Link key={c.key} to={`/browse?category=${c.key}`}
              className="card p-5 hover:shadow-press hover:-translate-y-1 transition-all duration-300 group">
              <span className="w-11 h-11 rounded-2xl bg-sage-50 text-sage-600 flex items-center justify-center
                               group-hover:bg-sage-100 transition">
                <CategoryIcon k={c.key} className="w-6 h-6" />
              </span>
              <p className="mt-3 font-semibold text-ink-900 group-hover:text-sage-700 transition">{c.label}</p>
              <p className="mt-1 text-sm text-ink-500">{c.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Weekly plan pitch */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="rounded-4xl bg-white border border-paper-200 shadow-sheet px-8 py-10 md:px-12 md:flex items-center gap-10">
          <div className="flex-1">
            <span className="badge !bg-sage-100 !text-sage-700">New</span>
            <h2 className="mt-3 text-2xl md:text-3xl font-bold text-ink-900">Plan your whole week at once</h2>
            <p className="mt-3 text-ink-500 leading-relaxed max-w-xl">
              A cleaner on Monday, dog walks Tuesday to Thursday, a sitter for Friday night —
              combine different services, different pros, and different times into one weekly plan
              with one total. Your pros get a regular; you get your week back.
            </p>
            <Link to="/plan" className="btn-primary mt-6">Build my week →</Link>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-3 shrink-0 mt-8 md:mt-0">
            {[['Mon', 'Home clean', '9:00'], ['Tue–Thu', 'Dog walks', '7:30'], ['Fri', 'Babysitter', '18:00'], ['Sat', 'Lawn care', '10:00']].map(([d, s, t]) => (
              <div key={d} className="rounded-2xl border border-paper-200 bg-paper-50 px-4 py-3 w-40">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-sage-600">{d} · {t}</p>
                <p className="text-sm font-medium text-ink-900 mt-0.5">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet the pros — the people first */}
      {faces.length > 0 && (
        <section className="bg-white/70 border-y border-paper-200">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <h2 className="text-2xl md:text-3xl font-bold text-ink-900">The people behind the work</h2>
            <p className="mt-2 text-ink-500 max-w-2xl">
              Every pro on MyTimeBooked is a neighbor with a name, a face, and a track record — not a logo.
            </p>
            <div className="mt-8 grid md:grid-cols-3 gap-6">
              {faces.map(p => (
                <Link key={p.id} to={`/providers/${p.id}`}
                  className="card p-6 text-center hover:shadow-press hover:-translate-y-1 transition-all duration-300 group">
                  <Avatar name={p.user.name} src={p.photoUrl} className="w-24 h-24 mx-auto" textSize="text-3xl" />
                  <p className="mt-4 font-semibold text-lg text-ink-900 group-hover:text-sage-700 transition">{p.user.name}</p>
                  <p className="text-sm text-ink-500 mt-1 leading-snug">“{p.headline}”</p>
                  <div className="mt-3 flex justify-center"><Stars rating={p.avgRating} count={p.reviewCount} /></div>
                  <p className="mt-2 text-xs text-ink-400">
                    {p.services.length > 1 ? `Also offers ${p.services.length - 1} more service${p.services.length > 2 ? 's' : ''}` : p.city}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-ink-900">How it works</h2>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {STEPS.map(s => (
            <div key={s.n} className="card p-6">
              <span className="w-10 h-10 rounded-full bg-sage-gradient text-white font-bold
                               flex items-center justify-center text-lg shadow-sm shadow-sage-500/30">{s.n}</span>
              <h3 className="mt-4 font-semibold text-lg text-ink-900">{s.title}</h3>
              <p className="mt-2 text-sm text-ink-500 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured pros */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl md:text-3xl font-bold text-ink-900">Top-rated near you</h2>
            <Link to="/browse" className="text-sm font-semibold text-sage-700 hover:text-sage-600">
              See all →
            </Link>
          </div>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map(p => <ProviderCard key={p.id} provider={p} />)}
          </div>
        </section>
      )}

      {/* Pro CTA — worker benefits, spelled out */}
      <section className="max-w-6xl mx-auto px-4 pb-8">
        <div className="rounded-4xl bg-ink-900 text-paper-50 px-8 py-12 md:px-14 shadow-press">
          <div className="md:flex items-end justify-between gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Built around the people who do the work</h2>
              <p className="mt-2 text-paper-200/80 max-w-lg leading-relaxed">
                Your face, your rates, your hours — and tools designed to grow your income.
              </p>
            </div>
            <Link to="/become-a-pro" className="btn-primary !px-8 !py-3.5 mt-6 md:mt-0 shrink-0">
              Become a pro
            </Link>
          </div>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {PRO_PERKS.map(p => (
              <div key={p.title} className="rounded-2xl bg-white/5 border border-white/10 p-5">
                <h3 className="font-semibold text-paper-50">{p.title}</h3>
                <p className="mt-1.5 text-sm text-paper-200/70 leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
