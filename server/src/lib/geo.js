import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// GeoNames postal codes (CC-BY 4.0, geonames.org):
//   US: 5-digit ZIPs · CA: 3-character FSAs — code -> [lat, lng, city, region]
const CODES = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'postal-codes.json'), 'utf8')
);

export function lookupZip(input) {
  const raw = String(input || '').trim().toUpperCase();
  if (!raw) return null;
  // US ZIP (allow ZIP+4)
  const us = raw.match(/^(\d{5})/);
  if (us && CODES[us[1]]) {
    const [lat, lng, city, state] = CODES[us[1]];
    return { zip: us[1], lat, lng, city, state };
  }
  // Canadian postal code — match on the FSA (first three characters, e.g. "V5S 0A9" -> "V5S")
  const ca = raw.replace(/\s+/g, '').match(/^([A-Z]\d[A-Z])/);
  if (ca && CODES[ca[1]]) {
    const [lat, lng, city, state] = CODES[ca[1]];
    // Keep the base city name; GeoNames FSAs often carry "(Neighbourhood)" suffixes.
    return { zip: ca[1], lat, lng, city: city.replace(/\s*\(.*\)$/, ''), state };
  }
  return null;
}

// Haversine, in miles.
export function distanceMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
