import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth.js';
import providerRoutes, { geoRouter } from './routes/providers.js';
import availabilityRoutes from './routes/availability.js';
import bookingRoutes from './routes/bookings.js';
import reviewRoutes from './routes/reviews.js';

export const prisma = new PrismaClient();

const app = express();

// CLIENT_URL may be a single origin or a comma-separated list.
const clientUrls = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',').map(s => s.trim()).filter(Boolean);
const allowedOrigins = [
  ...clientUrls,
  'https://mytimebooked.com',
  'https://www.mytimebooked.com',
];
app.use(cors({
  origin: (origin, cb) => {
    // Allow non-browser callers (curl, health checks) and same-origin
    // requests proxied through nginx (no Origin header).
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    // Same-origin via the VM's raw IP before DNS is set up.
    return cb(null, true);
  },
  credentials: true,
}));

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'mytimebooked-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/geo', geoRouter);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);

// Central error handler — routes call next(err) or throw in async wrappers.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`MyTimeBooked API listening on :${port}`);
});
