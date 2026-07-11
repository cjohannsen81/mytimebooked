import { Router } from 'express';
import { prisma } from '../index.js';
import { requireAuth, requireRole, asyncHandler } from '../middleware/auth.js';
import { lookupZip, distanceMiles } from '../lib/geo.js';

const router = Router();

const CATEGORIES = [
  'HOUSEKEEPING', 'BABYSITTING', 'DOG_WALKING', 'PET_SITTING',
  'LAWN_GARDEN', 'HANDYMAN', 'SENIOR_CARE', 'TUTORING',
];

function withRating(profile) {
  const ratings = profile.reviews.map(r => r.rating);
  const avgRating = ratings.length
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
    : null;
  const { reviews, ...rest } = profile;
  return { ...rest, avgRating, reviewCount: ratings.length };
}

// List / search providers.
// ?zip=78704 — compute each pro's distance to that point, mark whether their
// service radius covers it, keep only covering pros, and sort by distance.
// ?zip=78704&all=1 — annotate but don't filter.
router.get('/', asyncHandler(async (req, res) => {
  const { category, q, zip, all } = req.query;
  const where = {
    services: { some: category && CATEGORIES.includes(category) ? { category } : {} },
  };
  if (q) {
    where.OR = [
      { user: { name: { contains: q, mode: 'insensitive' } } },
      { headline: { contains: q, mode: 'insensitive' } },
      { city: { contains: q, mode: 'insensitive' } },
      { services: { some: { title: { contains: q, mode: 'insensitive' } } } },
    ];
  }
  const profiles = await prisma.providerProfile.findMany({
    where,
    include: {
      user: { select: { name: true } },
      services: true,
      reviews: { select: { rating: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
  let providers = profiles.map(withRating);

  const here = zip ? lookupZip(zip) : null;
  if (here) {
    providers = providers.map(p => {
      if (p.servesEverywhere) return { ...p, distanceMiles: null, servesYou: true };
      if (p.lat == null || p.lng == null) return { ...p, distanceMiles: null, servesYou: null };
      const d = distanceMiles(here.lat, here.lng, p.lat, p.lng);
      return { ...p, distanceMiles: Math.round(d * 10) / 10, servesYou: d <= p.serviceRadiusMiles };
    });
    if (!all) providers = providers.filter(p => p.servesYou !== false);
    // Nearby pros first; everywhere/unknown pros after, so locals always lead.
    providers.sort((a, b) =>
      (a.distanceMiles ?? (a.servesEverywhere ? 9000 : 1e9)) -
      (b.distanceMiles ?? (b.servesEverywhere ? 9000 : 1e9)));
  }
  res.json({ providers, location: here });
}));

// Own provider profile (must come before /:id)
router.get('/me', requireAuth, requireRole('PROVIDER'), asyncHandler(async (req, res) => {
  const profile = await prisma.providerProfile.findUnique({
    where: { userId: req.user.id },
    include: { services: true },
  });
  res.json({ profile });
}));

// Create or update own provider profile
router.put('/me', requireAuth, requireRole('PROVIDER'), asyncHandler(async (req, res) => {
  const { headline, bio, city, zip, yearsExperience, photoUrl, serviceRadiusMiles } = req.body || {};
  if (!headline || !bio || !city || !zip) {
    return res.status(400).json({ error: 'headline, bio, city and zip are required' });
  }
  const geo = lookupZip(zip);
  if (!geo) return res.status(400).json({ error: `We don't recognize ZIP ${zip} — double-check it?` });
  const radius = Math.min(100, Math.max(2, parseInt(serviceRadiusMiles, 10) || 15));
  const data = {
    headline,
    bio,
    city,
    zip: geo.zip,
    lat: geo.lat,
    lng: geo.lng,
    serviceRadiusMiles: radius,
    photoUrl: photoUrl || null,
    yearsExperience: Math.max(0, parseInt(yearsExperience, 10) || 0),
  };
  const profile = await prisma.providerProfile.upsert({
    where: { userId: req.user.id },
    update: data,
    create: { ...data, userId: req.user.id },
    include: { services: true },
  });
  res.json({ profile });
}));

// Manage services
router.post('/me/services', requireAuth, requireRole('PROVIDER'), asyncHandler(async (req, res) => {
  const profile = await prisma.providerProfile.findUnique({ where: { userId: req.user.id } });
  if (!profile) return res.status(400).json({ error: 'Create your provider profile first' });
  const { category, title, description, hourlyRateCents, minHours } = req.body || {};
  if (!CATEGORIES.includes(category)) return res.status(400).json({ error: 'Invalid category' });
  if (!title || !description) return res.status(400).json({ error: 'title and description are required' });
  const rate = parseInt(hourlyRateCents, 10);
  if (!rate || rate < 100) return res.status(400).json({ error: 'Hourly rate must be at least $1' });
  const service = await prisma.service.create({
    data: {
      providerId: profile.id,
      category,
      title,
      description,
      hourlyRateCents: rate,
      minHours: Math.max(1, parseInt(minHours, 10) || 1),
    },
  });
  res.status(201).json({ service });
}));

router.put('/me/services/:id', requireAuth, requireRole('PROVIDER'), asyncHandler(async (req, res) => {
  const service = await prisma.service.findUnique({
    where: { id: req.params.id },
    include: { provider: true },
  });
  if (!service || service.provider.userId !== req.user.id) {
    return res.status(404).json({ error: 'Service not found' });
  }
  const { category, title, description, hourlyRateCents, minHours } = req.body || {};
  const data = {};
  if (category) {
    if (!CATEGORIES.includes(category)) return res.status(400).json({ error: 'Invalid category' });
    data.category = category;
  }
  if (title) data.title = title;
  if (description) data.description = description;
  if (hourlyRateCents !== undefined) {
    const rate = parseInt(hourlyRateCents, 10);
    if (!rate || rate < 100) return res.status(400).json({ error: 'Hourly rate must be at least $1' });
    data.hourlyRateCents = rate;
  }
  if (minHours !== undefined) data.minHours = Math.max(1, parseInt(minHours, 10) || 1);
  const updated = await prisma.service.update({ where: { id: service.id }, data });
  res.json({ service: updated });
}));

router.delete('/me/services/:id', requireAuth, requireRole('PROVIDER'), asyncHandler(async (req, res) => {
  const service = await prisma.service.findUnique({
    where: { id: req.params.id },
    include: { provider: true, bookings: { where: { status: { in: ['PENDING', 'CONFIRMED'] } } } },
  });
  if (!service || service.provider.userId !== req.user.id) {
    return res.status(404).json({ error: 'Service not found' });
  }
  if (service.bookings.length > 0) {
    return res.status(409).json({ error: 'Service has open bookings — resolve them first' });
  }
  await prisma.service.delete({ where: { id: service.id } });
  res.json({ ok: true });
}));

// Public provider detail
router.get('/:id', asyncHandler(async (req, res) => {
  const profile = await prisma.providerProfile.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { name: true, createdAt: true } },
      services: true,
      reviews: {
        include: { customer: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      },
      slots: {
        where: { end: { gte: new Date() } },
        orderBy: { start: 'asc' },
      },
    },
  });
  if (!profile) return res.status(404).json({ error: 'Provider not found' });

  const ratings = profile.reviews.map(r => r.rating);
  const avgRating = ratings.length
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
    : null;

  // Hide slot time ranges already taken by non-cancelled bookings.
  const bookings = await prisma.booking.findMany({
    where: {
      providerId: profile.id,
      status: { in: ['PENDING', 'CONFIRMED'] },
      end: { gte: new Date() },
    },
    select: { start: true, end: true },
  });

  // Distance & coverage relative to the caller's ZIP, if given.
  let distance = {};
  const here = req.query.zip ? lookupZip(req.query.zip) : null;
  if (profile.servesEverywhere) {
    distance = { servesYou: true };
  } else if (here && profile.lat != null && profile.lng != null) {
    const d = distanceMiles(here.lat, here.lng, profile.lat, profile.lng);
    distance = { distanceMiles: Math.round(d * 10) / 10, servesYou: d <= profile.serviceRadiusMiles };
  }

  res.json({ provider: { ...profile, avgRating, reviewCount: ratings.length, ...distance }, busy: bookings });
}));

export const geoRouter = Router();
// Validate a ZIP and return its label — used by location pickers.
geoRouter.get('/:zip', (req, res) => {
  const hit = lookupZip(req.params.zip);
  if (!hit) return res.status(404).json({ error: 'Unknown ZIP code' });
  res.json(hit);
});

export default router;
