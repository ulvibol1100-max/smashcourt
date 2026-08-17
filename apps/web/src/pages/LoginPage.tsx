import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../stores';

export default function LoginPage() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.auth.login({ email, password });
      setAuth(res.user, res.accessToken);
      navigate(res.user.role === 'ADMIN' ? '/admin' : '/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <h1 className="font-heading text-3xl mb-2">Sign In</h1>
      <p className="text-neutral-500 mb-8 text-sm">Welcome back to SmashCourt</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-neutral-300 px-4 py-3" />
        <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-neutral-300 px-4 py-3" />
        {error && <p className="text-accent text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-neutral-950 text-white py-3 text-sm uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-50">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 text-sm text-neutral-500">
        No account? <Link to="/register" className="underline text-neutral-950">Create one</Link>
      </p>
    </div>
  );
}
