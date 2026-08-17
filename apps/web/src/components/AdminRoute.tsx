import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores';

export default function AdminRoute() {
  const { user, isAdmin } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/" replace />;
  return <Outlet />;
}
