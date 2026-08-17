import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { decimalToNumber, serializeProduct } from '../lib/serialize.js';

const router = Router();

async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } } },
      },
    },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: { product: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } } },
        },
      },
    });
  }
  return cart;
}

function serializeCart(cart: Awaited<ReturnType<typeof getOrCreateCart>>) {
  const subtotal = cart.items.reduce(
    (sum, item) => sum + decimalToNumber(item.product.price) * item.quantity,
    0,
  );
  return {
    id: cart.id,
    items: cart.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      product: serializeProduct(item.product),
      lineTotal: decimalToNumber(item.product.price) * item.quantity,
    })),
    subtotal,
    itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user!.userId);
    res.json(serializeCart(cart));
  } catch (err) {
    next(err);
  }
});

router.post('/items', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { productId, quantity } = z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().min(1).default(1),
    }).parse(req.body);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new AppError('Product not found', 404);
    if (product.stock < quantity) throw new AppError('Insufficient stock', 400);

    const cart = await getOrCreateCart(req.user!.userId);
    const existing = cart.items.find((i) => i.productId === productId);

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    const updated = await getOrCreateCart(req.user!.userId);
    res.status(201).json(serializeCart(updated));
  } catch (err) {
    next(err);
  }
});

router.patch('/items/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { quantity } = z.object({ quantity: z.number().int().min(1) }).parse(req.body);
    const item = await prisma.cartItem.findUnique({
      where: { id: String(req.params.id) },
      include: { cart: true, product: true },
    });
    if (!item || item.cart.userId !== req.user!.userId) {
      throw new AppError('Cart item not found', 404);
    }
    if (item.product.stock < quantity) throw new AppError('Insufficient stock', 400);

    await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
    const cart = await getOrCreateCart(req.user!.userId);
    res.json(serializeCart(cart));
  } catch (err) {
    next(err);
  }
});

router.delete('/items/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const item = await prisma.cartItem.findUnique({
      where: { id: String(req.params.id) },
      include: { cart: true },
    });
    if (!item || item.cart.userId !== req.user!.userId) {
      throw new AppError('Cart item not found', 404);
    }

    await prisma.cartItem.delete({ where: { id: item.id } });
    const cart = await getOrCreateCart(req.user!.userId);
    res.json(serializeCart(cart));
  } catch (err) {
    next(err);
  }
});

export default router;
