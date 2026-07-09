import { Link } from 'react-router-dom';
import Stars from './Stars.jsx';
import { categoryIcon, categoryLabel } from '../lib/categories.js';
import { money } from '../lib/format.js';

function initials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function ProviderCard({ provider }) {
  const minRate = Math.min(...provider.services.map(s => s.hourlyRateCents));
  return (
    <Link to={`/providers/${provider.id}`}
      className="card p-5 flex flex-col gap-3 hover:shadow-press hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-sage-100 text-sage-700 font-bold
                        flex items-center justify-center text-lg shrink-0">
          {initials(provider.user.name)}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-ink-900 truncate group-hover:text-sage-700 transition">
            {provider.user.name}
          </p>
          <p className="text-sm text-ink-500 truncate">{provider.headline}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-ink-500">
        <Stars rating={provider.avgRating} count={provider.reviewCount} />
        <span>·</span>
        <span>{provider.city}</span>
        {provider.backgroundChecked && (
          <span className="badge !bg-sage-100 !text-sage-700">✓ Background checked</span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {[...new Set(provider.services.map(s => s.category))].map(cat => (
          <span key={cat} className="badge">
            {categoryIcon(cat)} {categoryLabel(cat)}
          </span>
        ))}
      </div>
      <p className="mt-auto pt-2 border-t border-paper-100 text-sm text-ink-500">
        from <span className="font-bold text-lg text-ink-900">{money(minRate)}</span>/hr
      </p>
    </Link>
  );
}
