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
    <div className="max-w-md mx-auto px-4 py-16 animate-rise">
      <h1 className="text-3xl font-bold text-ink-900">Create your account</h1>
      <p className="mt-1 text-ink-500">Book help — or get booked.</p>
      <form onSubmit={submit} className="card p-6 mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'CUSTOMER', label: 'I need help', icon: '🏡' },
            { key: 'PROVIDER', label: "I'm a pro", icon: '🧰' },
          ].map(r => (
            <button type="button" key={r.key} onClick={() => setRole(r.key)}
              className={`rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition ${
                role === r.key
                  ? 'border-sage-500 bg-sage-50 text-sage-700'
                  : 'border-paper-200 text-ink-500 hover:border-paper-300'
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
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn-primary w-full !py-3" disabled={busy}>
          {busy ? 'Creating…' : role === 'PROVIDER' ? 'Sign up as a pro' : 'Sign up'}
        </button>
        <p className="text-sm text-ink-500 text-center">
          Already have an account? <Link to="/login" className="font-semibold text-sage-700 hover:underline">Log in</Link>
        </p>
      </form>
    </div>
  );
}
