// Hand-drawn line icons for the service categories — one visual voice,
// stroke inherits currentColor so they tint with their context.
const PATHS = {
  HOUSEKEEPING: (
    <>
      <path d="M12 3.5l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6 1.6-4z" />
      <path d="M18.4 14.2l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z" />
    </>
  ),
  BABYSITTING: (
    <>
      <circle cx="7.2" cy="7" r="2.1" />
      <circle cx="16.8" cy="7" r="2.1" />
      <circle cx="12" cy="13" r="6.6" />
      <path d="M9.6 14.4c.7.9 1.5 1.3 2.4 1.3s1.7-.4 2.4-1.3" />
    </>
  ),
  DOG_WALKING: (
    <>
      <circle cx="7" cy="10.2" r="1.5" />
      <circle cx="10.4" cy="7.8" r="1.6" />
      <circle cx="13.9" cy="7.8" r="1.6" />
      <circle cx="17.3" cy="10.2" r="1.5" />
      <path d="M12.1 12.6c-2.5 0-4.6 1.9-4.6 4 0 1.4 1.1 2.6 2.6 2.6h4c1.4 0 2.6-1.2 2.6-2.6 0-2.1-2.1-4-4.6-4z" />
    </>
  ),
  PET_SITTING: (
    <>
      <path d="M4.5 10.8L12 4.5l7.5 6.3v7.7a1 1 0 01-1 1h-13a1 1 0 01-1-1v-7.7z" />
      <path d="M12 16.6s-2.9-1.9-2.9-3.7c0-1 .8-1.7 1.7-1.7.5 0 1 .3 1.2.7.2-.4.7-.7 1.2-.7.9 0 1.7.7 1.7 1.7 0 1.8-2.9 3.7-2.9 3.7z" />
    </>
  ),
  LAWN_GARDEN: (
    <>
      <path d="M5.5 18.5C5.5 10.5 11 5.5 19.5 5.5c0 8.5-5 13-11.5 13h-2.5z" />
      <path d="M5.5 18.5c1.8-4.5 4.5-7.5 8.5-9.5" />
    </>
  ),
  HANDYMAN: (
    <path d="M14.8 6.2a4.4 4.4 0 00-5.9 5.6L3.5 17.2V20.5h3.3l5.4-5.4a4.4 4.4 0 005.6-5.9L14.6 12.4l-3-3 3.2-3.2z" />
  ),
  SENIOR_CARE: (
    <>
      <path d="M12 20.2C7.4 16.2 3.8 13 3.8 9.6 3.8 7.4 5.5 5.8 7.7 5.8c1.5 0 2.9.7 3.7 1.9h1.2c.8-1.2 2.2-1.9 3.7-1.9 2.2 0 3.9 1.6 3.9 3.8 0 3.4-3.6 6.6-8.2 10.6z" />
      <path d="M7.8 11.4h2.4l1-1.7 1.7 3 1.1-1.3h2.2" />
    </>
  ),
  TUTORING: (
    <>
      <path d="M12 6.6C10.4 5.1 8.4 4.6 4 4.6v13.2c4.4 0 6.4.5 8 2 1.6-1.5 3.6-2 8-2V4.6c-4.4 0-6.4.5-8 2z" />
      <path d="M12 6.6v13.2" />
    </>
  ),
};

export default function CategoryIcon({ k, className = 'w-4 h-4' }) {
  const paths = PATHS[k];
  if (!paths) return null;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {paths}
    </svg>
  );
}
