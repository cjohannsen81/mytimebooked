import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get('role') === 'PROVIDER' ? 'PROVIDER' : 'CUSTOMER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await register({ name, email, phone, password, role });
      navigate(user.role === 'PROVIDER' ? '/pro/profile' : '/browse');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <p className="section-tag">New account form</p>
      <h1 className="mt-2 text-4xl font-bold text-ink-900">Sign here</h1>
      <form onSubmit={submit} className="slip p-6 mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'CUSTOMER', label: 'I need help', icon: '🏡' },
            { key: 'PROVIDER', label: "I'm a pro", icon: '🧰' },
          ].map(r => (
            <button type="button" key={r.key} onClick={() => setRole(r.key)}
              className={`rounded-[4px] border-2 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider transition ${
                role === r.key
                  ? 'border-ink-900 bg-carbon-canary text-ink-900 shadow-press-sm'
                  : 'border-paper-300 text-ink-500 hover:border-ink-900'
              }`}>
              <span className="text-xl block mb-1">{r.icon}</span>
              {r.label}
            </button>
          ))}
        </div>
        <div>
          <label className="label">Full name</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label">Phone (optional)</label>
          <input className="input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" minLength={8} value={password}
            onChange={e => setPassword(e.target.value)} required />
        </div>
        {error && <p className="font-mono text-sm text-stamp-red">{error}</p>}
        <button className="btn-primary w-full !py-3" disabled={busy}>
          {busy ? 'Filing…' : role === 'PROVIDER' ? 'Sign up as a pro' : 'Sign up'}
        </button>
        <p className="font-mono text-xs text-ink-500 text-center pt-1">
          already filed? <Link to="/login" className="font-bold text-ink-900 underline decoration-dotted underline-offset-4">log in</Link>
        </p>
      </form>
    </div>
  );
}
