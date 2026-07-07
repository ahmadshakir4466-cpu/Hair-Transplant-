import React, { useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { FileText } from 'lucide-react';

export default function TermsAndConditions() {
  const { policies, seoSettings } = useData();

  useEffect(() => {
    document.title = `Terms & Conditions | ${seoSettings.meta_title_suffix}`;
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute('content', 'Terms and Conditions for booking, treatments, and cancellations at Aesthetic Laser & Hair Transplant Clinic.');
    }
  }, [seoSettings]);

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
              <FileText size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Terms & Conditions</h1>
              <p className="text-sm text-slate-500 mt-1">Patient Rights, Clinical Agreements, and Cancellation Policies</p>
            </div>
          </div>
          
          <div 
            className="prose prose-slate max-w-none prose-headings:font-semibold prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600 prose-headings:mt-8 prose-headings:mb-4 prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: policies.terms_and_conditions }}
          />
        </div>
      </div>
    </div>
  );
}
