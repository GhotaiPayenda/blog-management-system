import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FileText, CheckCircle, FileClock, FolderOpen, Plus } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}><Icon size={22} /></div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/stats')
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading dashboard..." />;
  if (error) return <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm">Welcome back{stats ? '' : ''} — overview of your blog</p>
        </div>
        <Link to="/admin/posts/new" className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium">
          <Plus size={16} /> New Post
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Posts" value={stats.totalPosts} icon={FileText} color="bg-blue-100 text-blue-600" />
        <StatCard label="Published" value={stats.publishedPosts} icon={CheckCircle} color="bg-emerald-100 text-emerald-600" />
        <StatCard label="Drafts" value={stats.draftPosts} icon={FileClock} color="bg-amber-100 text-amber-600" />
        <StatCard label="Categories" value={stats.totalCategories} icon={FolderOpen} color="bg-violet-100 text-violet-600" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Recent Posts</h2>
          <Link to="/admin/posts" className="text-sm text-brand-600 hover:underline">View all</Link>
        </div>
        {stats.recentPosts.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No posts yet. <Link to="/admin/posts/new" className="text-brand-600 underline">Create your first post</Link>.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {stats.recentPosts.map((p) => (
              <div key={p.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{p.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{p.category_name || 'Uncategorized'} · {new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
