import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types';

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    api.products.list({ limit: '4' }).then((res) => setFeatured(res.data)).catch(console.error);
  }, []);

  return (
    <>
      <section className="relative bg-neutral-950 text-white min-h-[80vh] flex items-center">
        <div className="max-w-7xl mx-auto px-6 py-24 w-full">
          <p className="font-mono-label text-neutral-400 mb-6">New Season</p>
          <h1 className="font-heading text-5xl md:text-7xl max-w-3xl leading-[1.05] mb-8">
            Dominate the court with precision-engineered rackets
          </h1>
          <p className="text-neutral-400 max-w-xl text-lg mb-10">
            Curated selection from Yonex, Victor, and Li-Ning. Cash on delivery across Phnom Penh.
          </p>
          <Link
            to="/shop"
            className="inline-block bg-white text-neutral-950 px-8 py-4 text-sm uppercase tracking-widest font-medium hover:bg-neutral-100 transition-colors"
          >
            Shop Rackets
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-end justify-between mb-12">
          <h2 className="font-heading text-3xl">Featured Rackets</h2>
          <Link to="/shop" className="text-sm uppercase tracking-wide hover:text-accent transition-colors">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="bg-neutral-100 py-24">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12 text-center">
          {[
            { title: 'Free Delivery', desc: 'We deliver to your pinned location across the city.' },
            { title: 'Cash on Delivery', desc: 'Pay when your racket arrives. No online payment needed.' },
            { title: 'Authentic Gear', desc: 'Genuine rackets from top international brands.' },
          ].map((item) => (
            <div key={item.title}>
              <h3 className="font-heading text-xl mb-3">{item.title}</h3>
              <p className="text-neutral-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
