import { Router } from 'express';
import { prisma } from '../index.js';
import { requireAuth, requireRole, asyncHandler } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, requireRole('CUSTOMER'), asyncHandler(async (req, res) => {
  const { bookingId, rating: ratingRaw, comment } = req.body || {};
  const rating = parseInt(ratingRaw, 10);
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be 1–5' });
  }
  if (!comment) return res.status(400).json({ error: 'Comment is required' });

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId || '' },
    include: { review: true },
  });
  if (!booking || booking.customerId !== req.user.id) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  if (booking.status !== 'COMPLETED') {
    return res.status(400).json({ error: 'You can only review completed jobs' });
  }
  if (booking.review) return res.status(409).json({ error: 'Already reviewed' });

  const review = await prisma.review.create({
    data: {
      bookingId: booking.id,
      customerId: req.user.id,
      providerId: booking.providerId,
      rating,
      comment,
    },
  });
  res.status(201).json({ review });
}));

export default router;
