import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/categories')
      .then((res) => setCategories(res.data.categories))
      .catch((err) => setToast({ type: 'error', message: err.response?.data?.message || 'Failed to load categories' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setToast({ type: 'error', message: 'Name is required' }); return; }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, { name });
        setToast({ type: 'success', message: 'Category updated' });
      } else {
        await api.post('/categories', { name });
        setToast({ type: 'success', message: 'Category created' });
      }
      setName('');
      setEditing(null);
      load();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/categories/${id}`);
      setToast({ type: 'success', message: res.data.message || 'Category deleted' });
      load();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Delete failed' });
    } finally {
      setConfirm(null);
    }
  };

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <ConfirmDialog
        open={!!confirm}
        title="Delete Category"
        message="Are you sure? Posts in this category will become uncategorized."
        onConfirm={() => handleDelete(confirm)}
        onCancel={() => setConfirm(null)}
      />
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Categories</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <h2 className="font-semibold mb-3">{editing ? 'Edit Category' : 'New Category'}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60">
              <Plus size={16} /> {editing ? 'Update' : 'Add'}
            </button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); setName(''); }} className="px-4 py-2 rounded-lg border border-slate-300 text-sm">Cancel</button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? <Spinner /> : categories.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No categories yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Name</th>
                <th className="text-left px-5 py-3 font-medium">Slug</th>
                <th className="text-left px-5 py-3 font-medium">Posts</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-3 font-medium text-slate-900">{c.name}</td>
                  <td className="px-5 py-3 text-slate-500">{c.slug}</td>
                  <td className="px-5 py-3 text-slate-600">{c.post_count}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditing(c); setName(c.name); }} className="p-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded"><Pencil size={16} /></button>
                      <button onClick={() => setConfirm(c.id)} className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
