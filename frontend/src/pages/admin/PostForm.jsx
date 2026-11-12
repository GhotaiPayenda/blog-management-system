import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import Toast from '../../components/ui/Toast';
import Spinner from '../../components/ui/Spinner';

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

export default function PostForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', content: '', featured_image: '',
    category_id: '', status: 'Draft',
  });

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data.categories)).catch(() => {});
    if (isEdit) {
      api.get(`/posts/${id}`)
        .then((res) => {
          const p = res.data.post;
          setForm({
            title: p.title || '', slug: p.slug || '', excerpt: p.excerpt || '',
            content: p.content || '', featured_image: p.featured_image || '',
            category_id: p.category_id || '', status: p.status || 'Draft',
          });
          setSlugTouched(true);
        })
        .catch((err) => setToast({ type: 'error', message: err.response?.data?.message || 'Failed to load post' }))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const update = (field, value) => {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === 'title' && !slugTouched) next.slug = slugify(value);
      if (field === 'slug') setSlugTouched(true);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setToast({ type: 'error', message: 'Title and content are required' });
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      slug: form.slug || slugify(form.title),
      category_id: form.category_id ? Number(form.category_id) : null,
    };
    try {
      if (isEdit) {
        await api.put(`/posts/${id}`, payload);
        setToast({ type: 'success', message: 'Post updated' });
      } else {
        await api.post('/posts', payload);
        setToast({ type: 'success', message: 'Post created' });
      }
      setTimeout(() => navigate('/admin/posts'), 600);
    } catch (err) {
      const msg = err.response?.data?.message || 'Save failed';
      const details = err.response?.data?.errors?.map((e) => e.message).join(', ');
      setToast({ type: 'error', message: details ? `${msg}: ${details}` : msg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner label="Loading post..." />;

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{isEdit ? 'Edit Post' : 'Create Post'}</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <input value={form.title} onChange={(e) => update('title', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
            <input value={form.slug} onChange={(e) => update('slug', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            <p className="text-xs text-slate-500 mt-1">Auto-generated from title; must be unique.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select value={form.category_id} onChange={(e) => update('category_id', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="">Uncategorized</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Featured Image URL</label>
            <input value={form.featured_image} onChange={(e) => update('featured_image', e.target.value)} placeholder="https://..." className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Excerpt</label>
            <textarea value={form.excerpt} onChange={(e) => update('excerpt', e.target.value)} rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Content *</label>
            <textarea value={form.content} onChange={(e) => update('content', e.target.value)} rows={12} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-sm" placeholder="Write your post content here (supports basic HTML)..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select value={form.status} onChange={(e) => update('status', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-60">{saving ? 'Saving...' : (isEdit ? 'Update Post' : 'Create Post')}</button>
          <button type="button" onClick={() => navigate('/admin/posts')} className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">Cancel</button>
        </div>
      </form>
    </div>
  );
}
