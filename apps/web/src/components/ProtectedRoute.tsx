import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores';

export default function ProtectedRoute() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
