import { Router } from 'express';
import { prisma } from '../index.js';
import { requireAuth, requireRole, asyncHandler } from '../middleware/auth.js';

const router = Router();

// Public: a provider's future availability windows
router.get('/:providerId', asyncHandler(async (req, res) => {
  const slots = await prisma.availabilitySlot.findMany({
    where: { providerId: req.params.providerId, end: { gte: new Date() } },
    orderBy: { start: 'asc' },
  });
  res.json({ slots });
}));

// Provider: add an availability window
router.post('/', requireAuth, requireRole('PROVIDER'), asyncHandler(async (req, res) => {
  const profile = await prisma.providerProfile.findUnique({ where: { userId: req.user.id } });
  if (!profile) return res.status(400).json({ error: 'Create your provider profile first' });

  const start = new Date(req.body?.start);
  const end = new Date(req.body?.end);
  if (isNaN(start) || isNaN(end)) return res.status(400).json({ error: 'Invalid start or end time' });
  if (end <= start) return res.status(400).json({ error: 'End must be after start' });
  if (start < new Date()) return res.status(400).json({ error: 'Window must be in the future' });
  if ((end - start) / 36e5 > 24) return res.status(400).json({ error: 'Window cannot exceed 24 hours' });

  const overlap = await prisma.availabilitySlot.findFirst({
    where: { providerId: profile.id, start: { lt: end }, end: { gt: start } },
  });
  if (overlap) return res.status(409).json({ error: 'Overlaps an existing window' });

  const slot = await prisma.availabilitySlot.create({
    data: { providerId: profile.id, start, end },
  });
  res.status(201).json({ slot });
}));

// Provider: remove a window
router.delete('/:id', requireAuth, requireRole('PROVIDER'), asyncHandler(async (req, res) => {
  const slot = await prisma.availabilitySlot.findUnique({
    where: { id: req.params.id },
    include: { provider: true },
  });
  if (!slot || slot.provider.userId !== req.user.id) {
    return res.status(404).json({ error: 'Window not found' });
  }
  const booked = await prisma.booking.findFirst({
    where: {
      providerId: slot.providerId,
      status: { in: ['PENDING', 'CONFIRMED'] },
      start: { lt: slot.end },
      end: { gt: slot.start },
    },
  });
  if (booked) return res.status(409).json({ error: 'Window has open bookings — resolve them first' });
  await prisma.availabilitySlot.delete({ where: { id: slot.id } });
  res.json({ ok: true });
}));

export default router;
