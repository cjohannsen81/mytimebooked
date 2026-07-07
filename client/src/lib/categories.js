export const CATEGORIES = [
  { key: 'HOUSEKEEPING', label: 'Housekeeping', icon: '🧹', blurb: 'Regular cleans, deep cleans, move-outs' },
  { key: 'BABYSITTING', label: 'Babysitting', icon: '🧸', blurb: 'Date nights, after school, weekends' },
  { key: 'DOG_WALKING', label: 'Dog walking', icon: '🐕', blurb: 'Daily walks and adventure outings' },
  { key: 'PET_SITTING', label: 'Pet sitting', icon: '🐾', blurb: 'Drop-ins and overnight stays' },
  { key: 'LAWN_GARDEN', label: 'Lawn & garden', icon: '🌿', blurb: 'Mowing, hedges, seasonal cleanups' },
  { key: 'HANDYMAN', label: 'Handyman', icon: '🔧', blurb: 'Mounting, assembly, small repairs' },
  { key: 'SENIOR_CARE', label: 'Senior care', icon: '💛', blurb: 'Companionship and daily support' },
  { key: 'TUTORING', label: 'Tutoring', icon: '📚', blurb: 'Homework help and test prep' },
];

export const categoryByKey = key => CATEGORIES.find(c => c.key === key);
export const categoryLabel = key => categoryByKey(key)?.label || key;
export const categoryIcon = key => categoryByKey(key)?.icon || '🛠️';
