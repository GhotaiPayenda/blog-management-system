import { useEffect, useState } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock } from 'lucide-react';

export default function Login() {
  const { login, logout, isAuthenticated, admin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);
      // clear state so it doesn't persist oddly
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  if (isAuthenticated && admin?.role === 'Admin') return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Email and password are required'); return; }
    setLoading(true);
    try {
      const data = await login(email, password);
      const user = data.admin || data.user;
      if (user?.role !== 'Admin') {
        logout();
        setError('Access denied. This area is for administrators only.');
        return;
      }
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mb-3"><Lock /></div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to manage your blog</p>
        </div>
        {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="admin@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
