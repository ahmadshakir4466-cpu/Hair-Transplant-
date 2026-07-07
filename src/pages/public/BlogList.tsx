import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Search, Calendar, User, Clock, ArrowRight, Sparkles } from 'lucide-react';

export default function BlogList() {
  const { blogs, seoSettings } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    document.title = `Our Medical & Aesthetic Blog | ${seoSettings.meta_title_suffix}`;
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute('content', 'Explore our clinical, SEO-friendly articles on FUE hair transplantation, PRP hair therapy, laser hair removal, Botox, and medical facials.');
    }
  }, [seoSettings]);

  // Extract categories
  const categories = ['All', ...Array.from(new Set(blogs.map(b => b.category)))];

  // Filter blogs
  const filteredBlogs = blogs.filter(blog => {
    const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory;
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          blog.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-100 mb-4">
            <Sparkles size={12} />
            CLINICAL NEWS & INSIGHTS
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Our Medical Aesthetic Blog</h1>
          <p className="text-slate-500 mt-3">Expert medical advice, clinical treatment details, and hair/skin tips from our specialized staff.</p>
        </div>

        {/* Filters and Search */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="md:col-span-2 relative">
            <input 
              type="text"
              placeholder="Search detailed clinical articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white px-5 py-4 pl-12 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none shadow-sm text-slate-700"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          </div>

          <div className="md:col-span-1">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none shadow-sm text-slate-700 font-medium"
            >
              <option value="All">All Categories</option>
              {categories.filter(c => c !== 'All').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Featured Post (Only if all posts shown and no search) */}
        {selectedCategory === 'All' && searchQuery === '' && filteredBlogs.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-12 transition-all hover:shadow-md">
            <div className="grid lg:grid-cols-2">
              <div className="h-64 lg:h-auto relative">
                <img 
                  src={filteredBlogs[0].featured_image} 
                  alt={filteredBlogs[0].title} 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <span className="absolute top-4 left-4 bg-teal-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md">
                  FEATURED ARTICLE
                </span>
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="text-teal-600 text-xs font-bold uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded-md">
                    {filteredBlogs[0].category}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
                    <Link to={`/blog/${filteredBlogs[0].slug}`} className="hover:text-teal-600 transition-colors">
                      {filteredBlogs[0].title}
                    </Link>
                  </h2>
                  <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                    {filteredBlogs[0].excerpt}
                  </p>
                </div>
                
                <div className="pt-6 border-t border-slate-100 mt-6 flex flex-wrap gap-4 items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><User size={14} /> {filteredBlogs[0].author}</span>
                    <span className="flex items-center gap-1"><Calendar size={14} /> {filteredBlogs[0].published_date}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {filteredBlogs[0].reading_time}</span>
                  </div>
                  <Link to={`/blog/${filteredBlogs[0].slug}`} className="text-teal-600 font-bold hover:text-teal-700 flex items-center gap-1">
                    Read Article <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regular Posts Grid */}
        {filteredBlogs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog, idx) => {
              // Skip the first one if we rendered it as featured
              if (selectedCategory === 'All' && searchQuery === '' && idx === 0) return null;
              
              return (
                <article key={blog.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between transition-all duration-300 hover:translate-y-[-4px] hover:shadow-md">
                  <div>
                    <div className="h-48 relative">
                      <img 
                        src={blog.featured_image} 
                        alt={blog.title} 
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-teal-700 text-[10px] font-bold px-2 py-1 rounded-md">
                        {blog.category}
                      </span>
                    </div>
                    <div className="p-6 space-y-3">
                      <h3 className="font-bold text-slate-900 tracking-tight hover:text-teal-600 transition-colors line-clamp-2 leading-snug">
                        <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
                      </h3>
                      <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                        {blog.excerpt}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-6 pt-0 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400 mt-4">
                    <span className="flex items-center gap-1 font-medium"><Calendar size={12} /> {blog.published_date}</span>
                    <Link to={`/blog/${blog.slug}`} className="text-teal-600 font-bold hover:text-teal-700 flex items-center gap-0.5">
                      Read <ArrowRight size={12} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center">
            <p className="text-slate-400 font-medium">No medical articles found matching your query.</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-4 text-sm font-bold text-teal-600 hover:text-teal-700"
            >
              Reset Search & Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
