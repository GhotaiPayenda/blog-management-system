import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Plus, Pencil, Trash2, Eye, EyeOff, Search } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });

  const load = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (search) params.search = search;
    if (category) params.category = category;
    if (status) params.status = status;
    api.get('/posts', { params })
      .then((res) => { setPosts(res.data.posts); setPagination(res.data.pagination); })
      .catch((err) => setToast({ type: 'error', message: err.response?.data?.message || 'Failed to load posts' }))
      .finally(() => setLoading(false));
  }, [page, search, category, status]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { api.get('/categories').then((r) => setCategories(r.data.categories)).catch(() => {}); }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/posts/${id}`);
      setToast({ type: 'success', message: 'Post deleted' });
      load();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Delete failed' });
    } finally { setConfirm(null); }
  };

  const handleToggle = async (id) => {
    try {
      const res = await api.patch(`/posts/${id}/publish`);
      setToast({ type: 'success', message: res.data.message });
      load();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Action failed' });
    }
  };

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <ConfirmDialog open={!!confirm} title="Delete Post" message="This action cannot be undone. Delete this post?" onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Posts</h1>
          <p className="text-slate-500 text-sm">Manage your blog posts</p>
        </div>
        <Link to="/admin/posts/new" className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium"><Plus size={16} /> New Post</Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by title..." className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm" />
        </div>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? <Spinner /> : posts.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No posts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Title</th>
                  <th className="text-left px-5 py-3 font-medium">Slug</th>
                  <th className="text-left px-5 py-3 font-medium">Content</th>
                  <th className="text-left px-5 py-3 font-medium">Category</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Created</th>
                  <th className="text-right px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {posts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900 max-w-xs">
                      <span className="line-clamp-2">{p.title}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs max-w-[180px]">
                      <span className="line-clamp-2">/{p.slug}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-600 text-xs max-w-xs">
                      <span className="line-clamp-2">{(p.content || '').replace(/<[^>]+>/g, '').slice(0, 120)}{(p.content || '').length > 120 ? '…' : ''}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{p.category_name || 'Uncategorized'}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleToggle(p.id)} title={p.status === 'Published' ? 'Unpublish' : 'Publish'} className="p-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded">
                          {p.status === 'Published' ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <Link to={`/admin/posts/${p.id}/edit`} className="p-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded"><Pencil size={16} /></Link>
                        <button onClick={() => setConfirm(p.id)} className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 text-sm">
            <span className="text-slate-500">Page {pagination.page} of {pagination.totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 border rounded disabled:opacity-40">Prev</button>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 border rounded disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
