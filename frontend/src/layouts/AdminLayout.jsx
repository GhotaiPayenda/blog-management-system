import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, FolderOpen, Users, LogOut, PenSquare, ExternalLink, Menu, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/posts', label: 'Posts', icon: FileText },
  { to: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { to: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const NavLinks = ({ onNavigate }) => (
    <>
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
              isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          <Icon size={18} /> {label}
        </NavLink>
      ))}
      <NavLink to="/admin/posts/new" onClick={onNavigate} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white">
        <PenSquare size={18} /> New Post
      </NavLink>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-30 bg-slate-900 text-white flex items-center justify-between px-4 h-14">
        <button onClick={() => setOpen(true)} className="p-2 -ml-2 hover:bg-slate-800 rounded" aria-label="Open menu"><Menu size={20} /></button>
        <span className="font-semibold">Blog Admin</span>
        <div className="w-8" />
      </div>

      {/* Overlay */}
      {open && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`w-64 bg-slate-900 text-slate-100 flex flex-col fixed inset-y-0 left-0 z-50 transform transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-5 py-4 border-b border-slate-800 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-bold tracking-tight">Blog Admin</h1>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-300">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-700"><User size={14} /></span>
              <div className="min-w-0">
                <p className="font-medium text-slate-100 truncate">{admin?.name || 'Administrator'}</p>
                <p className="text-slate-400 truncate">{admin?.email}</p>
                {admin?.role && <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-700 text-slate-200 text-[10px] font-medium uppercase tracking-wide">{admin.role}</span>}
              </div>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden p-1.5 hover:bg-slate-800 rounded text-slate-300"><X size={18} /></button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavLinks onNavigate={() => setOpen(false)} />
        </nav>
        <div className="p-3 border-t border-slate-800 space-y-1">
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white">
            <ExternalLink size={18} /> View Blog
          </a>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-red-600 hover:text-white">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="lg:ml-64 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
