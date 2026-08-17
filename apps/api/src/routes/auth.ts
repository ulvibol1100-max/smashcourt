import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(1),
  username: z.string().min(3),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function issueTokens(user: { id: string; role: 'CUSTOMER' | 'ADMIN' }) {
  const payload = { userId: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: { userId: user.id, token: refreshToken, expiresAt },
  });

  return { accessToken, refreshToken };
}

function refreshCookieOptions() {
  const production = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: production,
    sameSite: production ? 'none' as const : 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { username: data.username }] },
    });
    if (existing) throw new AppError('Email or username already in use', 409);

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        email: data.email,
        phone: data.phone,
        passwordHash,
        cart: { create: {} },
      },
    });

    const tokens = await issueTokens(user);
    res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions());

    res.status(201).json({
      accessToken: tokens.accessToken,
      user: { id: user.id, name: user.name, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new AppError('Invalid credentials', 401);

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) throw new AppError('Invalid credentials', 401);

    const tokens = await issueTokens(user);
    res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions());

    res.json({
      accessToken: tokens.accessToken,
      user: { id: user.id, name: user.name, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (!token) throw new AppError('Refresh token required', 401);

    const payload = verifyRefreshToken(token);
    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError('Invalid refresh token', 401);
    }

    await prisma.refreshToken.delete({ where: { token } });
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw new AppError('User not found', 401);

    const tokens = await issueTokens(user);
    res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions());

    res.json({ accessToken: tokens.accessToken });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
});

export default router;
