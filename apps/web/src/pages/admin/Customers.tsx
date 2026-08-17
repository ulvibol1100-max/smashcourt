import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';

interface Customer {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  createdAt: string;
  _count: { orders: number };
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    api.admin.customers().then((c) => setCustomers(c as Customer[])).catch(console.error);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <Link to="/admin" className="text-sm text-neutral-500 hover:text-neutral-950 mb-4 inline-block">Back to Dashboard</Link>
      <h1 className="font-heading text-4xl mb-10">Customers</h1>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left font-mono-label text-neutral-500">
            <th className="pb-3">Name</th>
            <th className="pb-3">Email</th>
            <th className="pb-3">Phone</th>
            <th className="pb-3">Orders</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className="border-b border-neutral-100">
              <td className="py-4">{c.name}</td>
              <td className="py-4 text-neutral-500">{c.email}</td>
              <td className="py-4 text-neutral-500">{c.phone || '—'}</td>
              <td className="py-4 font-mono">{c._count.orders}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
