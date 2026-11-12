import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import PostCard from '../../components/public/PostCard';
import { Calendar, User, Folder, ArrowLeft } from 'lucide-react';

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get(`/public/posts/${slug}`)
      .then((res) => { setPost(res.data.post); setRelated(res.data.related || []); })
      .catch((err) => setError(err.response?.data?.message || 'Post not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Spinner label="Loading post..." />;
  if (error || !post) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Post not found</h1>
      <p className="text-slate-500 mb-6">{error || 'The post you are looking for does not exist or is not published.'}</p>
      <Link to="/blog" className="text-brand-600 hover:underline inline-flex items-center gap-1"><ArrowLeft size={16} /> Back to blog</Link>
    </div>
  );

  const date = post.published_at || post.created_at;

  return (
    <article>
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600 mb-6"><ArrowLeft size={14} /> Back to blog</Link>
          {post.category_name && <span className="inline-block ml-3 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-medium">{post.category_name}</span>}
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-slate-900 mt-4 mb-4 leading-tight">{post.title}</h1>
          {post.excerpt && <p className="text-lg text-slate-600 mb-6">{post.excerpt}</p>}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            {post.author_name && <span className="inline-flex items-center gap-1.5"><User size={15} /> {post.author_name}</span>}
            {date && <span className="inline-flex items-center gap-1.5"><Calendar size={15} /> {new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
            {post.category_name && <span className="inline-flex items-center gap-1.5"><Folder size={15} /> {post.category_name}</span>}
          </div>
        </div>
      </div>

      {post.featured_image && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-2 pt-8">
          <img src={post.featured_image} alt={post.title} className="w-full rounded-xl object-cover max-h-[480px]" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="prose-content text-lg" dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>

      {related.length > 0 && (
        <section className="bg-slate-50 border-t border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
            <h2 className="font-serif text-2xl font-bold text-slate-900 mb-6">Related Posts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
