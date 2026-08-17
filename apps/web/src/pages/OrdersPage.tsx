import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { Order } from '../types';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');

  useEffect(() => {
    api.orders.list().then(setOrders).catch(console.error);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-heading text-4xl mb-10">Order History</h1>

      {orders.length === 0 ? (
        <p className="text-neutral-500">No orders yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`border p-6 ${highlightId === order.id ? 'border-accent' : 'border-neutral-200'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-mono-label text-neutral-500">Order</p>
                  <p className="font-mono text-sm">{order.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <span className="font-mono-label bg-neutral-100 px-3 py-1">{STATUS_LABELS[order.status]}</span>
              </div>
              <p className="font-mono mb-2">${order.total.toFixed(2)}</p>
              <p className="text-sm text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</p>
              {order.deliveryAddress && (
                <p className="text-sm text-neutral-500 mt-2">
                  Deliver to: {order.deliveryAddress.line1}, {order.deliveryAddress.city}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
