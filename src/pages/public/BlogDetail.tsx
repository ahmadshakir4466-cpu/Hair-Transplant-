import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  User, 
  Clock, 
  ArrowLeft, 
  Share2, 
  Twitter, 
  Facebook, 
  Link2,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { blogs } = useData();
  const navigate = useNavigate();
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  const blog = blogs.find(b => b.slug === slug);

  useEffect(() => {
    if (blog) {
      document.title = `${blog.meta_title || blog.title}`;
      const descMeta = document.querySelector('meta[name="description"]');
      if (descMeta) {
        descMeta.setAttribute('content', blog.meta_description || blog.excerpt);
      }
    } else {
      // If blog doesn't exist, go to blog list
      if (slug) {
        navigate('/blog');
      }
    }
  }, [blog, slug, navigate]);

  if (!blog) return null;

  // Find related posts (same category, up to 3)
  const relatedPosts = blogs
    .filter(b => b.category === blog.category && b.id !== blog.id)
    .slice(0, 3);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleShare = (platform: 'twitter' | 'facebook' | 'whatsapp') => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(blog.title);
    let shareUrl = '';

    if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
    } else if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    } else if (platform === 'whatsapp') {
      shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
    }

    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-8 uppercase tracking-wider">
          <Link to="/" className="hover:text-teal-600">Home</Link>
          <ChevronRight size={10} />
          <Link to="/blog" className="hover:text-teal-600">Blog</Link>
          <ChevronRight size={10} />
          <span className="text-slate-600 truncate max-w-[200px]">{blog.title}</span>
        </nav>

        {/* Back Button */}
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-teal-600 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Blog List
        </Link>

        {/* Main Article Card */}
        <article className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
          {/* Featured Image */}
          <div className="h-64 sm:h-96 w-full relative">
            <img 
              src={blog.featured_image} 
              alt={blog.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="bg-teal-600 text-[10px] font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-wider">
                {blog.category}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-10 md:p-12 space-y-8">
            {/* Metadata and Title */}
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {blog.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400 pb-6 border-b border-slate-100 uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><User size={14} className="text-teal-600" /> {blog.author}</span>
                <span className="flex items-center gap-1.5"><Calendar size={14} className="text-teal-600" /> {blog.published_date}</span>
                <span className="flex items-center gap-1.5"><Clock size={14} className="text-teal-600" /> {blog.reading_time}</span>
              </div>
            </div>

            {/* Rich Content Area */}
            <div 
              className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-headings:tracking-tight prose-headings:mt-8 prose-headings:mb-4 prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600 prose-li:leading-relaxed prose-ol:text-slate-600 prose-ol:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Embedded Blog FAQs */}
            {blog.faqs && blog.faqs.length > 0 && (
              <div className="mt-12 pt-8 border-t border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <HelpCircle size={20} className="text-teal-600" /> Article FAQs
                </h3>
                <div className="space-y-4">
                  {blog.faqs.map((faq, idx) => {
                    const isOpen = openFaqIdx === idx;
                    return (
                      <div key={idx} className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                        <button
                          onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                          className="w-full flex justify-between items-center px-6 py-4 text-left font-bold text-slate-800 hover:bg-slate-100/50 transition-colors cursor-pointer text-sm"
                        >
                          <span>{faq.question}</span>
                          <span className="text-slate-400 font-medium">
                            {isOpen ? '−' : '+'}
                          </span>
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-4 pt-1 text-sm text-slate-600 leading-relaxed">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Share and Socials */}
            <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Share2 size={14} /> SHARE THIS CLINICAL STUDY
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleShare('twitter')}
                  className="p-2.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-600 rounded-xl text-slate-600 transition-colors cursor-pointer"
                  title="Share on Twitter"
                >
                  <Twitter size={16} />
                </button>
                <button 
                  onClick={() => handleShare('facebook')}
                  className="p-2.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-600 rounded-xl text-slate-600 transition-colors cursor-pointer"
                  title="Share on Facebook"
                >
                  <Facebook size={16} />
                </button>
                <button 
                  onClick={handleCopyLink}
                  className="p-2.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-600 rounded-xl text-slate-600 transition-colors cursor-pointer"
                  title="Copy Link"
                >
                  <Link2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Related Articles in {blog.category}</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map(post => (
                <div key={post.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between p-4 transition-all hover:shadow-md">
                  <div className="space-y-3">
                    <img src={post.featured_image} alt={post.title} className="h-32 w-full object-cover rounded-xl" />
                    <h4 className="font-bold text-slate-800 text-sm line-clamp-2 leading-snug">
                      <Link to={`/blog/${post.slug}`} className="hover:text-teal-600 transition-colors">{post.title}</Link>
                    </h4>
                  </div>
                  <Link to={`/blog/${post.slug}`} className="text-xs font-bold text-teal-600 hover:text-teal-700 mt-4 block">
                    Read Article &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
