import { Router } from 'express';
import { z } from 'zod';
import { DiscountType, Role } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { decimalToNumber } from '../lib/serialize.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/dashboard/summary', async (_req, res, next) => {
  try {
    const [orderStats, products, recentOrders, lowStock] = await Promise.all([
      prisma.order.aggregate({
        _count: true,
        _sum: { total: true, subtotal: true, discountTotal: true },
        where: { status: { not: 'CANCELLED' } },
      }),
      prisma.product.aggregate({ _sum: { stock: true }, _count: true }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.product.findMany({
        where: { stock: { lte: 5 } },
        orderBy: { stock: 'asc' },
        take: 10,
      }),
    ]);

    const statusBreakdown = await prisma.order.groupBy({
      by: ['status'],
      _count: true,
    });

    res.json({
      totalOrders: orderStats._count,
      totalRevenue: decimalToNumber(orderStats._sum.total || 0),
      totalSubtotal: decimalToNumber(orderStats._sum.subtotal || 0),
      totalDiscounts: decimalToNumber(orderStats._sum.discountTotal || 0),
      totalProducts: products._count,
      totalStock: products._sum.stock || 0,
      ordersByStatus: Object.fromEntries(statusBreakdown.map((s) => [s.status, s._count])),
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        status: o.status,
        total: decimalToNumber(o.total),
        createdAt: o.createdAt,
        customer: o.user,
      })),
      lowStock,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/customers', async (_req, res, next) => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: Role.CUSTOMER },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(customers);
  } catch (err) {
    next(err);
  }
});

router.get('/customers/:id/orders', async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.params.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(
      orders.map((o) => ({
        ...o,
        subtotal: decimalToNumber(o.subtotal),
        discountTotal: decimalToNumber(o.discountTotal),
        total: decimalToNumber(o.total),
      })),
    );
  } catch (err) {
    next(err);
  }
});

router.get('/inventory', async (_req, res, next) => {
  try {
    const [products, logs] = await Promise.all([
      prisma.product.findMany({
        select: { id: true, name: true, brand: true, stock: true, price: true },
        orderBy: { stock: 'asc' },
      }),
      prisma.inventoryLog.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: { product: { select: { name: true } } },
      }),
    ]);
    res.json({
      products: products.map((p) => ({ ...p, price: decimalToNumber(p.price) })),
      recentLogs: logs,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/inventory/:productId', async (req, res, next) => {
  try {
    const { change, reason } = z.object({
      change: z.number().int(),
      reason: z.string().min(1),
    }).parse(req.body);

    const product = await prisma.product.update({
      where: { id: req.params.productId },
      data: { stock: { increment: change } },
    });

    await prisma.inventoryLog.create({
      data: { productId: product.id, change, reason },
    });

    if (product.stock <= 5) {
      await prisma.notification.create({
        data: {
          recipientRole: Role.ADMIN,
          type: 'LOW_STOCK',
          payload: { productId: product.id, name: product.name, stock: product.stock },
        },
      });
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
});

router.post('/discounts', async (req, res, next) => {
  try {
    const data = z.object({
      code: z.string().min(3),
      type: z.enum(['PERCENTAGE', 'FLAT']),
      value: z.number().positive(),
      startsAt: z.string().datetime().optional(),
      endsAt: z.string().datetime().optional(),
      active: z.boolean().default(true),
    }).parse(req.body);

    const discount = await prisma.discount.create({
      data: {
        code: data.code.toUpperCase(),
        type: data.type as DiscountType,
        value: data.value,
        startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
        endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
        active: data.active,
      },
    });
    res.status(201).json({ ...discount, value: decimalToNumber(discount.value) });
  } catch (err) {
    next(err);
  }
});

router.get('/discounts', async (_req, res, next) => {
  try {
    const discounts = await prisma.discount.findMany({ orderBy: { code: 'asc' } });
    res.json(discounts.map((d) => ({ ...d, value: decimalToNumber(d.value) })));
  } catch (err) {
    next(err);
  }
});

export default router;
