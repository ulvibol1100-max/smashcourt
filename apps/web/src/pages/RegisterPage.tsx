import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../stores';

export default function RegisterPage() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', username: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.auth.register(form);
      setAuth(res.user, res.accessToken);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <h1 className="font-heading text-3xl mb-2">Create Account</h1>
      <p className="text-neutral-500 mb-8 text-sm">Join SmashCourt today</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {(['name', 'username', 'email', 'phone'] as const).map((field) => (
          <input
            key={field}
            type={field === 'email' ? 'email' : 'text'}
            required={field !== 'phone'}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            className="w-full border border-neutral-300 px-4 py-3"
          />
        ))}
        <input type="password" required minLength={8} placeholder="Password (min 8 chars)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border border-neutral-300 px-4 py-3" />
        {error && <p className="text-accent text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-neutral-950 text-white py-3 text-sm uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-neutral-500">
        Already have an account? <Link to="/login" className="underline text-neutral-950">Sign in</Link>
      </p>
    </div>
  );
}
