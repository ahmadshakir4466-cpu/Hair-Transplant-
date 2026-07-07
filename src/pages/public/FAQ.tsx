import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { HelpCircle, Search, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export default function FAQ() {
  const { faqs, seoSettings } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  useEffect(() => {
    document.title = `Frequently Asked Questions | ${seoSettings.meta_title_suffix}`;
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute('content', 'View over 20+ detailed frequently asked questions about Hair Transplant, PRP, Laser Hair Removal, HydraFacials, and clinic pricing.');
    }
  }, [seoSettings]);

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(faqs.map(f => f.category)))];

  // Filter FAQs
  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id: string) => {
    if (openFaqId === id) {
      setOpenFaqId(null);
    } else {
      setOpenFaqId(id);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-100 mb-4">
            <Sparkles size={12} />
            CLINICAL FAQ PORTAL
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Frequently Asked Questions</h1>
          <p className="text-slate-500 mt-3">Professional, medically sound guidance on our hair restoration and skin care procedures.</p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-6 mb-10">
          <div className="relative">
            <input 
              type="text"
              placeholder="Search questions or clinical keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white px-5 py-4 pl-12 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none shadow-sm text-slate-700"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setOpenFaqId(null); }}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border cursor-pointer ${
                  selectedCategory === cat 
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-100' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion List */}
        {filteredFaqs.length > 0 ? (
          <div className="space-y-4">
            {filteredFaqs.map(faq => {
              const isOpen = openFaqId === faq.id;
              return (
                <div 
                  key={faq.id} 
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex justify-between items-center px-6 py-5 text-left font-bold text-slate-800 hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <span className="flex items-start gap-3">
                      <HelpCircle size={18} className="text-teal-600 mt-1 shrink-0" />
                      <span>{faq.question}</span>
                    </span>
                    <span className="shrink-0 text-slate-400 p-1">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </button>
                  
                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-sm text-slate-600 border-t border-slate-50 leading-relaxed bg-slate-50/20">
                      <p className="whitespace-pre-line">{faq.answer}</p>
                      <div className="mt-4 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                        <span className="bg-slate-100 px-2 py-1 rounded-lg">Category: {faq.category}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <p className="text-slate-400 font-medium">No results match your search keywords or active category filter.</p>
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
