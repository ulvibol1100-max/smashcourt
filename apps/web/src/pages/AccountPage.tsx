import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Address } from '../types';

interface Profile {
  name: string;
  username: string;
  email: string;
  phone?: string;
  overview: { totalOrders: number; totalSpend: number; byStatus: Record<string, number> };
  addresses: Address[];
}

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    api.users.me().then(setProfile).catch(console.error);
  }, []);

  if (!profile) return <div className="max-w-7xl mx-auto px-6 py-24 text-neutral-500">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-heading text-4xl mb-10">Account</h1>

      <section className="mb-12">
        <h2 className="font-heading text-xl mb-4">Profile</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <dt className="text-neutral-500">Name</dt><dd>{profile.name}</dd>
          <dt className="text-neutral-500">Username</dt><dd>{profile.username}</dd>
          <dt className="text-neutral-500">Email</dt><dd>{profile.email}</dd>
          <dt className="text-neutral-500">Phone</dt><dd>{profile.phone || '—'}</dd>
        </dl>
      </section>

      <section className="mb-12">
        <h2 className="font-heading text-xl mb-4">Overview</h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-neutral-50 p-6">
            <p className="font-mono-label text-neutral-500 mb-1">Total Orders</p>
            <p className="font-heading text-3xl">{profile.overview.totalOrders}</p>
          </div>
          <div className="bg-neutral-50 p-6">
            <p className="font-mono-label text-neutral-500 mb-1">Total Spend</p>
            <p className="font-heading text-3xl">${profile.overview.totalSpend.toFixed(2)}</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-heading text-xl mb-4">Saved Addresses</h2>
        {profile.addresses.length === 0 ? (
          <p className="text-neutral-500 text-sm">No saved addresses yet.</p>
        ) : (
          <div className="space-y-3">
            {profile.addresses.map((addr) => (
              <div key={addr.id} className="border border-neutral-200 p-4">
                <p className="font-medium">{addr.label || 'Address'}{addr.isDefault && ' (Default)'}</p>
                <p className="text-sm text-neutral-500">{addr.line1}, {addr.city}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
