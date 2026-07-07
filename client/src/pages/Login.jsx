import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'PROVIDER' ? '/pro' : '/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <p className="section-tag">Clock in</p>
      <h1 className="mt-2 text-4xl font-bold text-ink-900">Welcome back</h1>
      <form onSubmit={submit} className="slip p-6 mt-6 space-y-4">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {error && <p className="font-mono text-sm text-stamp-red">{error}</p>}
        <button className="btn-primary w-full !py-3" disabled={busy}>
          {busy ? 'Checking…' : 'Log in'}
        </button>
        <p className="font-mono text-xs text-ink-500 text-center pt-1">
          new here? <Link to="/register" className="font-bold text-ink-900 underline decoration-dotted underline-offset-4">open an account</Link>
        </p>
      </form>
    </div>
  );
}
