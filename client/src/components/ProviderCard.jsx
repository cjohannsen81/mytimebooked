import { Link } from 'react-router-dom';
import Stars from './Stars.jsx';
import { categoryIcon, categoryLabel } from '../lib/categories.js';
import { money } from '../lib/format.js';

function initials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

// A pro's index card from the file drawer.
export default function ProviderCard({ provider }) {
  const minRate = Math.min(...provider.services.map(s => s.hourlyRateCents));
  return (
    <Link to={`/providers/${provider.id}`}
      className="slip p-0 flex flex-col hover:-translate-y-0.5 hover:shadow-press transition group overflow-hidden">
      <div className="flex items-center justify-between px-4 py-1.5 border-b-2 border-ink-900 bg-carbon-canary/50">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-700">
          Pro file No. {provider.id.slice(-4).toUpperCase()}
        </span>
        {provider.backgroundChecked && (
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-stamp-green">✓ vetted</span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2.5 flex-1">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-[4px] border-2 border-ink-900 bg-paper-100 font-display font-bold
                          flex items-center justify-center text-lg shrink-0">
            {initials(provider.user.name)}
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-lg leading-tight text-ink-900 group-hover:underline decoration-2 underline-offset-2">
              {provider.user.name}
            </p>
            <p className="text-sm text-ink-500 truncate">{provider.headline}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-ink-500">
          <Stars rating={provider.avgRating} count={provider.reviewCount} size="text-xs" />
          <span>·</span>
          <span>{provider.city}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[...new Set(provider.services.map(s => s.category))].map(cat => (
            <span key={cat} className="badge">
              {categoryIcon(cat)} {categoryLabel(cat)}
            </span>
          ))}
        </div>
        <div className="mt-auto pt-2 flex items-baseline justify-between border-t-2 border-dotted border-paper-300">
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-500">rate from</span>
          <span className="font-display font-bold text-xl text-ink-900">
            {money(minRate)}<span className="font-mono text-xs text-ink-500">/hr</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
