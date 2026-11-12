import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { admin, isAuthenticated, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>;
  }
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (admin?.role !== 'Admin') {
    return <Navigate to="/admin/login" replace state={{ error: 'Admin access required. Your account does not have permission to access this area.' }} />;
  }
  return <Outlet />;
}
