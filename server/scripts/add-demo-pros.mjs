// Add "serves everywhere" demo pros so every location shows a good experience.
// Idempotent — skips anyone whose email already exists.
// Run on the VM: cd ~/mytimebooked/server && node scripts/add-demo-pros.mjs
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PROS = [
  {
    email: 'ava.martinez@mytimebooked.com', name: 'Ava Martinez',
    photo: 'https://randomuser.me/api/portraits/women/47.jpg',
    headline: 'Spotless homes, wherever you are',
    bio: 'Ten years of housekeeping across three cities. I work clean, quiet, and thorough — and I always leave a note about what I did.',
    yearsExperience: 10, backgroundChecked: true,
    services: [
      { category: 'HOUSEKEEPING', title: 'Standard home cleaning', description: 'Kitchens, bathrooms, floors, dusting, tidy-up.', hourlyRateCents: 4000, minHours: 2 },
      { category: 'HOUSEKEEPING', title: 'Deep clean', description: 'Baseboards, appliances inside and out, the works.', hourlyRateCents: 5500, minHours: 3 },
    ],
  },
  {
    email: 'marcus.chen@mytimebooked.com', name: 'Marcus Chen',
    photo: 'https://randomuser.me/api/portraits/men/36.jpg',
    headline: 'Fix-it lists and tidy lawns, handled',
    bio: 'Carpenter by trade, generalist by nature. Mounting, assembly, repairs, and I keep a mean lawn edge too.',
    yearsExperience: 14, backgroundChecked: true,
    services: [
      { category: 'HANDYMAN', title: 'Repairs & assembly', description: 'Mounting, furniture, patches, swaps — bring your list.', hourlyRateCents: 6500, minHours: 1 },
      { category: 'LAWN_GARDEN', title: 'Mow & tidy', description: 'Mow, edge, blow, and a quick bed weed.', hourlyRateCents: 4500, minHours: 1 },
    ],
  },
  {
    email: 'sofia.rossi@mytimebooked.com', name: 'Sofia Rossi',
    photo: 'https://randomuser.me/api/portraits/women/17.jpg',
    headline: 'Babysitting and homework help in one visit',
    bio: 'Elementary-ed graduate. I keep evenings calm and screens off — and if there\'s homework, it gets done before the fun.',
    yearsExperience: 7, backgroundChecked: true,
    services: [
      { category: 'BABYSITTING', title: 'Evening & weekend sitting', description: 'Ages 1–12. Dinner, play, bedtime routine.', hourlyRateCents: 2200, minHours: 2 },
      { category: 'TUTORING', title: 'Homework & reading help', description: 'K–8, patient and structured.', hourlyRateCents: 4000, minHours: 1 },
    ],
  },
  {
    email: 'leo.bennett@mytimebooked.com', name: 'Leo Bennett',
    photo: 'https://randomuser.me/api/portraits/men/85.jpg',
    headline: 'Walks, drop-ins, and very good dogs',
    bio: 'Photo updates every visit, guaranteed. Comfortable with big dogs, shy cats, and complicated feeding instructions.',
    yearsExperience: 5, backgroundChecked: true,
    services: [
      { category: 'DOG_WALKING', title: 'Neighborhood walk', description: '45–60 minutes, water break included.', hourlyRateCents: 2500, minHours: 1 },
      { category: 'PET_SITTING', title: 'Drop-in visits', description: 'Feeding, litter, meds, playtime.', hourlyRateCents: 2200, minHours: 1 },
    ],
  },
  {
    email: 'nina.adeyemi@mytimebooked.com', name: 'Nina Adeyemi',
    photo: 'https://randomuser.me/api/portraits/women/79.jpg',
    headline: 'Warm, reliable senior companionship',
    bio: 'Certified caregiver. Conversation, meals, errands, appointments — and I never rush a good story.',
    yearsExperience: 9, backgroundChecked: true,
    services: [
      { category: 'SENIOR_CARE', title: 'Companion visits', description: 'Company, meals, errands, and a safe check-in.', hourlyRateCents: 3000, minHours: 2 },
    ],
  },
];

const REVIEWS = [
  { rating: 5, comment: 'Wonderful — punctual, kind, and left everything better than they found it.' },
  { rating: 5, comment: 'Booked again before they even left. That kind of good.' },
  { rating: 4, comment: 'Reliable and friendly. Communication was great throughout.' },
];

const customers = await prisma.user.findMany({
  where: { email: { in: ['demo@mytimebooked.com', 'sam.reviews@mytimebooked.com'] } },
});
const passwordHash = await bcrypt.hash('password123', 10);
const now = new Date();
let ri = 0;

for (const p of PROS) {
  const existing = await prisma.user.findUnique({ where: { email: p.email } });
  if (existing) { console.log(`skip ${p.name} (exists)`); continue; }

  const user = await prisma.user.create({
    data: { email: p.email, passwordHash, name: p.name, role: 'PROVIDER' },
  });
  const profile = await prisma.providerProfile.create({
    data: {
      userId: user.id,
      headline: p.headline,
      bio: p.bio,
      city: 'Everywhere',
      zip: '00000',
      servesEverywhere: true,
      photoUrl: p.photo,
      yearsExperience: p.yearsExperience,
      backgroundChecked: p.backgroundChecked,
      services: { create: p.services },
    },
    include: { services: true },
  });

  // Availability: 9–17 on most of the next 14 days.
  for (let d = 1; d <= 14; d++) {
    if ((d + PROS.indexOf(p)) % 6 === 0) continue;
    await prisma.availabilitySlot.create({
      data: {
        providerId: profile.id,
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, 9, 0, 0),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, 17, 0, 0),
      },
    });
  }

  // Two completed bookings + reviews for social proof.
  const svc = profile.services[0];
  for (let i = 0; i < 2 && customers.length; i++) {
    const reviewer = customers[i % customers.length];
    const start = new Date(now.getTime() - (8 + i * 9) * 24 * 36e5);
    start.setHours(10, 0, 0, 0);
    const hours = Math.max(svc.minHours, 2);
    const booking = await prisma.booking.create({
      data: {
        customerId: reviewer.id,
        providerId: profile.id,
        serviceId: svc.id,
        start,
        end: new Date(start.getTime() + hours * 36e5),
        hours,
        totalCents: svc.hourlyRateCents * hours,
        address: '123 Demo Lane',
        status: 'COMPLETED',
      },
    });
    const r = REVIEWS[ri++ % REVIEWS.length];
    await prisma.review.create({
      data: { bookingId: booking.id, customerId: reviewer.id, providerId: profile.id, rating: r.rating, comment: r.comment },
    });
  }
  console.log(`✓ ${p.name} (everywhere)`);
}
await prisma.$disconnect();
console.log('done');
