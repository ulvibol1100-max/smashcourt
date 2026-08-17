import { Link, NavLink, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore, useCartStore } from '../stores';

export default function Layout() {
  const { user, logout, isAdmin } = useAuthStore();
  const { cart, fetchCart } = useCartStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className={`sticky top-0 z-50 bg-white border-b border-neutral-200 transition-all duration-300 ${
          scrolled ? 'py-3 shadow-sm' : 'py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="font-heading text-2xl tracking-tight">
            SMASHCOURT
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm uppercase tracking-wide">
            <NavLink to="/shop" className="hover:text-accent transition-colors">Shop</NavLink>
            {user && <NavLink to="/orders" className="hover:text-accent transition-colors">Orders</NavLink>}
            {isAdmin() && <NavLink to="/admin" className="hover:text-accent transition-colors">Admin</NavLink>}
          </nav>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link to="/account" className="text-sm hover:text-accent transition-colors hidden sm:block">
                  {user.name}
                </Link>
                <button onClick={() => logout()} className="text-sm hover:text-accent transition-colors">
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" className="text-sm hover:text-accent transition-colors">Sign In</Link>
            )}
            <Link to="/cart" className="font-mono-label relative">
              Cart
              {cart && cart.itemCount > 0 && (
                <span className="absolute -top-2 -right-4 bg-accent text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-neutral-950 text-white py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12">
          <div>
            <p className="font-heading text-xl mb-4">SMASHCOURT</p>
            <p className="text-neutral-400 text-sm">Premium badminton rackets. Delivered to your door. Cash on delivery.</p>
          </div>
          <div>
            <p className="font-mono-label text-neutral-500 mb-4">Shop</p>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li><Link to="/shop" className="hover:text-white transition-colors">All Rackets</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-mono-label text-neutral-500 mb-4">Support</p>
            <p className="text-sm text-neutral-400">Phnom Penh, Cambodia</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-neutral-800 text-xs text-neutral-500 font-mono">
          {new Date().getFullYear()} SmashCourt. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
