import { Prisma } from '@prisma/client';

export function decimalToNumber(value: Prisma.Decimal | number): number {
  return typeof value === 'number' ? value : Number(value);
}

export function serializeProduct(product: {
  id: string;
  name: string;
  brand: string;
  description: string | null;
  price: Prisma.Decimal | number;
  weight: number | null;
  balance: string | null;
  stringTension: string | null;
  gripSize: string | null;
  stock: number;
  images?: { id: string; url: string; sortOrder: number }[];
}) {
  return {
    ...product,
    price: decimalToNumber(product.price),
  };
}

export function serializeOrder(order: {
  id: string;
  userId: string;
  status: string;
  subtotal: Prisma.Decimal;
  discountTotal: Prisma.Decimal;
  total: Prisma.Decimal;
  deliveryAddressId: string;
  discountCode: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: Array<{
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    unitPrice: Prisma.Decimal;
    discount: Prisma.Decimal;
    product?: {
      id: string;
      name: string;
      brand: string;
      description: string | null;
      price: Prisma.Decimal | number;
      weight: number | null;
      balance: string | null;
      stringTension: string | null;
      gripSize: string | null;
      stock: number;
      images?: { id: string; url: string; sortOrder: number }[];
    };
  }>;
  deliveryAddress?: unknown;
  user?: unknown;
}) {
  return {
    ...order,
    subtotal: decimalToNumber(order.subtotal),
    discountTotal: decimalToNumber(order.discountTotal),
    total: decimalToNumber(order.total),
    items: order.items?.map((item) => ({
      ...item,
      unitPrice: decimalToNumber(item.unitPrice),
      discount: decimalToNumber(item.discount),
      product: item.product ? serializeProduct(item.product) : undefined,
    })),
  };
}
