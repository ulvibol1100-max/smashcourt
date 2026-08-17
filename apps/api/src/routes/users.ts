import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { decimalToNumber } from '../lib/serialize.js';

const router = Router();

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

const addressSchema = z.object({
  label: z.string().optional(),
  line1: z.string().min(1),
  city: z.string().min(1),
  lat: z.number().optional(),
  lng: z.number().optional(),
  isDefault: z.boolean().optional(),
});

router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        addresses: { orderBy: { isDefault: 'desc' } },
        orders: {
          select: { id: true, status: true, total: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
    if (!user) throw new AppError('User not found', 404);

    const stats = await prisma.order.groupBy({
      by: ['status'],
      where: { userId: user.id },
      _count: true,
      _sum: { total: true },
    });

    const totalOrders = stats.reduce((sum, s) => sum + s._count, 0);
    const totalSpend = stats.reduce((sum, s) => sum + decimalToNumber(s._sum.total || 0), 0);

    res.json({
      ...user,
      orders: user.orders.map((o) => ({ ...o, total: decimalToNumber(o.total) })),
      overview: {
        totalOrders,
        totalSpend,
        byStatus: Object.fromEntries(stats.map((s) => [s.status, s._count])),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data,
      select: { id: true, name: true, username: true, email: true, phone: true, role: true },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.post('/me/addresses', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = addressSchema.parse(req.body);
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.userId },
        data: { isDefault: false },
      });
    }
    const address = await prisma.address.create({
      data: { ...data, userId: req.user!.userId },
    });
    res.status(201).json(address);
  } catch (err) {
    next(err);
  }
});

router.get('/me/addresses', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.userId },
      orderBy: { isDefault: 'desc' },
    });
    res.json(addresses);
  } catch (err) {
    next(err);
  }
});

export default router;
