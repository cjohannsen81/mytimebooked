import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { CATEGORIES } from '../lib/categories.js';
import ProviderCard from '../components/ProviderCard.jsx';

const STEPS = [
  { n: '01', title: 'Write the order', text: 'Pick a service and tell us what needs doing — the form takes a minute, not a phone call.' },
  { n: '02', title: 'Pick your pro', text: 'Compare local pros by rate, reviews, and real open hours. Every profile is a file card.' },
  { n: '03', title: 'Get it stamped', text: 'Your pro stamps the slip CONFIRMED, shows up, does the work, stamps it DONE. That\'s it.' },
];

function SampleSlip() {
  return (
    <div className="slip w-full max-w-sm rotate-2 hover:rotate-0 transition-transform duration-300">
      <div className="flex items-center justify-between px-5 py-2 border-b-2 border-ink-900">
        <span className="font-mono text-xs font-bold uppercase tracking-[0.2em]">
          Work order <span className="text-stamp-red">No. 000241</span>
        </span>
        <span className="font-mono text-[10px] text-ink-400">MTB-01</span>
      </div>
      <div className="px-5 py-4">
        <div className="field-row"><span className="field-label">Service</span><span className="field-value">🧹 Deep clean / move-out</span></div>
        <div className="field-row"><span className="field-label">Pro</span><span className="field-value">Maria Santos ★4.9</span></div>
        <div className="field-row"><span className="field-label">When</span><span className="field-value">Thu · 9:00a–12:00p</span></div>
        <div className="field-row"><span className="field-label">Total</span><span className="field-value font-bold">$180</span></div>
        <div className="flex justify-end mt-3">
          <span className="stamp-confirmed">CONFIRMED ✓</span>
        </div>
      </div>
      <div className="perf-top px-5 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-ink-400">
        ✂ keep this portion
      </div>
    </div>
  );
}

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
      {/* Hero — the cover sheet of the pad */}
      <section className="border-b-4 border-double border-ink-900">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid lg:grid-cols-[1fr,auto] gap-12 items-center">
          <div className="animate-rise">
            <p className="section-tag">Form MTB-01 · Household work order pad</p>
            <h1 className="mt-4 text-5xl md:text-7xl font-bold leading-[0.95] text-ink-900">
              Get it off<br />your list.<br />
              <span className="relative inline-block">
                Officially.
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 10" preserveAspectRatio="none">
                  <path d="M2 7 Q 50 2, 100 6 T 198 5" fill="none" stroke="#b23a2a" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="mt-6 text-lg text-ink-700 max-w-lg">
              Housekeeping, babysitting, dog walking, yard work — write the order,
              a trusted local pro stamps it, and it gets <em>done</em>.
            </p>
            <form onSubmit={search} className="mt-8 max-w-lg">
              <label className="label">Describe the job</label>
              <div className="flex gap-2">
                <input
                  className="input !py-3"
                  placeholder="e.g. deep clean before move-out…"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                />
                <button className="btn-primary !px-6 shrink-0">Find a pro</button>
              </div>
            </form>
            <div className="mt-6 flex flex-wrap gap-2">
              {CATEGORIES.slice(0, 5).map(c => (
                <Link key={c.key} to={`/browse?category=${c.key}`}
                  className="chip bg-paper-50 border-ink-900 text-ink-900 hover:bg-carbon-canary">
                  {c.icon} {c.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden lg:block animate-rise">
            <SampleSlip />
          </div>
        </div>
      </section>

      {/* Services index */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <p className="section-tag">Index of services</p>
        <h2 className="mt-2 text-3xl md:text-4xl font-bold text-ink-900">What needs doing?</h2>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((c, i) => (
            <Link key={c.key} to={`/browse?category=${c.key}`}
              className="slip p-4 hover:-translate-y-0.5 hover:shadow-press transition group">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{c.icon}</span>
                <span className="font-mono text-[10px] text-ink-400">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <p className="mt-3 font-display font-bold text-lg text-ink-900 group-hover:underline decoration-2 underline-offset-2">
                {c.label}
              </p>
              <p className="mt-1 text-sm text-ink-500 border-t-2 border-dotted border-paper-300 pt-1.5">{c.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How the pad works */}
      <section className="border-y-4 border-double border-ink-900 bg-paper-50/60">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <p className="section-tag">Instructions for use</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-ink-900">How the pad works</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-5">
            {STEPS.map(s => (
              <div key={s.n} className="slip p-6">
                <span className="font-mono font-bold text-stamp-red text-sm">{s.n}</span>
                <h3 className="mt-2 font-display font-bold text-xl text-ink-900">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-700 leading-relaxed border-t-2 border-dotted border-paper-300 pt-2">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured pros */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-end justify-between">
            <div>
              <p className="section-tag">From the file drawer</p>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold text-ink-900">Top-rated pros</h2>
            </div>
            <Link to="/browse" className="font-mono text-xs font-semibold uppercase tracking-wider text-ink-700 hover:underline decoration-dotted underline-offset-4">
              Full index →
            </Link>
          </div>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map(p => <ProviderCard key={p.id} provider={p} />)}
          </div>
        </section>
      )}

      {/* Pro CTA */}
      <section className="max-w-6xl mx-auto px-4 pb-8">
        <div className="slip !bg-ink-900 text-paper-50 px-8 py-12 md:px-14 md:flex items-center justify-between gap-8">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-paper-400">Now hiring every trade</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold">Good with your hands? Carry the pad.</h2>
            <p className="mt-3 text-paper-200 max-w-lg">
              Set your rates, post your hours, and stamp your own work orders.
              Neighbors are already looking for you.
            </p>
          </div>
          <Link to="/become-a-pro" className="btn-accent !px-8 !py-3.5 mt-6 md:mt-0 shrink-0">
            Become a pro
          </Link>
        </div>
      </section>
    </div>
  );
}
