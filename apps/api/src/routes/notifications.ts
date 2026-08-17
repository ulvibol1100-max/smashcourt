import { Router } from 'express';
import { Role } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, requireAdmin, async (_req: AuthRequest, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { recipientRole: Role.ADMIN },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(notifications);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/read', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: String(req.params.id) },
      data: { read: true },
    });
    res.json(notification);
  } catch (err) {
    next(err);
  }
});

export default router;
