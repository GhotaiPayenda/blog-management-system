import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Feather, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition ${isActive ? 'text-brand-600' : 'text-slate-600 hover:text-slate-900'}`;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand-600 text-white"><Feather size={16} /></span>
          Insightful
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/blog" className={linkClass}>Blog</NavLink>
        </nav>
        <button className="md:hidden p-2 -mr-2 text-slate-700 hover:bg-slate-100 rounded" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-2">
            <NavLink to="/" end className={linkClass} onClick={() => setOpen(false)}>Home</NavLink>
            <NavLink to="/blog" className={linkClass} onClick={() => setOpen(false)}>Blog</NavLink>
          </nav>
        </div>
      )}
    </header>
  );
}
