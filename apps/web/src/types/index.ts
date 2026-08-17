export type Role = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  phone?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  description?: string;
  price: number;
  weight?: number;
  balance?: string;
  stringTension?: string;
  gripSize?: string;
  stock: number;
  images?: { id: string; url: string; sortOrder: number }[];
}

export interface CartItem {
  id: string;
  quantity: number;
  product: Product;
  lineTotal: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'OUT_FOR_DELIVERY' | 'COMPLETED' | 'CANCELLED';

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  discountTotal: number;
  total: number;
  deliveryAddressId: string;
  discountCode?: string;
  createdAt: string;
  items?: CartItem[];
  deliveryAddress?: Address;
}

export interface Address {
  id: string;
  label?: string;
  line1: string;
  city: string;
  lat?: number;
  lng?: number;
  isDefault: boolean;
}

export interface PaginatedProducts {
  data: Product[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
