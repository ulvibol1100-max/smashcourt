import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Cart } from '../types';
import { api } from '../lib/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, accessToken: string) => void;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken) => {
        localStorage.setItem('accessToken', accessToken);
        set({ user, accessToken });
      },
      logout: async () => {
        try { await api.auth.logout(); } catch { /* ignore */ }
        localStorage.removeItem('accessToken');
        set({ user: null, accessToken: null });
      },
      isAdmin: () => get().user?.role === 'ADMIN',
    }),
    { name: 'smashcourt-auth', partialize: (s) => ({ user: s.user, accessToken: s.accessToken }) },
  ),
);

interface CartState {
  cart: Cart | null;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  loading: false,
  fetchCart: async () => {
    set({ loading: true });
    try {
      const cart = await api.cart.get();
      set({ cart });
    } catch {
      set({ cart: null });
    } finally {
      set({ loading: false });
    }
  },
  addToCart: async (productId, quantity = 1) => {
    const cart = await api.cart.addItem(productId, quantity);
    set({ cart });
  },
  updateQuantity: async (itemId, quantity) => {
    const cart = await api.cart.updateItem(itemId, quantity);
    set({ cart });
  },
  removeItem: async (itemId) => {
    const cart = await api.cart.removeItem(itemId);
    set({ cart });
  },
}));
