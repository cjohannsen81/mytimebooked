function initials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

// Profile photo with an initials fallback. sizes: className controls box.
export default function Avatar({ name, src, className = 'w-12 h-12', textSize = 'text-lg' }) {
  if (src) {
    return (
      <img src={src} alt={name}
        className={`${className} rounded-full object-cover shrink-0 border-2 border-white shadow-sm`}
        loading="lazy" />
    );
  }
  return (
    <div className={`${className} rounded-full bg-sage-100 text-sage-700 font-bold
                     flex items-center justify-center ${textSize} shrink-0`}>
      {initials(name)}
    </div>
  );
}
