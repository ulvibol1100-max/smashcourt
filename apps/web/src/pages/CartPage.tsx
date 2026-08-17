import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useCartStore } from '../stores';

export default function CartPage() {
  const user = useAuthStore((s) => s.user);
  const { cart, fetchCart, updateQuantity, removeItem } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h1 className="font-heading text-3xl mb-4">Your Cart</h1>
        <p className="text-neutral-500 mb-8">Sign in to view your cart</p>
        <Link to="/login" className="underline">Sign In</Link>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h1 className="font-heading text-3xl mb-4">Your Cart is Empty</h1>
        <Link to="/shop" className="text-sm uppercase tracking-wide hover:text-accent">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="font-heading text-4xl mb-10">Cart</h1>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {cart.items.map((item) => (
            <div key={item.id} className="flex gap-6 border-b border-neutral-200 pb-6">
              <div className="w-24 h-32 bg-neutral-100 shrink-0">
                <img
                  src={item.product.images?.[0]?.url ? `${import.meta.env.VITE_API_URL || ''}${item.product.images[0].url}` : 'https://placehold.co/200x260'}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-mono-label text-neutral-500">{item.product.brand}</p>
                <h3 className="font-heading text-lg">{item.product.name}</h3>
                <p className="font-mono text-sm mt-1">${item.product.price.toFixed(2)}</p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center border border-neutral-300">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1">-</button>
                    <span className="px-3 py-1 font-mono text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1">+</button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-sm text-neutral-500 hover:text-accent">Remove</button>
                </div>
              </div>
              <p className="font-mono">${item.lineTotal.toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="bg-neutral-50 p-8 h-fit">
          <h2 className="font-heading text-xl mb-6">Order Summary</h2>
          <div className="flex justify-between mb-2 font-mono text-sm">
            <span>Subtotal</span>
            <span>${cart.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-6 font-mono text-sm text-neutral-500">
            <span>Delivery</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between mb-8 font-mono">
            <span>Total</span>
            <span>${cart.subtotal.toFixed(2)}</span>
          </div>
          <p className="text-xs text-neutral-500 mb-6">Cash on delivery. Pay when your order arrives.</p>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-neutral-950 text-white py-3 text-sm uppercase tracking-widest hover:bg-neutral-800 transition-colors"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
