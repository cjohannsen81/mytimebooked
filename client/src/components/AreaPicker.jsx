import { useEffect, useRef, useState } from 'react';
import { useArea } from '../lib/area.jsx';

const PinIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M12 21s-6.5-5.4-6.5-10.2A6.5 6.5 0 0112 4.5a6.5 6.5 0 016.5 6.3C18.5 15.6 12 21 12 21z" />
    <circle cx="12" cy="10.8" r="2.3" />
  </svg>
);

// The global "where are you?" pill — lives in the navbar.
export default function AreaPicker() {
  const { area, setAreaZip } = useArea();
  const [open, setOpen] = useState(false);
  const [zip, setZip] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const close = e => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      await setAreaZip(zip);
      setOpen(false); setZip('');
    } catch {
      setError('Hmm, we don\'t know that ZIP.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative" ref={boxRef}>
      <button onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition
          ${area ? 'text-sage-700 bg-sage-50 hover:bg-sage-100' : 'text-ink-500 bg-paper-100 hover:bg-paper-200'}`}>
        <PinIcon />
        <span className="max-w-[140px] truncate">{area ? area.label : 'Set location'}</span>
      </button>
      {open && (
        <form onSubmit={save}
          className="absolute right-0 top-11 z-50 w-64 card !rounded-2xl p-4 shadow-press animate-fade-in">
          <label className="label">Your ZIP code</label>
          <div className="flex gap-2">
            <input className="input !py-2" placeholder="e.g. 78704" value={zip} autoFocus
              inputMode="numeric" maxLength={5} onChange={e => setZip(e.target.value.replace(/\D/g, ''))} />
            <button className="btn-primary !py-2 !px-4 shrink-0" disabled={busy || zip.length !== 5}>
              {busy ? '…' : 'Set'}
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          <p className="mt-2 text-xs text-ink-400">We only show pros whose service area covers you.</p>
        </form>
      )}
    </div>
  );
}
