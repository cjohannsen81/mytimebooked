import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { lookupZip } from '../src/lib/geo.js';

const prisma = new PrismaClient();

const PASSWORD = 'password123';

const PROVIDERS = [
  {
    email: 'maria.santos@mytimebooked.com', radius: 12, photo: 'https://randomuser.me/api/portraits/women/65.jpg', name: 'Maria Santos',
    headline: 'Meticulous housekeeping with a personal touch',
    bio: 'I have run my own cleaning business for 8 years and treat every home like my own. Deep cleans, move-outs, and recurring visits. I bring my own eco-friendly supplies.',
    city: 'Austin', zip: '78704', yearsExperience: 8, backgroundChecked: true,
    services: [
      { category: 'HOUSEKEEPING', title: 'Standard home cleaning', description: 'Kitchens, bathrooms, floors, dusting, and tidy-up. Supplies included.', hourlyRateCents: 4500, minHours: 2 },
      { category: 'HOUSEKEEPING', title: 'Deep clean / move-out', description: 'Baseboards, inside appliances, cabinets, windows within reach.', hourlyRateCents: 6000, minHours: 3 },
    ],
  },
  {
    email: 'jasmine.lee@mytimebooked.com', radius: 10, photo: 'https://randomuser.me/api/portraits/women/44.jpg', name: 'Jasmine Lee',
    headline: 'CPR-certified babysitter, great with toddlers',
    bio: 'Early-childhood education student and babysitter of 5 years. CPR and first-aid certified. I plan age-appropriate activities so screens stay off and kids stay happy.',
    city: 'Austin', zip: '78745', yearsExperience: 5, backgroundChecked: true,
    services: [
      { category: 'BABYSITTING', title: 'Evening & weekend babysitting', description: 'Ages 1–12. Dinner, homework help, bedtime routine.', hourlyRateCents: 2500, minHours: 2 },
    ],
  },
  {
    email: 'diego.ramirez@mytimebooked.com', radius: 8, photo: 'https://randomuser.me/api/portraits/men/32.jpg', name: 'Diego Ramirez',
    headline: 'Daily dog walks & adventure hikes',
    bio: 'Your dog\'s new best friend. I walk small packs (max 3) and send photo updates every visit. Comfortable with reactive dogs and puppies.',
    city: 'Austin', zip: '78702', yearsExperience: 4, backgroundChecked: true,
    services: [
      { category: 'DOG_WALKING', title: 'Neighborhood walk (up to 2 dogs)', description: '45–60 minute walk with water break and photo updates.', hourlyRateCents: 3000, minHours: 1 },
      { category: 'PET_SITTING', title: 'Drop-in pet sitting', description: 'Feeding, litter, meds, playtime while you travel.', hourlyRateCents: 2800, minHours: 1 },
    ],
  },
  {
    email: 'hannah.brooks@mytimebooked.com', radius: 20, photo: 'https://randomuser.me/api/portraits/women/22.jpg', name: 'Hannah Brooks',
    headline: 'Overnight pet sitting in your home',
    bio: 'Vet tech by day, pet sitter by night. Cats, dogs, birds, reptiles — I handle meds, injections, and anxious pets with calm confidence.',
    city: 'Round Rock', zip: '78664', yearsExperience: 6, backgroundChecked: false,
    services: [
      { category: 'PET_SITTING', title: 'Overnight house & pet sitting', description: 'Your pets keep their routine; your home stays lived-in.', hourlyRateCents: 2000, minHours: 8 },
    ],
  },
  {
    email: 'tom.nguyen@mytimebooked.com', radius: 18, photo: 'https://randomuser.me/api/portraits/men/75.jpg', name: 'Tom Nguyen',
    headline: 'Lawn care, hedges, and seasonal cleanups',
    bio: 'Second-generation landscaper. Mowing, edging, hedge trimming, mulch, and leaf cleanups. I bring all equipment and haul away green waste.',
    city: 'Austin', zip: '78748', yearsExperience: 10, backgroundChecked: true,
    services: [
      { category: 'LAWN_GARDEN', title: 'Mow, edge & blow', description: 'Full-service lawn visit for lots up to 1/4 acre.', hourlyRateCents: 5000, minHours: 1 },
      { category: 'LAWN_GARDEN', title: 'Garden bed & hedge work', description: 'Weeding, pruning, mulching, seasonal planting.', hourlyRateCents: 5500, minHours: 2 },
    ],
  },
  {
    email: 'ray.thompson@mytimebooked.com', radius: 25, photo: 'https://randomuser.me/api/portraits/men/52.jpg', name: 'Ray Thompson',
    headline: 'Handyman for the jobs on your list',
    bio: '25 years in residential maintenance. TV mounts, ceiling fans, drywall patches, faucet swaps, furniture assembly — if it\'s on your list, I can probably knock it out.',
    city: 'Pflugerville', zip: '78660', yearsExperience: 25, backgroundChecked: true,
    services: [
      { category: 'HANDYMAN', title: 'General repairs & assembly', description: 'Mounting, assembly, patches, swaps. Tools and hardware included for small jobs.', hourlyRateCents: 7500, minHours: 1 },
    ],
  },
  {
    email: 'grace.okafor@mytimebooked.com', radius: 15, photo: 'https://randomuser.me/api/portraits/women/90.jpg', name: 'Grace Okafor',
    headline: 'Compassionate senior companion care',
    bio: 'Certified nursing assistant with a decade of in-home senior care. Companionship, meal prep, light housekeeping, appointments, and medication reminders.',
    city: 'Austin', zip: '78723', yearsExperience: 11, backgroundChecked: true,
    services: [
      { category: 'SENIOR_CARE', title: 'Companion care visits', description: 'Conversation, meals, errands, and a safe check-in for your loved one.', hourlyRateCents: 3500, minHours: 2 },
    ],
  },
  {
    email: 'ethan.walker@mytimebooked.com', radius: 12, photo: 'https://randomuser.me/api/portraits/men/22.jpg', name: 'Ethan Walker',
    headline: 'Math & science tutoring, grades 5–12',
    bio: 'UT Austin engineering grad. I tutor algebra through AP Calculus and physics, focusing on building confidence before test days. Online or at your kitchen table.',
    city: 'Austin', zip: '78751', yearsExperience: 6, backgroundChecked: false,
    services: [
      { category: 'TUTORING', title: 'Math tutoring (pre-algebra → AP Calc)', description: 'Homework help, test prep, and concept deep-dives.', hourlyRateCents: 5500, minHours: 1 },
      { category: 'TUTORING', title: 'Physics & chemistry tutoring', description: 'High-school and intro college level.', hourlyRateCents: 6000, minHours: 1 },
    ],
  },
];

