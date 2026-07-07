import { Router } from 'express';
import { prisma } from '../index.js';
import { requireAuth, requireRole, asyncHandler } from '../middleware/auth.js';

const router = Router();

const bookingInclude = {
  service: true,
  provider: { include: { user: { select: { name: true, phone: true, email: true } } } },
  customer: { select: { name: true, phone: true, email: true } },
  review: true,
};

// Customer books a job
router.post('/', requireAuth, requireRole('CUSTOMER'), asyncHandler(async (req, res) => {
  const { serviceId, start: startRaw, hours: hoursRaw, address, notes } = req.body || {};
  const service = await prisma.service.findUnique({
    where: { id: serviceId || '' },
    include: { provider: true },
  });
  if (!service) return res.status(404).json({ error: 'Service not found' });
  if (!address) return res.status(400).json({ error: 'Address is required' });

  const start = new Date(startRaw);
  const hours = parseFloat(hoursRaw);
  if (isNaN(start)) return res.status(400).json({ error: 'Invalid start time' });
  if (!hours || hours <= 0 || hours > 24) return res.status(400).json({ error: 'Invalid hours' });
  if (hours < service.minHours) {
    return res.status(400).json({ error: `This service has a ${service.minHours}h minimum` });
  }
  if (start < new Date()) return res.status(400).json({ error: 'Start time must be in the future' });
  const end = new Date(start.getTime() + hours * 36e5);

  // Must fall entirely inside one of the provider's availability windows…
  const window = await prisma.availabilitySlot.findFirst({
    where: { providerId: service.providerId, start: { lte: start }, end: { gte: end } },
  });
  if (!window) return res.status(409).json({ error: 'Provider is not available for that time' });

  // …and not collide with another open booking.
  const clash = await prisma.booking.findFirst({
    where: {
      providerId: service.providerId,
      status: { in: ['PENDING', 'CONFIRMED'] },
      start: { lt: end },
      end: { gt: start },
    },
  });
  if (clash) return res.status(409).json({ error: 'That time was just booked — pick another' });

  const booking = await prisma.booking.create({
    data: {
      customerId: req.user.id,
      providerId: service.providerId,
      serviceId: service.id,
      start,
      end,
      hours,
      totalCents: Math.round(service.hourlyRateCents * hours),
      address,
      notes: notes || null,
    },
    include: bookingInclude,
  });
  res.status(201).json({ booking });
}));

// My bookings — role-aware
router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  let where;
  if (req.user.role === 'PROVIDER') {
    const profile = await prisma.providerProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.json({ bookings: [] });
    where = { providerId: profile.id };
  } else {
    where = { customerId: req.user.id };
  }
  const bookings = await prisma.booking.findMany({
    where,
    include: bookingInclude,
    orderBy: { start: 'desc' },
  });
  res.json({ bookings });
}));

// Status transitions.
//   provider: PENDING → CONFIRMED | DECLINED, CONFIRMED → COMPLETED | CANCELLED
//   customer: PENDING | CONFIRMED → CANCELLED
router.patch('/:id/status', requireAuth, asyncHandler(async (req, res) => {
  const { status } = req.body || {};
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id },
    include: { provider: true },
  });
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const isProvider = booking.provider.userId === req.user.id;
  const isCustomer = booking.customerId === req.user.id;
  if (!isProvider && !isCustomer) return res.status(404).json({ error: 'Booking not found' });

  const allowed = isProvider
    ? { PENDING: ['CONFIRMED', 'DECLINED'], CONFIRMED: ['COMPLETED', 'CANCELLED'] }
    : { PENDING: ['CANCELLED'], CONFIRMED: ['CANCELLED'] };

  if (!(allowed[booking.status] || []).includes(status)) {
    return res.status(400).json({ error: `Cannot move ${booking.status} → ${status}` });
  }

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { status },
    include: bookingInclude,
  });
  res.json({ booking: updated });
}));

export default router;
