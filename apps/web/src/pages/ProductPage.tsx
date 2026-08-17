import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore, useCartStore } from '../stores';
import type { Product } from '../types';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const addToCart = useCartStore((s) => s.addToCart);
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (id) api.products.get(id).then(setProduct).catch(console.error);
  }, [id]);

  if (!product) return <div className="max-w-7xl mx-auto px-6 py-24 text-neutral-500">Loading...</div>;

  const imageUrl = product.images?.[0]?.url || '';

  async function handleAddToCart() {
    if (!user) { navigate('/login'); return; }
    setAdding(true);
    try {
      await addToCart(product!.id, quantity);
      navigate('/cart');
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
        <div className="aspect-[3/4] bg-neutral-100 overflow-hidden">
          <img
            src={imageUrl.startsWith('http') ? imageUrl : `${import.meta.env.VITE_API_URL || ''}${imageUrl}`}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/800x1000/f5f5f5/0a0a0a?text=Racket'; }}
          />
        </div>

        <div className="flex flex-col justify-center">
          <p className="font-mono-label text-neutral-500 mb-2">{product.brand}</p>
          <h1 className="font-heading text-4xl mb-4">{product.name}</h1>
          <p className="font-mono text-2xl mb-8">${product.price.toFixed(2)}</p>

          {product.description && (
            <p className="text-neutral-600 mb-8 leading-relaxed">{product.description}</p>
          )}

          <dl className="grid grid-cols-2 gap-4 mb-10 font-mono text-sm">
            {product.weight && <><dt className="text-neutral-500">Weight</dt><dd>{product.weight}g</dd></>}
            {product.balance && <><dt className="text-neutral-500">Balance</dt><dd>{product.balance}</dd></>}
            {product.stringTension && <><dt className="text-neutral-500">String Tension</dt><dd>{product.stringTension}</dd></>}
            {product.gripSize && <><dt className="text-neutral-500">Grip Size</dt><dd>{product.gripSize}</dd></>}
            <dt className="text-neutral-500">Stock</dt>
            <dd>{product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</dd>
          </dl>

          {product.stock > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-neutral-300">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 hover:bg-neutral-100">-</button>
                <span className="px-4 py-3 font-mono text-sm w-12 text-center">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-4 py-3 hover:bg-neutral-100">+</button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="flex-1 bg-neutral-950 text-white py-3 px-8 text-sm uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
