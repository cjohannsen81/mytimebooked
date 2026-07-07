import { Router } from 'express';
import { prisma } from '../index.js';
import { requireAuth, requireRole, asyncHandler } from '../middleware/auth.js';

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

// List / search providers
router.get('/', asyncHandler(async (req, res) => {
  const { category, q } = req.query;
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
  res.json({ providers: profiles.map(withRating) });
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
  const { headline, bio, city, zip, yearsExperience, photoUrl } = req.body || {};
  if (!headline || !bio || !city || !zip) {
    return res.status(400).json({ error: 'headline, bio, city and zip are required' });
  }
  const data = {
    headline,
    bio,
    city,
    zip,
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

  res.json({ provider: { ...profile, avgRating, reviewCount: ratings.length }, busy: bookings });
}));

export default router;
