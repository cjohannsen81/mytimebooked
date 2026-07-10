import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// GeoNames US postal codes (CC-BY 4.0, geonames.org): zip -> [lat, lng, city, state]
const ZIPS = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'us-zips.json'), 'utf8')
);

export function lookupZip(zip) {
  const z = String(zip || '').trim().slice(0, 5);
  const hit = ZIPS[z];
  if (!hit) return null;
  return { zip: z, lat: hit[0], lng: hit[1], city: hit[2], state: hit[3] };
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
