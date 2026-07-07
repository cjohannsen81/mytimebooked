import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../lib/auth.jsx';

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3 group">
      <span className="w-9 h-9 rounded-[4px] border-2 border-ink-900 bg-paper-50 shadow-press-sm
                       flex items-center justify-center group-hover:bg-carbon-canary transition">
        <svg viewBox="0 0 64 64" className="w-6 h-6">
          <line x1="14" y1="20" x2="50" y2="20" stroke="#242b23" strokeWidth="5" strokeLinecap="round" />
          <line x1="14" y1="32" x2="42" y2="32" stroke="#68705f" strokeWidth="5" strokeLinecap="round" strokeDasharray="1 8" />
          <g transform="rotate(-12 38 47)">
            <rect x="24" y="40" width="28" height="14" rx="2" fill="none" stroke="#b23a2a" strokeWidth="4" />
            <path d="M30 47l4 4 8-8" fill="none" stroke="#b23a2a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      </span>
      <span className="leading-none">
        <span className="block font-display font-bold text-xl text-ink-900">MyTimeBooked</span>
        <span className="block font-mono text-[9px] uppercase tracking-[0.3em] text-ink-500 mt-0.5">
          Household work orders
        </span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  const links = user?.role === 'PROVIDER'
    ? [
        { to: '/pro', label: 'My slips' },
        { to: '/pro/availability', label: 'Hours' },
        { to: '/pro/profile', label: 'Profile' },
      ]
    : user
      ? [
          { to: '/browse', label: 'Find a pro' },
          { to: '/dashboard', label: 'My orders' },
        ]
      : [
          { to: '/browse', label: 'Find a pro' },
          { to: '/become-a-pro', label: 'Carry the pad' },
        ];

  return (
    <header className="sticky top-0 z-40 bg-paper-100/95 backdrop-blur rule-double">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Logo />
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider rounded-[3px] transition ${
                  isActive
                    ? 'text-ink-900 bg-carbon-canary border border-ink-900'
                    : 'text-ink-700 hover:text-ink-900 hover:underline decoration-dotted underline-offset-4'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <div className="flex items-center gap-3 ml-4">
              <span className="font-mono text-xs text-ink-500 lowercase">clerk: {user.name.split(' ')[0]}</span>
              <button onClick={handleLogout} className="btn-ghost !py-1.5 !px-3">Log out</button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-4">
              <Link to="/login" className="btn-ghost !py-1.5 !px-3">Log in</Link>
              <Link to="/register" className="btn-primary !py-1.5 !px-3">Sign up</Link>
            </div>
          )}
        </div>
        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          <svg className="w-6 h-6 text-ink-900" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            {open
              ? <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              : <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>
      {open && (
        <div className="md:hidden border-t-2 border-ink-900 bg-paper-50 px-4 py-3 space-y-1">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}
              className="block px-3 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-ink-700 hover:bg-paper-100 rounded-[3px]">
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <button onClick={handleLogout}
              className="block w-full text-left px-3 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-ink-700 hover:bg-paper-100 rounded-[3px]">
              Log out
            </button>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setOpen(false)}
                className="block px-3 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-ink-700 hover:bg-paper-100 rounded-[3px]">
                Log in
              </NavLink>
              <NavLink to="/register" onClick={() => setOpen(false)}
                className="block px-3 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-ink-900 bg-carbon-canary rounded-[3px]">
                Sign up
              </NavLink>
            </>
          )}
        </div>
      )}
    </header>
  );
}
