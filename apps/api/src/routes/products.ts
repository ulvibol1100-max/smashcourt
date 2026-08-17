import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { serializeProduct } from '../lib/serialize.js';

const router = Router();

const productSchema = z.object({
  name: z.string().min(1),
  brand: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  weight: z.number().int().optional(),
  balance: z.string().optional(),
  stringTension: z.string().optional(),
  gripSize: z.string().optional(),
  stock: z.number().int().min(0).default(0),
  images: z.array(z.object({ url: z.string(), sortOrder: z.number().default(0) })).optional(),
});

router.get('/', async (req, res, next) => {
  try {
    const {
      brand,
      weight,
      balance,
      stringTension,
      minPrice,
      maxPrice,
      sort = 'createdAt',
      order = 'desc',
      page = '1',
      limit = '12',
    } = req.query;

    const where: Prisma.ProductWhereInput = {};
    if (brand) where.brand = String(brand);
    if (weight) where.weight = Number(weight);
    if (balance) where.balance = String(balance);
    if (stringTension) where.stringTension = { contains: String(stringTension), mode: 'insensitive' };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const sortField = ['price', 'name', 'brand', 'createdAt'].includes(String(sort))
      ? String(sort)
      : 'createdAt';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { images: { orderBy: { sortOrder: 'asc' } } },
        orderBy: { [sortField]: sortOrder },
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      data: products.map(serializeProduct),
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: String(req.params.id) },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!product) throw new AppError('Product not found', 404);
    res.json(serializeProduct(product));
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const data = productSchema.parse(req.body);
    const { images, ...productData } = data;

    const product = await prisma.product.create({
      data: {
        ...productData,
        price: productData.price,
        images: images?.length ? { create: images } : undefined,
      },
      include: { images: true },
    });

    await prisma.inventoryLog.create({
      data: { productId: product.id, change: product.stock, reason: 'Initial stock' },
    });

    res.status(201).json(serializeProduct(product));
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const data = productSchema.partial().parse(req.body);
    const existing = await prisma.product.findUnique({ where: { id: String(req.params.id) } });
    if (!existing) throw new AppError('Product not found', 404);

    const { images, stock, ...rest } = data;
    const product = await prisma.product.update({
      where: { id: String(req.params.id) },
      data: rest,
      include: { images: true },
    });

    if (stock !== undefined && stock !== existing.stock) {
      await prisma.inventoryLog.create({
        data: {
          productId: product.id,
          change: stock - existing.stock,
          reason: 'Manual stock adjustment',
        },
      });
      await prisma.product.update({ where: { id: product.id }, data: { stock } });
    }

    if (images) {
      await prisma.productImage.deleteMany({ where: { productId: product.id } });
      await prisma.productImage.createMany({
        data: images.map((img) => ({ ...img, productId: product.id })),
      });
    }

    const updated = await prisma.product.findUnique({
      where: { id: product.id },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });

    res.json(serializeProduct(updated!));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    await prisma.product.delete({ where: { id: String(req.params.id) } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
