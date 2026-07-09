// Backfill demo provider profile photos (randomuser.me demo portraits).
// Run on the VM: cd ~/mytimebooked/server && node scripts/set-demo-photos.mjs
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const PHOTOS = {
  'maria.santos@mytimebooked.com':  'https://randomuser.me/api/portraits/women/65.jpg',
  'jasmine.lee@mytimebooked.com':   'https://randomuser.me/api/portraits/women/44.jpg',
  'diego.ramirez@mytimebooked.com': 'https://randomuser.me/api/portraits/men/32.jpg',
  'hannah.brooks@mytimebooked.com': 'https://randomuser.me/api/portraits/women/22.jpg',
  'tom.nguyen@mytimebooked.com':    'https://randomuser.me/api/portraits/men/75.jpg',
  'ray.thompson@mytimebooked.com':  'https://randomuser.me/api/portraits/men/52.jpg',
  'grace.okafor@mytimebooked.com':  'https://randomuser.me/api/portraits/women/90.jpg',
  'ethan.walker@mytimebooked.com':  'https://randomuser.me/api/portraits/men/22.jpg',
};

const prisma = new PrismaClient();
for (const [email, photoUrl] of Object.entries(PHOTOS)) {
  const user = await prisma.user.findUnique({ where: { email }, include: { providerProfile: true } });
  if (!user?.providerProfile) { console.log(`skip ${email} (no profile)`); continue; }
  await prisma.providerProfile.update({ where: { id: user.providerProfile.id }, data: { photoUrl } });
  console.log(`✓ ${user.name}`);
}
await prisma.$disconnect();
console.log('done');
