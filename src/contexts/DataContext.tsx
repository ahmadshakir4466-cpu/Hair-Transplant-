import React, { createContext, useContext, useState, useEffect } from 'react';
import { BlogPost, FAQItem, TestimonialItem, SEOSettings, LegalPolicies } from '../types';
import { initialBlogs, initialFAQs, initialTestimonials, initialSettings, initialPolicies } from '../data/initialData';

type DataContextType = {
  blogs: BlogPost[];
  addBlog: (blog: Omit<BlogPost, 'id'>) => void;
  updateBlog: (id: string, blog: BlogPost) => void;
  deleteBlog: (id: string) => void;
  
  faqs: FAQItem[];
  addFAQ: (faq: Omit<FAQItem, 'id'>) => void;
  updateFAQ: (id: string, faq: FAQItem) => void;
  deleteFAQ: (id: string) => void;
  
  testimonials: TestimonialItem[];
  addTestimonial: (t: Omit<TestimonialItem, 'id'>) => void;
  updateTestimonial: (id: string, t: TestimonialItem) => void;
  deleteTestimonial: (id: string) => void;
  
  policies: LegalPolicies;
  updatePolicies: (p: LegalPolicies) => void;
  
  seoSettings: SEOSettings;
  updateSEOSettings: (s: SEOSettings) => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [policies, setPolicies] = useState<LegalPolicies>(initialPolicies);
  const [seoSettings, setSeoSettings] = useState<SEOSettings>(initialSettings);

  // Initial Load from LocalStorage or Fallback
  useEffect(() => {
    const storedBlogs = localStorage.getItem('clinic_blogs');
    const storedFaqs = localStorage.getItem('clinic_faqs');
    const storedTestimonials = localStorage.getItem('clinic_testimonials');
    const storedPolicies = localStorage.getItem('clinic_policies');
    const storedSeo = localStorage.getItem('clinic_seo_settings');

    if (storedBlogs) {
      setBlogs(JSON.parse(storedBlogs));
    } else {
      setBlogs(initialBlogs);
      localStorage.setItem('clinic_blogs', JSON.stringify(initialBlogs));
    }

    if (storedFaqs) {
      setFaqs(JSON.parse(storedFaqs));
    } else {
      setFaqs(initialFAQs);
      localStorage.setItem('clinic_faqs', JSON.stringify(initialFAQs));
    }

    if (storedTestimonials) {
      setTestimonials(JSON.parse(storedTestimonials));
    } else {
      setTestimonials(initialTestimonials);
      localStorage.setItem('clinic_testimonials', JSON.stringify(initialTestimonials));
    }

    if (storedPolicies) {
      setPolicies(JSON.parse(storedPolicies));
    } else {
      setPolicies(initialPolicies);
      localStorage.setItem('clinic_policies', JSON.stringify(initialPolicies));
    }

    if (storedSeo) {
      setSeoSettings(JSON.parse(storedSeo));
    } else {
      setSeoSettings(initialSettings);
      localStorage.setItem('clinic_seo_settings', JSON.stringify(initialSettings));
    }
  }, []);

  // Sync Helpers
  const saveBlogs = (updated: BlogPost[]) => {
    setBlogs(updated);
    localStorage.setItem('clinic_blogs', JSON.stringify(updated));
  };

  const saveFaqs = (updated: FAQItem[]) => {
    setFaqs(updated);
    localStorage.setItem('clinic_faqs', JSON.stringify(updated));
  };

  const saveTestimonials = (updated: TestimonialItem[]) => {
    setTestimonials(updated);
    localStorage.setItem('clinic_testimonials', JSON.stringify(updated));
  };

  // Blogs CRUD
  const addBlog = (blog: Omit<BlogPost, 'id'>) => {
    const newBlog: BlogPost = {
      ...blog,
      id: `blog-${Date.now()}`
    };
    saveBlogs([newBlog, ...blogs]);
  };

  const updateBlog = (id: string, updated: BlogPost) => {
    saveBlogs(blogs.map(b => b.id === id ? updated : b));
  };

  const deleteBlog = (id: string) => {
    saveBlogs(blogs.filter(b => b.id !== id));
  };

  // FAQs CRUD
  const addFAQ = (faq: Omit<FAQItem, 'id'>) => {
    const newFAQ: FAQItem = {
      ...faq,
      id: `faq-${Date.now()}`
    };
    saveFaqs([...faqs, newFAQ]);
  };

  const updateFAQ = (id: string, updated: FAQItem) => {
    saveFaqs(faqs.map(f => f.id === id ? updated : f));
  };

  const deleteFAQ = (id: string) => {
    saveFaqs(faqs.filter(f => f.id !== id));
  };

  // Testimonials CRUD
  const addTestimonial = (t: Omit<TestimonialItem, 'id'>) => {
    const newT: TestimonialItem = {
      ...t,
      id: `testi-${Date.now()}`
    };
    saveTestimonials([newT, ...testimonials]);
  };

  const updateTestimonial = (id: string, updated: TestimonialItem) => {
    saveTestimonials(testimonials.map(t => t.id === id ? updated : t));
  };

  const deleteTestimonial = (id: string) => {
    saveTestimonials(testimonials.filter(t => t.id !== id));
  };

  // Policies Update
  const updatePolicies = (p: LegalPolicies) => {
    setPolicies(p);
    localStorage.setItem('clinic_policies', JSON.stringify(p));
  };

  // SEO Update
  const updateSEOSettings = (s: SEOSettings) => {
    setSeoSettings(s);
    localStorage.setItem('clinic_seo_settings', JSON.stringify(s));
  };

  return (
    <DataContext.Provider value={{
      blogs,
      addBlog,
      updateBlog,
      deleteBlog,
      faqs,
      addFAQ,
      updateFAQ,
      deleteFAQ,
      testimonials,
      addTestimonial,
      updateTestimonial,
      deleteTestimonial,
      policies,
      updatePolicies,
      seoSettings,
      updateSEOSettings
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
