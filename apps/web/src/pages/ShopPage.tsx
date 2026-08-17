import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types';

const BRANDS = ['Yonex', 'Victor', 'Li-Ning'];
const BALANCES = ['Head Heavy', 'Even', 'Head Light'];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const brand = searchParams.get('brand') || '';
  const balance = searchParams.get('balance') || '';
  const sort = searchParams.get('sort') || 'createdAt';

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { limit: '24' };
    if (brand) params.brand = brand;
    if (balance) params.balance = balance;
    if (sort) params.sort = sort;

    api.products.list(params)
      .then((res) => setProducts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [brand, balance, sort]);

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="font-heading text-4xl mb-2">Shop Rackets</h1>
      <p className="text-neutral-500 mb-10">Filter by brand, balance, and more</p>

      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="lg:w-56 shrink-0 space-y-8">
          <div>
            <p className="font-mono-label text-neutral-500 mb-3">Brand</p>
            <div className="space-y-2">
              <button onClick={() => setFilter('brand', '')} className={`block text-sm ${!brand ? 'font-medium' : 'text-neutral-500'}`}>All</button>
              {BRANDS.map((b) => (
                <button key={b} onClick={() => setFilter('brand', b)} className={`block text-sm ${brand === b ? 'font-medium' : 'text-neutral-500 hover:text-neutral-950'}`}>{b}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono-label text-neutral-500 mb-3">Balance</p>
            <div className="space-y-2">
              <button onClick={() => setFilter('balance', '')} className={`block text-sm ${!balance ? 'font-medium' : 'text-neutral-500'}`}>All</button>
              {BALANCES.map((b) => (
                <button key={b} onClick={() => setFilter('balance', b)} className={`block text-sm ${balance === b ? 'font-medium' : 'text-neutral-500 hover:text-neutral-950'}`}>{b}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono-label text-neutral-500 mb-3">Sort</p>
            <select
              value={sort}
              onChange={(e) => setFilter('sort', e.target.value)}
              className="w-full border border-neutral-300 px-3 py-2 text-sm bg-white"
            >
              <option value="createdAt">Newest</option>
              <option value="price">Price</option>
              <option value="name">Name</option>
            </select>
          </div>
        </aside>

        <div className="flex-1">
          {loading ? (
            <p className="text-neutral-500">Loading...</p>
          ) : products.length === 0 ? (
            <p className="text-neutral-500">No rackets match your filters.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
