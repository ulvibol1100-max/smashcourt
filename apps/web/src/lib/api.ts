const API_URL = import.meta.env.VITE_API_URL || '/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('accessToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new ApiError(res.status, body.error || 'Request failed');
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  auth: {
    register: (data: { name: string; username: string; email: string; phone?: string; password: string }) =>
      request<{ accessToken: string; user: import('../types').User }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      request<{ accessToken: string; user: import('../types').User }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    refresh: () => request<{ accessToken: string }>('/auth/refresh', { method: 'POST' }),
  },
  products: {
    list: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : '';
      return request<import('../types').PaginatedProducts>(`/products${qs}`);
    },
    get: (id: string) => request<import('../types').Product>(`/products/${id}`),
  },
  cart: {
    get: () => request<import('../types').Cart>('/cart'),
    addItem: (productId: string, quantity = 1) =>
      request<import('../types').Cart>('/cart/items', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
    updateItem: (id: string, quantity: number) =>
      request<import('../types').Cart>(`/cart/items/${id}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }),
    removeItem: (id: string) =>
      request<import('../types').Cart>(`/cart/items/${id}`, { method: 'DELETE' }),
  },
  orders: {
    create: (data: { deliveryAddressId: string; discountCode?: string }) =>
      request<import('../types').Order>('/orders', { method: 'POST', body: JSON.stringify(data) }),
    list: () => request<import('../types').Order[]>('/orders'),
    get: (id: string) => request<import('../types').Order>(`/orders/${id}`),
  },
  users: {
    me: () => request<import('../types').User & { overview: { totalOrders: number; totalSpend: number; byStatus: Record<string, number> }; addresses: import('../types').Address[] }>('/users/me'),
    update: (data: Partial<{ name: string; username: string; email: string; phone: string }>) =>
      request('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
    addAddress: (data: { label?: string; line1: string; city: string; lat?: number; lng?: number; isDefault?: boolean }) =>
      request<import('../types').Address>('/users/me/addresses', { method: 'POST', body: JSON.stringify(data) }),
    getAddresses: () => request<import('../types').Address[]>('/users/me/addresses'),
  },
  admin: {
    dashboard: () => request<Record<string, unknown>>('/admin/dashboard/summary'),
    customers: () => request<unknown[]>('/admin/customers'),
    inventory: () => request<{ products: import('../types').Product[]; recentLogs: unknown[] }>('/admin/inventory'),
    updateOrderStatus: (id: string, status: string) =>
      request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    notifications: () => request<unknown[]>('/notifications'),
  },
};

export { ApiError };
