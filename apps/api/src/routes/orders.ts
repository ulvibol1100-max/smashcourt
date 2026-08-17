import { Router } from 'express';
import { z } from 'zod';
import { Role, OrderStatus, DiscountType } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { decimalToNumber, serializeOrder } from '../lib/serialize.js';

const router = Router();

const checkoutSchema = z.object({
  deliveryAddressId: z.string().uuid(),
  discountCode: z.string().optional(),
});

const statusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED']),
});

async function applyDiscount(subtotal: number, code?: string) {
  if (!code) return { discountTotal: 0, discountCode: null };

  const discount = await prisma.discount.findUnique({ where: { code: code.toUpperCase() } });
  if (!discount || !discount.active) throw new AppError('Invalid discount code', 400);

  const now = new Date();
  if (discount.startsAt && discount.startsAt > now) throw new AppError('Discount not yet active', 400);
  if (discount.endsAt && discount.endsAt < now) throw new AppError('Discount expired', 400);

  const value = decimalToNumber(discount.value);
  const discountTotal =
    discount.type === DiscountType.PERCENTAGE
      ? subtotal * (value / 100)
      : Math.min(value, subtotal);

  return { discountTotal, discountCode: discount.code };
}

router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { deliveryAddressId, discountCode } = checkoutSchema.parse(req.body);
    const userId = req.user!.userId;

    const address = await prisma.address.findFirst({ where: { id: deliveryAddressId, userId } });
    if (!address) throw new AppError('Delivery address not found', 404);

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
    if (!cart || cart.items.length === 0) throw new AppError('Cart is empty', 400);

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for ${item.product.name}`, 400);
      }
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + decimalToNumber(item.product.price) * item.quantity,
      0,
    );
    const { discountTotal, discountCode: appliedCode } = await applyDiscount(subtotal, discountCode);
    const total = subtotal - discountTotal;

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          status: OrderStatus.PENDING,
          subtotal,
          discountTotal,
          total,
          deliveryAddressId,
          discountCode: appliedCode,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.product.price,
              discount: 0,
            })),
          },
        },
        include: {
          items: { include: { product: { include: { images: true } } } },
          deliveryAddress: true,
        },
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            change: -item.quantity,
            reason: `Order ${created.id}`,
          },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      await tx.notification.create({
        data: {
          recipientRole: Role.ADMIN,
          type: 'NEW_ORDER',
          payload: { orderId: created.id, total: decimalToNumber(created.total) },
        },
      });

      return created;
    });

    res.status(201).json(serializeOrder(order));
  } catch (err) {
    next(err);
  }
});

router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const isAdmin = req.user!.role === Role.ADMIN;
    const orders = await prisma.order.findMany({
      where: isAdmin ? undefined : { userId: req.user!.userId },
      include: {
        items: { include: { product: { include: { images: { take: 1 } } } } },
        deliveryAddress: true,
        user: isAdmin ? { select: { id: true, name: true, email: true } } : false,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders.map(serializeOrder));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const isAdmin = req.user!.role === Role.ADMIN;
    const order = await prisma.order.findFirst({
      where: {
        id: String(req.params.id),
        ...(isAdmin ? {} : { userId: req.user!.userId }),
      },
      include: {
        items: { include: { product: { include: { images: true } } } },
        deliveryAddress: true,
        user: isAdmin ? { select: { id: true, name: true, email: true, phone: true } } : false,
      },
    });
    if (!order) throw new AppError('Order not found', 404);
    res.json(serializeOrder(order));
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { status } = statusSchema.parse(req.body);
    const order = await prisma.order.update({
      where: { id: String(req.params.id) },
      data: { status: status as OrderStatus },
      include: {
        items: { include: { product: true } },
        deliveryAddress: true,
      },
    });
    res.json(serializeOrder(order));
  } catch (err) {
    next(err);
  }
});

export default router;
