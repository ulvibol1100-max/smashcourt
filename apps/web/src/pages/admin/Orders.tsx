import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import type { Order, OrderStatus } from '../../types';

const STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    api.orders.list().then(setOrders).catch(console.error);
  }, []);

  async function updateStatus(id: string, status: OrderStatus) {
    await api.admin.updateOrderStatus(id, status);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <Link to="/admin" className="text-sm text-neutral-500 hover:text-neutral-950 mb-4 inline-block">Back to Dashboard</Link>
      <h1 className="font-heading text-4xl mb-10">Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border border-neutral-200 p-6">
            <div className="flex flex-wrap justify-between gap-4 mb-4">
              <div>
                <p className="font-mono text-sm">{order.id.slice(0, 8).toUpperCase()}</p>
                <p className="font-mono">${order.total.toFixed(2)}</p>
              </div>
              <select
                value={order.status}
                onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                className="border px-3 py-2 text-sm font-mono"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            {order.deliveryAddress && (
              <p className="text-sm text-neutral-500">
                Deliver to: {order.deliveryAddress.line1}, {order.deliveryAddress.city}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
