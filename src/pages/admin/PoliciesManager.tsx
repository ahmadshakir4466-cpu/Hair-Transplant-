import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import toast from 'react-hot-toast';
import { Shield, Save, FileText, Cookie } from 'lucide-react';

export default function PoliciesManager() {
  const { policies, updatePolicies } = useData();
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'cookies'>('privacy');

  // Editors Content State
  const [privacyText, setPrivacyText] = useState(policies.privacy_policy);
  const [termsText, setTermsText] = useState(policies.terms_and_conditions);
  const [cookiesText, setCookiesText] = useState(policies.cookie_policy);

  const handleSave = () => {
    updatePolicies({
      privacy_policy: privacyText,
      terms_and_conditions: termsText,
      cookie_policy: cookiesText
    });
    toast.success('Legal and compliance policies saved successfully!');
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="text-teal-600" /> Legal & AdSense Compliance Editors
          </h1>
          <p className="text-sm text-slate-500 mt-1">Review, write, and refine required legal disclosures for Google AdSense and user terms.</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Save size={16} /> Save All Policies
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 cursor-pointer transition-all ${
            activeTab === 'privacy' 
              ? 'border-teal-600 text-teal-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield size={16} /> Privacy Policy
        </button>
        <button
          onClick={() => setActiveTab('terms')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 cursor-pointer transition-all ${
            activeTab === 'terms' 
              ? 'border-teal-600 text-teal-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText size={16} /> Terms & Conditions
        </button>
        <button
          onClick={() => setActiveTab('cookies')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 cursor-pointer transition-all ${
            activeTab === 'cookies' 
              ? 'border-teal-600 text-teal-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cookie size={16} /> Cookie Policy
        </button>
      </div>

      {/* Editors Area */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        {activeTab === 'privacy' && (
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Privacy Policy (HTML Format)</label>
            <p className="text-xs text-slate-400">Specify precise data collection details, personalized AdSense disclosures, and contact info.</p>
            <textarea
              rows={18}
              value={privacyText}
              onChange={(e) => setPrivacyText(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-mono text-xs outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Terms & Conditions (HTML Format)</label>
            <p className="text-xs text-slate-400">Establish diagnostic consult booking rules, cancellation timelines, and clinic standards.</p>
            <textarea
              rows={18}
              value={termsText}
              onChange={(e) => setTermsText(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-mono text-xs outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
        )}

        {activeTab === 'cookies' && (
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Cookie Policy (HTML Format)</label>
            <p className="text-xs text-slate-400">Define active tracking technologies, analytical tags, and browser configuration steps.</p>
            <textarea
              rows={18}
              value={cookiesText}
              onChange={(e) => setCookiesText(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-mono text-xs outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
        )}
      </div>

      {/* Quick Guide */}
      <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
        <h4 className="font-bold text-slate-800 text-sm mb-2">HTML Tags Allowed</h4>
        <p className="text-xs text-slate-500 leading-relaxed">
          For seamless styling, utilize tags such as <code>&lt;h2&gt;</code>, <code>&lt;p&gt;</code>, <code>&lt;ul&gt;</code>, <code>&lt;li&gt;</code>, and <code>&lt;strong&gt;</code> inside your content blocks.
        </p>
      </div>
    </div>
  );
}
