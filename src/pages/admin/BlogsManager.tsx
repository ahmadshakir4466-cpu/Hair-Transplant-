import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { BlogPost } from '../../types';
import toast from 'react-hot-toast';
import { 
  BookOpen, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Eye, 
  Globe, 
  HelpCircle 
} from 'lucide-react';

export default function BlogsManager() {
  const { blogs, addBlog, updateBlog, deleteBlog } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [previewBlog, setPreviewBlog] = useState<BlogPost | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [readingTime, setReadingTime] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  
  // Blog FAQs state
  const [blogFaqs, setBlogFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');

  const handleOpenCreate = () => {
    setEditingBlog(null);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setFeaturedImage('https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80');
    setAuthor('Dr. Sohail Ahmad');
    setCategory('Skin Care');
    setReadingTime('8 min read');
    setMetaTitle('');
    setMetaDescription('');
    setKeywords('skincare, clinic');
    setBlogFaqs([]);
    setIsEditing(true);
  };

  const handleOpenEdit = (blog: BlogPost) => {
    setEditingBlog(blog);
    setTitle(blog.title);
    setSlug(blog.slug);
    setExcerpt(blog.excerpt);
    setContent(blog.content);
    setFeaturedImage(blog.featured_image);
    setAuthor(blog.author);
    setCategory(blog.category);
    setReadingTime(blog.reading_time);
    setMetaTitle(blog.meta_title);
    setMetaDescription(blog.meta_description);
    setKeywords(blog.keywords.join(', '));
    setBlogFaqs(blog.faqs || []);
    setIsEditing(true);
  };

  const handleAddFaq = () => {
    if (!newFaqQuestion || !newFaqAnswer) {
      toast.error('Please enter both a question and an answer.');
      return;
    }
    setBlogFaqs([...blogFaqs, { question: newFaqQuestion, answer: newFaqAnswer }]);
    setNewFaqQuestion('');
    setNewFaqAnswer('');
    toast.success('FAQ added to this article.');
  };

  const handleRemoveFaq = (idx: number) => {
    setBlogFaqs(blogFaqs.filter((_, i) => i !== idx));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !slug || !content) {
      toast.error('Title, Slug, and Content are required fields.');
      return;
    }

    const processedKeywords = keywords.split(',').map(k => k.trim()).filter(Boolean);

    const blogData = {
      title,
      slug: slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-'),
      excerpt,
      content,
      featured_image: featuredImage || 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
      author,
      published_date: editingBlog ? editingBlog.published_date : new Date().toISOString().split('T')[0],
      category,
      reading_time: readingTime,
      meta_title: metaTitle || title,
      meta_description: metaDescription || excerpt,
      keywords: processedKeywords,
      faqs: blogFaqs
    };

    if (editingBlog) {
      updateBlog(editingBlog.id, { ...editingBlog, ...blogData });
      toast.success('Clinical blog post updated successfully!');
    } else {
      addBlog(blogData);
      toast.success('New clinical blog post published!');
    }

    setIsEditing(false);
    setEditingBlog(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you absolutely sure you want to delete this blog post?')) {
      deleteBlog(id);
      toast.success('Blog post deleted.');
    }
  };

  const generateAutoSlug = (val: string) => {
    setTitle(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'));
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="text-teal-600" /> Clinical Blogs Manager
          </h1>
          <p className="text-sm text-slate-500 mt-1">Create, update, and schedule SEO articles to boost Google indexing and AdSense compliance.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={handleOpenCreate}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> New Blog Post
          </button>
        )}
      </div>

      {/* Editor Form */}
      {isEditing && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">
              {editingBlog ? 'Edit Medical Article' : 'Compose New Article'}
            </h2>
            <button 
              onClick={() => { setIsEditing(false); setEditingBlog(null); }}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Article Title</label>
                <input 
                  required
                  type="text"
                  value={title}
                  onChange={(e) => generateAutoSlug(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-teal-600"
                  placeholder="e.g. FUE Hair Transplant Complete Guide"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">URL Slug</label>
                <input 
                  required
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50"
                  placeholder="hair-transplant-complete-guide"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Author</label>
                <input 
                  required
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-teal-600"
                >
                  <option value="Hair Transplant">Hair Transplant</option>
                  <option value="PRP">PRP</option>
                  <option value="Laser">Laser</option>
                  <option value="Hydra Facial">Hydra Facial</option>
                  <option value="Botox">Botox</option>
                  <option value="Skin Care">Skin Care</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Reading Time</label>
                <input 
                  required
                  type="text"
                  value={readingTime}
                  onChange={(e) => setReadingTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-teal-600"
                  placeholder="e.g. 10 min read"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Featured Image URL</label>
                <input 
                  required
                  type="text"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Short Excerpt (SEO Summary)</label>
              <textarea 
                required
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-teal-600 resize-none"
                placeholder="A compelling, short 1-2 sentence description summarizing the article."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Article Body (HTML / Markdown Supported)</label>
              <textarea 
                required
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 font-mono text-xs outline-none focus:ring-2 focus:ring-teal-600"
                placeholder="<h2>Section Heading</h2><p>Article body text goes here...</p>"
              />
            </div>

            {/* SEO specific section */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Globe size={16} className="text-teal-600" /> Meta SEO Overrides
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Meta Title</label>
                  <input 
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="w-full bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                    placeholder="Defaults to Title"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Keywords (Comma separated)</label>
                  <input 
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="w-full bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                    placeholder="hair transplant, fue, restoration"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Meta Description</label>
                <textarea 
                  rows={2}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="w-full bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs outline-none resize-none"
                  placeholder="Defaults to excerpt"
                />
              </div>
            </div>

            {/* Interactive Blog FAQs */}
            <div className="bg-teal-50/50 rounded-2xl p-6 border border-teal-100 space-y-4">
              <h3 className="font-bold text-teal-950 text-sm flex items-center gap-2">
                <HelpCircle size={16} className="text-teal-600" /> Article Embedded FAQs
              </h3>
              
              {blogFaqs.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {blogFaqs.map((faq, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-start text-xs">
                      <div>
                        <p className="font-bold text-slate-800">Q: {faq.question}</p>
                        <p className="text-slate-500 mt-1">A: {faq.answer}</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveFaq(idx)}
                        className="text-red-500 hover:text-red-700 font-bold ml-2 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4 pt-2">
                <div>
                  <input 
                    type="text"
                    placeholder="Enter FAQ Question..."
                    value={newFaqQuestion}
                    onChange={(e) => setNewFaqQuestion(e.target.value)}
                    className="w-full bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                </div>
                <div>
                  <input 
                    type="text"
                    placeholder="Enter FAQ Answer..."
                    value={newFaqAnswer}
                    onChange={(e) => setNewFaqAnswer(e.target.value)}
                    className="w-full bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddFaq}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer"
              >
                + Add FAQ to Article
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => { setIsEditing(false); setEditingBlog(null); }}
                className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 text-sm hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Save size={16} /> Save Article
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Blogs List */}
      {!isEditing && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Article Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Published Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {blogs.map(blog => (
                  <tr key={blog.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      <div className="flex items-center gap-3">
                        <img src={blog.featured_image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p>{blog.title}</p>
                          <p className="text-xs text-slate-400 font-normal mt-0.5">/{blog.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded-md text-xs font-semibold">
                        {blog.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">{blog.author}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-400">{blog.published_date}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <a 
                          href={`/blog/${blog.slug}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="p-1.5 bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye size={15} />
                        </a>
                        <button 
                          onClick={() => handleOpenEdit(blog)}
                          className="p-1.5 bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button 
                          onClick={() => handleDelete(blog.id)}
                          className="p-1.5 bg-slate-100 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
