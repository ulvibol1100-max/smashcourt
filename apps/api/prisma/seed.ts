import { PrismaClient, Role, DiscountType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@smashcourt.com' },
    update: {},
    create: {
      name: 'Admin User',
      username: 'admin',
      email: 'admin@smashcourt.com',
      phone: '+855123456789',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const customerPassword = await bcrypt.hash('customer123', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@smashcourt.com' },
    update: {},
    create: {
      name: 'Demo Customer',
      username: 'demo',
      email: 'customer@smashcourt.com',
      phone: '+855987654321',
      passwordHash: customerPassword,
      role: Role.CUSTOMER,
      addresses: {
        create: {
          label: 'Home',
          line1: '123 Olympic Blvd',
          city: 'Phnom Penh',
          lat: 11.5564,
          lng: 104.9282,
          isDefault: true,
        },
      },
      cart: { create: {} },
    },
  });

  const products = [
    {
      name: 'Astrox 99 Pro',
      brand: 'Yonex',
      description: 'Head-heavy power racket built for aggressive smashes.',
      price: 249.99,
      weight: 83,
      balance: 'Head Heavy',
      stringTension: '20-28 lbs',
      gripSize: 'G4',
      stock: 25,
      images: [{ url: '/uploads/placeholder-racket.jpg', sortOrder: 0 }],
    },
    {
      name: 'Victor Thruster K 9900',
      brand: 'Victor',
      description: 'Even balance all-round racket with explosive speed.',
      price: 219.99,
      weight: 85,
      balance: 'Even',
      stringTension: '22-30 lbs',
      gripSize: 'G5',
      stock: 18,
      images: [{ url: '/uploads/placeholder-racket.jpg', sortOrder: 0 }],
    },
    {
      name: 'Li-Ning Turbo Charging 75',
      brand: 'Li-Ning',
      description: 'Lightweight head-light racket for fast drives and net play.',
      price: 189.99,
      weight: 79,
      balance: 'Head Light',
      stringTension: '20-28 lbs',
      gripSize: 'S2',
      stock: 30,
      images: [{ url: '/uploads/placeholder-racket.jpg', sortOrder: 0 }],
    },
    {
      name: 'Nanoflare 800',
      brand: 'Yonex',
      description: 'Ultra-fast head-light racket for counter-attacking players.',
      price: 229.99,
      weight: 81,
      balance: 'Head Light',
      stringTension: '20-28 lbs',
      gripSize: 'G5',
      stock: 12,
      images: [{ url: '/uploads/placeholder-racket.jpg', sortOrder: 0 }],
    },
  ];

  for (const product of products) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name, brand: product.brand },
    });
    if (!existing) {
      await prisma.product.create({
        data: {
          ...product,
          images: { create: product.images },
        },
      });
    }
  }

  await prisma.discount.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      type: DiscountType.PERCENTAGE,
      value: 10,
      active: true,
    },
  });

  console.log('Seed complete');
  console.log('Admin:', admin.email, '/ admin123');
  console.log('Customer:', customer.email, '/ customer123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
