import { Link } from 'react-router-dom';
import { CATEGORIES } from '../lib/categories.js';

const PERKS = [
  { n: '01', title: 'Set your own rates', text: 'You decide what your time is worth and keep what you earn — customers pay you directly.' },
  { n: '02', title: 'Work when you want', text: 'Post your hours. Customers can only file orders inside windows you\'ve opened.' },
  { n: '03', title: 'Stamp your own slips', text: 'Confirm, decline, or complete jobs with one tap. Reviews from stamped-DONE work build your file.' },
];

export default function BecomeAPro() {
  return (
    <div>
      <section className="border-b-4 border-double border-ink-900">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <p className="section-tag">Application for pad-carriers</p>
          <h1 className="mt-4 text-4xl md:text-6xl font-bold text-ink-900 leading-tight">
            Turn your skills into<br />
            <span className="relative inline-block">
              steady bookings
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 10" preserveAspectRatio="none">
                <path d="M2 7 Q 50 2, 100 6 T 198 5" fill="none" stroke="#b23a2a" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="mt-5 text-lg text-ink-700 max-w-xl mx-auto">
            Join MyTimeBooked as a pro and get discovered by neighbors who need housekeeping,
            childcare, pet care, yard work, and more.
          </p>
          <Link to="/register?role=PROVIDER" className="btn-accent !px-8 !py-3.5 mt-8">
            Sign up as a pro — it's free
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-5">
        {PERKS.map(p => (
          <div key={p.n} className="slip p-6">
            <span className="font-mono font-bold text-stamp-red text-sm">{p.n}</span>
            <h3 className="mt-2 font-display font-bold text-xl">{p.title}</h3>
            <p className="mt-2 text-sm text-ink-700 leading-relaxed border-t-2 border-dotted border-paper-300 pt-2">{p.text}</p>
          </div>
        ))}
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="section-tag text-center">— Trades wanted —</h2>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map(c => (
            <span key={c.key} className="chip bg-paper-50 border-ink-900 text-ink-900 !cursor-default">
              {c.icon} {c.label}
            </span>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/register?role=PROVIDER" className="btn-primary !px-8 !py-3">Open my pro file</Link>
        </div>
      </section>
    </div>
  );
}
