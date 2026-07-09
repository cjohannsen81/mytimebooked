import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-paper-200 bg-paper-100/60">
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-bold tracking-tight text-ink-900">
          MyTime<span className="text-sage-600">Booked</span>
        </p>
        <p className="text-sm text-ink-500">
          Trusted local help for your home & family.
        </p>
        <div className="flex gap-5 text-sm font-medium">
          <Link to="/browse" className="text-ink-700 hover:text-sage-700 transition">Find help</Link>
          <Link to="/become-a-pro" className="text-ink-700 hover:text-sage-700 transition">Become a pro</Link>
          <a href="/labs/" className="text-ink-400 hover:text-sage-700 transition">Labs</a>
        </div>
      </div>
    </footer>
  );
}
