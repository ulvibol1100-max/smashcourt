import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import type { Product } from '../../types';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api.products.list({ limit: '50' }).then((res) => setProducts(res.data)).catch(console.error);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <Link to="/admin" className="text-sm text-neutral-500 hover:text-neutral-950 mb-4 inline-block">Back to Dashboard</Link>
      <h1 className="font-heading text-4xl mb-10">Products</h1>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left font-mono-label text-neutral-500">
            <th className="pb-3">Name</th>
            <th className="pb-3">Brand</th>
            <th className="pb-3">Price</th>
            <th className="pb-3">Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-neutral-100">
              <td className="py-4">{p.name}</td>
              <td className="py-4 text-neutral-500">{p.brand}</td>
              <td className="py-4 font-mono">${p.price.toFixed(2)}</td>
              <td className={`py-4 font-mono ${p.stock <= 5 ? 'text-accent' : ''}`}>{p.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