const REVIEW_POOL = [
  { rating: 5, comment: 'Absolutely fantastic — on time, professional, and the results were better than expected. Already rebooked.' },
  { rating: 5, comment: 'Communicative, friendly, and thorough. Made my week so much easier.' },
  { rating: 4, comment: 'Great job overall. Arrived a few minutes late but more than made up for it with the quality of work.' },
  { rating: 5, comment: 'Trustworthy and reliable. I felt completely comfortable and everything was perfect when I got home.' },
  { rating: 4, comment: 'Solid, dependable service at a fair price. Will book again.' },
];

async function main() {
  const userCount = await prisma.user.count();
  if (userCount > 0 && !process.env.FORCE_RESEED) {
    console.log(`Database already has ${userCount} users — skipping seed. Set FORCE_RESEED=1 to override.`);
    return;
  }

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const customer = await prisma.user.create({
    data: {
      email: 'demo@mytimebooked.com',
      passwordHash,
      name: 'Dana Demo',
      phone: '512-555-0100',
      role: 'CUSTOMER',
    },
  });
  const customer2 = await prisma.user.create({
    data: {
      email: 'sam.reviews@mytimebooked.com',
      passwordHash,
      name: 'Sam Rivera',
      phone: '512-555-0101',
      role: 'CUSTOMER',
    },
  });

  const now = new Date();
  let reviewIdx = 0;

  for (const p of PROVIDERS) {
    const user = await prisma.user.create({
      data: { email: p.email, passwordHash, name: p.name, role: 'PROVIDER' },
    });
    const profile = await prisma.providerProfile.create({
      data: {
        userId: user.id,
        headline: p.headline,
        bio: p.bio,
        city: p.city,
        zip: p.zip,
        yearsExperience: p.yearsExperience,
        photoUrl: p.photo || null,
        lat: lookupZip(p.zip)?.lat ?? null,
        lng: lookupZip(p.zip)?.lng ?? null,
        serviceRadiusMiles: p.radius || 15,
        backgroundChecked: p.backgroundChecked,
        services: { create: p.services },
      },
      include: { services: true },
    });

    // Availability: 9:00–17:00 windows on ~4 days/week for the next 2 weeks.
    for (let d = 1; d <= 14; d++) {
      if ((d + PROVIDERS.indexOf(p)) % 7 === 0 || (d + PROVIDERS.indexOf(p)) % 7 === 3) continue;
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, 9, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, 17, 0, 0);
      await prisma.availabilitySlot.create({
        data: { providerId: profile.id, start: day, end },
      });
    }

    // A couple of completed past bookings with reviews for social proof.
    const service = profile.services[0];
    for (let i = 0; i < 2; i++) {
      const startPast = new Date(now.getTime() - (10 + i * 6) * 24 * 36e5);
      startPast.setHours(10, 0, 0, 0);
      const hours = Math.max(service.minHours, 2);
      const reviewer = i === 0 ? customer2 : customer;
      const booking = await prisma.booking.create({
        data: {
          customerId: reviewer.id,
          providerId: profile.id,
          serviceId: service.id,
          start: startPast,
          end: new Date(startPast.getTime() + hours * 36e5),
          hours,
          totalCents: service.hourlyRateCents * hours,
          address: '123 Demo Lane, Austin, TX',
          status: 'COMPLETED',
        },
      });
      const r = REVIEW_POOL[reviewIdx++ % REVIEW_POOL.length];
      await prisma.review.create({
        data: {
          bookingId: booking.id,
          customerId: reviewer.id,
          providerId: profile.id,
          rating: r.rating,
          comment: r.comment,
        },
      });
    }
    console.log(`✓ Seeded provider ${p.name}`);
  }

  console.log('\nSeed complete.');
  console.log(`  Customer: demo@mytimebooked.com / ${PASSWORD}`);
  console.log(`  Provider: maria.santos@mytimebooked.com / ${PASSWORD}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
