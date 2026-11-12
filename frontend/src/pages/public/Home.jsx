import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import PostCard from '../../components/public/PostCard';
import Spinner from '../../components/ui/Spinner';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/public/posts/latest', { params: { limit: 6 } }),
      api.get('/public/categories'),
    ]).then(([pRes, cRes]) => {
      setPosts(pRes.data.posts);
      setCategories(cRes.data.categories);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 md:py-32">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <p className="text-brand-300 font-medium mb-3 tracking-wide uppercase text-sm">Welcome to Insightful</p>
            <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-6">Ideas, stories, and perspectives that matter.</h1>
            <p className="text-slate-300 text-lg md:text-xl mb-8">Explore thoughtful articles on technology, design, and the craft of building great things.</p>
            <Link to="/blog" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-lg font-medium transition">
              Browse all posts <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-serif text-3xl font-bold text-slate-900">Latest Posts</h2>
            <p className="text-slate-500 mt-1">Fresh from the blog</p>
          </div>
          <Link to="/blog" className="text-brand-600 hover:underline text-sm font-medium hidden sm:inline">View all</Link>
        </div>
        {loading ? <Spinner /> : posts.length === 0 ? (
          <div className="text-center text-slate-500 py-12 bg-slate-50 rounded-xl">No published posts yet. Check back soon!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </section>

      {categories.length > 0 && (
        <section className="bg-slate-50 border-y border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
            <h2 className="font-serif text-3xl font-bold text-slate-900 mb-2">Categories</h2>
            <p className="text-slate-500 mb-8">Browse posts by topic</p>
            <div className="flex flex-wrap gap-3">
              {categories.map((c) => (
                <Link key={c.id} to={`/blog?category=${c.slug}`} className="px-4 py-2 rounded-full bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-600 text-slate-700 text-sm font-medium transition shadow-sm">
                  {c.name} <span className="text-slate-400 ml-1">({c.post_count})</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
