import { Link } from 'react-router-dom';
import { CATEGORIES } from '../lib/categories.js';
import CategoryIcon from '../components/CategoryIcon.jsx';

const PERKS = [
  { title: 'Keep every dollar of your rate', text: 'You set the price and customers pay you directly — the platform takes nothing in v1.' },
  { title: 'Offer everything you\'re good at', text: 'List as many services as you have skills — cleaning and organizing, lawn and handyman work. More services means more booked hours from the same profile.' },
  { title: 'Win regulars, not one-offs', text: 'Customers build weekly plans — the same families, the same slots, every week. Your face and reviews are what they choose.' },
];

export default function BecomeAPro() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-sage-100/70 blur-3xl" aria-hidden />
        <div className="max-w-6xl mx-auto px-4 py-20 text-center relative animate-rise">
          <h1 className="text-4xl md:text-5xl font-bold text-ink-900 leading-tight">
            Turn your skills into <span className="text-sage-600">steady bookings</span>
          </h1>
          <p className="mt-4 text-lg text-ink-500 max-w-xl mx-auto leading-relaxed">
            Join MyTimeBooked as a pro and get discovered by neighbors who need housekeeping,
            childcare, pet care, yard work, and more.
          </p>
          <Link to="/register?role=PROVIDER" className="btn-primary !px-8 !py-3.5 mt-8">
            Sign up as a pro — it's free
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-6">
        {PERKS.map((p, i) => (
          <div key={p.title} className="card p-6">
            <span className="w-10 h-10 rounded-full bg-sage-gradient text-white font-bold
                             flex items-center justify-center text-lg shadow-sm shadow-sage-500/30">{i + 1}</span>
            <h3 className="mt-3 font-semibold text-lg text-ink-900">{p.title}</h3>
            <p className="mt-2 text-sm text-ink-500 leading-relaxed">{p.text}</p>
          </div>
        ))}
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-ink-900 text-center">Pros we're looking for</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map(c => (
            <span key={c.key} className="chip bg-white border-paper-200 text-ink-700 !cursor-default">
              <CategoryIcon k={c.key} className="w-4 h-4 text-sage-600" /> {c.label}
            </span>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/register?role=PROVIDER" className="btn-accent !px-8 !py-3">Create my pro account</Link>
        </div>
      </section>
    </div>
  );
}
