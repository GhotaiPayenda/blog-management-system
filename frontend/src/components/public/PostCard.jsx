import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PostCard({ post }) {
  const date = post.published_at || post.created_at;
  return (
    <motion.article
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
    >
      {post.featured_image ? (
        <img src={post.featured_image} alt={post.title} className="h-48 w-full object-cover" />
      ) : (
        <div className="h-48 w-full bg-gradient-to-br from-brand-100 to-slate-100 flex items-center justify-center text-brand-600 font-serif text-3xl">
          {post.title?.charAt(0)}
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
          {post.category_name && <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-medium">{post.category_name}</span>}
          {date && <span className="inline-flex items-center gap-1"><Calendar size={12} /> {new Date(date).toLocaleDateString()}</span>}
        </div>
        <h3 className="font-serif text-lg font-bold text-slate-900 mb-2 line-clamp-2">{post.title}</h3>
        <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-1">{post.excerpt || ''}</p>
        <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
          Read more <ArrowRight size={14} />
        </Link>
      </div>
    </motion.article>
  );
}
