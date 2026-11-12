import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import PostCard from '../../components/public/PostCard';
import Spinner from '../../components/ui/Spinner';
import { Search } from 'lucide-react';

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => { setSearchInput(search); }, [search]);

  useEffect(() => {
    api.get('/public/categories').then((r) => setCategories(r.data.categories)).catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    const params = { page, limit: 9 };
    if (category) params.category = category;
    if (search) params.search = search;
    api.get('/public/posts', { params })
      .then((res) => { setPosts(res.data.posts); setPagination(res.data.pagination); })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load posts'))
      .finally(() => setLoading(false));
  }, [page, category, search]);

  useEffect(() => { load(); }, [load]);

  const updateParams = (next) => {
    const params = {};
    if (next.category ?? category) params.category = next.category ?? category;
    if (next.search ?? search) params.search = next.search ?? search;
    const nextPage = next.page ?? 1;
    if (nextPage > 1) params.page = String(nextPage);
    setSearchParams(params);
  };

  const setCategory = (slug) => updateParams({ category: slug || '', page: 1 });
  const setPage = (p) => updateParams({ page: p });
  const onSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ search: searchInput.trim(), page: 1 });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold text-slate-900 mb-2">Blog</h1>
        <p className="text-slate-500">Browse and search published articles</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setCategory('')} className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${!category ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-700 border-slate-200 hover:border-brand-400'}`}>All</button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setCategory(c.slug)} className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${category === c.slug ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-700 border-slate-200 hover:border-brand-400'}`}>
              {c.name}
            </button>
          ))}
        </div>
        <form onSubmit={onSearchSubmit} className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-9 pr-20 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          />
          <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-brand-600 text-white text-xs font-medium rounded-md hover:bg-brand-700">Search</button>
        </form>
      </div>

      {loading ? <Spinner /> : error ? (
        <div className="text-center py-12 bg-red-50 text-red-700 rounded-xl">{error}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-xl text-slate-500">No published posts found. Try a different search or category.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-slate-50">Previous</button>
              <span className="text-sm text-slate-600">Page {pagination.page} of {pagination.totalPages}</span>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-slate-50">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
