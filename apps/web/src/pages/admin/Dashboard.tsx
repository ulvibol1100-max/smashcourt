import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';

interface DashboardData {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalStock: number;
  ordersByStatus: Record<string, number>;
  lowStock: { id: string; name: string; stock: number }[];
  recentOrders: { id: string; status: string; total: number; customer: { name: string; email: string } }[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.admin.dashboard().then((d) => setData(d as unknown as DashboardData)).catch(console.error);
  }, []);

  if (!data) return <div className="max-w-7xl mx-auto px-6 py-24 text-neutral-500">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-heading text-4xl">Admin Dashboard</h1>
        <nav className="flex gap-6 text-sm uppercase tracking-wide">
          <Link to="/admin/orders" className="hover:text-accent">Orders</Link>
          <Link to="/admin/products" className="hover:text-accent">Products</Link>
          <Link to="/admin/customers" className="hover:text-accent">Customers</Link>
        </nav>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Orders', value: data.totalOrders },
          { label: 'Revenue', value: `$${data.totalRevenue.toFixed(2)}` },
          { label: 'Products', value: data.totalProducts },
          { label: 'Total Stock', value: data.totalStock },
        ].map((stat) => (
          <div key={stat.label} className="bg-neutral-950 text-white p-6">
            <p className="font-mono-label text-neutral-400 mb-2">{stat.label}</p>
            <p className="font-heading text-3xl">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <section>
          <h2 className="font-heading text-xl mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {data.recentOrders.map((order) => (
              <div key={order.id} className="border border-neutral-200 p-4 flex justify-between">
                <div>
                  <p className="font-mono text-sm">{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-neutral-500">{order.customer.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono">${order.total.toFixed(2)}</p>
                  <p className="font-mono-label text-neutral-500">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-heading text-xl mb-4">Low Stock Alerts</h2>
          {data.lowStock.length === 0 ? (
            <p className="text-neutral-500 text-sm">All products well stocked.</p>
          ) : (
            <div className="space-y-3">
              {data.lowStock.map((p) => (
                <div key={p.id} className="border border-neutral-200 p-4 flex justify-between">
                  <p>{p.name}</p>
                  <p className="font-mono text-accent">{p.stock} left</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
