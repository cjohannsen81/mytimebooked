import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../lib/auth.jsx';

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="w-9 h-9 rounded-xl bg-sage-gradient flex items-center justify-center shadow-sm shadow-sage-500/30">
        <svg viewBox="0 0 64 64" className="w-5 h-5">
          <circle cx="32" cy="32" r="20" fill="none" stroke="#fbfaf6" strokeWidth="6" />
          <path d="M32 20v12l8 6" fill="none" stroke="#fbfaf6" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="font-bold text-lg tracking-tight text-ink-900">
        MyTime<span className="text-sage-600">Booked</span>
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
        { to: '/pro', label: 'My jobs' },
        { to: '/pro/availability', label: 'Availability' },
        { to: '/pro/profile', label: 'Profile' },
      ]
    : user
      ? [
          { to: '/browse', label: 'Find help' },
          { to: '/dashboard', label: 'My bookings' },
        ]
      : [
          { to: '/browse', label: 'Find help' },
          { to: '/become-a-pro', label: 'Become a pro' },
        ];

  return (
    <header className="sticky top-0 z-40 bg-paper-50/90 backdrop-blur border-b border-paper-200">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Logo />
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-full text-sm font-medium transition ${
                  isActive ? 'text-sage-700 bg-sage-100' : 'text-ink-700 hover:text-ink-900 hover:bg-paper-100'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <div className="flex items-center gap-3 ml-3">
              <span className="text-sm text-ink-500">Hi, {user.name.split(' ')[0]}</span>
              <button onClick={handleLogout} className="btn-ghost !py-2">Log out</button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-3">
              <Link to="/login" className="btn-ghost !py-2">Log in</Link>
              <Link to="/register" className="btn-primary !py-2">Sign up</Link>
            </div>
          )}
        </div>
        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          <svg className="w-6 h-6 text-ink-900" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {open
              ? <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              : <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>
      {open && (
        <div className="md:hidden border-t border-paper-200 bg-white px-4 py-3 space-y-1">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-medium text-ink-700 hover:bg-paper-100">
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <button onClick={handleLogout}
              className="block w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-ink-700 hover:bg-paper-100">
              Log out
            </button>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-medium text-ink-700 hover:bg-paper-100">
                Log in
              </NavLink>
              <NavLink to="/register" onClick={() => setOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-medium text-sage-700 bg-sage-100">
                Sign up
              </NavLink>
            </>
          )}
        </div>
      )}
    </header>
  );
}
