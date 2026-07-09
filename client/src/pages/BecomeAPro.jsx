import { Link } from 'react-router-dom';
import { CATEGORIES } from '../lib/categories.js';

const PERKS = [
  { icon: '💰', title: 'Set your own rates', text: 'You decide what your time is worth and keep what you earn — customers pay you directly.' },
  { icon: '🗓️', title: 'Work when you want', text: 'Publish availability windows. Customers can only book times you\'ve opened up.' },
  { icon: '⭐', title: 'Build your reputation', text: 'Reviews from completed jobs help you stand out and charge what you deserve.' },
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
        {PERKS.map(p => (
          <div key={p.title} className="card p-6">
            <span className="text-3xl">{p.icon}</span>
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
              {c.icon} {c.label}
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
