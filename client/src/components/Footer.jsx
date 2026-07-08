import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-16 border-t-4 border-double border-ink-900 bg-paper-100">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink-500">
          MyTimeBooked · Form MTB-01 · Household work orders
        </p>
        <div className="flex gap-6 font-mono text-xs uppercase tracking-wider">
          <Link to="/browse" className="text-ink-700 hover:underline decoration-dotted underline-offset-4">Find a pro</Link>
          <Link to="/become-a-pro" className="text-ink-700 hover:underline decoration-dotted underline-offset-4">Carry the pad</Link>
          <a href="/labs/" className="text-stamp-red hover:underline decoration-dotted underline-offset-4">Labs ⚗</a>
        </div>
        <p className="font-mono text-[11px] text-ink-400">★ press hard — three copies ★</p>
      </div>
    </footer>
  );
}
