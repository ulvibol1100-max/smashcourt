import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useCartStore } from '../stores';
import type { Address } from '../types';

export default function CheckoutPage() {
  const { cart, fetchCart } = useCartStore();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: 'Home', line1: '', city: 'Phnom Penh', lat: undefined as number | undefined, lng: undefined as number | undefined });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCart();
    api.users.getAddresses().then((addrs) => {
      setAddresses(addrs);
      const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
      if (defaultAddr) setSelectedAddress(defaultAddr.id);
    }).catch(console.error);
  }, [fetchCart]);

  function requestGeolocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setNewAddress((a) => ({ ...a, lat: pos.coords.latitude, lng: pos.coords.longitude })),
      () => setError('Could not get location. Enter address manually.'),
    );
  }

  async function handleAddAddress(e: React.FormEvent) {
    e.preventDefault();
    const addr = await api.users.addAddress({ ...newAddress, isDefault: addresses.length === 0 });
    setAddresses((prev) => [...prev, addr]);
    setSelectedAddress(addr.id);
    setShowNewAddress(false);
  }

  async function handlePlaceOrder() {
    if (!selectedAddress) { setError('Select a delivery address'); return; }
    setLoading(true);
    setError('');
    try {
      const order = await api.orders.create({ deliveryAddressId: selectedAddress, discountCode: discountCode || undefined });
      navigate(`/orders?id=${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  }

  if (!cart || cart.items.length === 0) {
    return <div className="max-w-7xl mx-auto px-6 py-24 text-neutral-500">Your cart is empty.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-heading text-4xl mb-10">Checkout</h1>

      <section className="mb-10">
        <h2 className="font-heading text-xl mb-4">Delivery Address</h2>
        {addresses.length > 0 && (
          <div className="space-y-3 mb-4">
            {addresses.map((addr) => (
              <label key={addr.id} className={`flex items-start gap-3 p-4 border cursor-pointer ${selectedAddress === addr.id ? 'border-neutral-950' : 'border-neutral-200'}`}>
                <input type="radio" name="address" value={addr.id} checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} />
                <div>
                  <p className="font-medium">{addr.label || 'Address'}</p>
                  <p className="text-sm text-neutral-500">{addr.line1}, {addr.city}</p>
                  {addr.lat && <p className="font-mono text-xs text-neutral-400 mt-1">Pinned: {addr.lat.toFixed(4)}, {addr.lng?.toFixed(4)}</p>}
                </div>
              </label>
            ))}
          </div>
        )}

        {!showNewAddress ? (
          <button onClick={() => { setShowNewAddress(true); requestGeolocation(); }} className="text-sm underline">
            Add new address
          </button>
        ) : (
          <form onSubmit={handleAddAddress} className="space-y-4 border border-neutral-200 p-6">
            <input placeholder="Label (e.g. Home)" value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} className="w-full border px-4 py-2" />
            <input required placeholder="Street address" value={newAddress.line1} onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })} className="w-full border px-4 py-2" />
            <input required placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="w-full border px-4 py-2" />
            <button type="button" onClick={requestGeolocation} className="text-sm text-neutral-500 underline">Use my location</button>
            {newAddress.lat && <p className="font-mono text-xs text-neutral-400">Location pinned</p>}
            <div className="flex gap-3">
              <button type="submit" className="bg-neutral-950 text-white px-6 py-2 text-sm">Save Address</button>
              <button type="button" onClick={() => setShowNewAddress(false)} className="text-sm">Cancel</button>
            </div>
          </form>
        )}
      </section>

      <section className="mb-10">
        <h2 className="font-heading text-xl mb-4">Discount Code</h2>
        <input
          placeholder="Enter code"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
          className="border px-4 py-2 w-full max-w-xs font-mono uppercase"
        />
      </section>

      <section className="mb-10 bg-neutral-50 p-6">
        <h2 className="font-heading text-xl mb-4">Payment</h2>
        <p className="text-neutral-600">Cash on Delivery — pay when your order arrives.</p>
        <p className="font-mono mt-4">Total: ${cart.subtotal.toFixed(2)}</p>
      </section>

      {error && <p className="text-accent mb-4 text-sm">{error}</p>}

      <button
        onClick={handlePlaceOrder}
        disabled={loading}
        className="w-full bg-neutral-950 text-white py-4 text-sm uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-50"
      >
        {loading ? 'Placing Order...' : 'Place Order'}
      </button>
    </div>
  );
}
