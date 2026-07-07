import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index.js';
import { signToken, requireAuth, asyncHandler } from '../middleware/auth.js';

const router = Router();

function publicUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, name, phone, role } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'email, password and name are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  const normalizedRole = role === 'PROVIDER' ? 'PROVIDER' : 'CUSTOMER';
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return res.status(409).json({ error: 'An account with that email already exists' });

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 10),
      name,
      phone: phone || null,
      role: normalizedRole,
    },
    include: { providerProfile: true },
  });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { providerProfile: true },
  });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  res.json({ token: signToken(user), user: publicUser(user) });
}));

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;
