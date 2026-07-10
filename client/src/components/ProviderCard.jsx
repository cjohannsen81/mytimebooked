import { Link } from 'react-router-dom';
import Stars from './Stars.jsx';
import Avatar from './Avatar.jsx';
import CategoryIcon from './CategoryIcon.jsx';
import { categoryLabel } from '../lib/categories.js';
import { money } from '../lib/format.js';

export default function ProviderCard({ provider }) {
  const minRate = Math.min(...provider.services.map(s => s.hourlyRateCents));
  const cats = [...new Set(provider.services.map(s => s.category))];
  return (
    <Link to={`/providers/${provider.id}`}
      className="card p-5 flex flex-col gap-3 hover:shadow-press hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex items-start gap-3">
        <Avatar name={provider.user.name} src={provider.photoUrl} className="w-14 h-14" />
        <div className="min-w-0">
          <p className="font-semibold text-ink-900 truncate group-hover:text-sage-700 transition">
            {provider.user.name}
          </p>
          <p className="text-sm text-ink-500 line-clamp-2 leading-snug">“{provider.headline}”</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-ink-500">
        <Stars rating={provider.avgRating} count={provider.reviewCount} />
        <span>·</span>
        <span>{provider.city}</span>
        {provider.distanceMiles != null && (
          <span className="badge !bg-sage-50 !text-sage-700">{provider.distanceMiles} mi away</span>
        )}
        {provider.backgroundChecked && (
          <span className="badge !bg-sage-100 !text-sage-700">✓ Background checked</span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {cats.map(cat => (
          <span key={cat} className="badge">
            <CategoryIcon k={cat} className="w-3.5 h-3.5" /> {categoryLabel(cat)}
          </span>
        ))}
        {cats.length > 1 && (
          <span className="badge !bg-transparent !text-ink-400">{provider.services.length} services</span>
        )}
      </div>
      <p className="mt-auto pt-2 border-t border-paper-100 text-sm text-ink-500">
        from <span className="font-bold text-lg text-ink-900">{money(minRate)}</span>/hr
      </p>
    </Link>
  );
}
