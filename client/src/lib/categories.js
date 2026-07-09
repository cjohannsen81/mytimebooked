export const CATEGORIES = [
  { key: 'HOUSEKEEPING', label: 'Housekeeping', blurb: 'Regular cleans, deep cleans, move-outs' },
  { key: 'BABYSITTING', label: 'Babysitting', blurb: 'Date nights, after school, weekends' },
  { key: 'DOG_WALKING', label: 'Dog walking', blurb: 'Daily walks and adventure outings' },
  { key: 'PET_SITTING', label: 'Pet sitting', blurb: 'Drop-ins and overnight stays' },
  { key: 'LAWN_GARDEN', label: 'Lawn & garden', blurb: 'Mowing, hedges, seasonal cleanups' },
  { key: 'HANDYMAN', label: 'Handyman', blurb: 'Mounting, assembly, small repairs' },
  { key: 'SENIOR_CARE', label: 'Senior care', blurb: 'Companionship and daily support' },
  { key: 'TUTORING', label: 'Tutoring', blurb: 'Homework help and test prep' },
];

export const categoryByKey = key => CATEGORIES.find(c => c.key === key);
export const categoryLabel = key => categoryByKey(key)?.label || key;
