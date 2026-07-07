import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-pine-950 text-linen-200 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-display font-bold text-linen-50">
          MyTime<span className="text-sun-400">Booked</span>
        </p>
        <p className="text-sm text-linen-300/80">
          Trusted local help for your home & family.
        </p>
        <div className="flex gap-5 text-sm">
          <Link to="/browse" className="hover:text-sun-300 transition">Find help</Link>
          <Link to="/become-a-pro" className="hover:text-sun-300 transition">Become a pro</Link>
        </div>
      </div>
    </footer>
  );
}
