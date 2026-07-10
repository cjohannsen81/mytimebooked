// Backfill lat/lng (from each profile's ZIP) and demo service radii.
// Run on the VM: cd ~/mytimebooked/server && node scripts/geocode-providers.mjs
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { lookupZip } from '../src/lib/geo.js';

const RADII = {
  'maria.santos@mytimebooked.com': 12,
  'jasmine.lee@mytimebooked.com': 10,
  'diego.ramirez@mytimebooked.com': 8,
  'hannah.brooks@mytimebooked.com': 20,
  'tom.nguyen@mytimebooked.com': 18,
  'ray.thompson@mytimebooked.com': 25,
  'grace.okafor@mytimebooked.com': 15,
  'ethan.walker@mytimebooked.com': 12,
};

const prisma = new PrismaClient();
const profiles = await prisma.providerProfile.findMany({ include: { user: true } });
for (const p of profiles) {
  const geo = lookupZip(p.zip);
  if (!geo) { console.log(`? ${p.user.name}: unknown ZIP ${p.zip}`); continue; }
  await prisma.providerProfile.update({
    where: { id: p.id },
    data: {
      lat: geo.lat,
      lng: geo.lng,
      ...(RADII[p.user.email] ? { serviceRadiusMiles: RADII[p.user.email] } : {}),
    },
  });
  console.log(`✓ ${p.user.name} — ${geo.city}, ${geo.state} ${geo.zip} (r=${RADII[p.user.email] || p.serviceRadiusMiles}mi)`);
}
await prisma.$disconnect();
console.log('done');
