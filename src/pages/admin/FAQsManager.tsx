import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { FAQItem } from '../../types';
import toast from 'react-hot-toast';
import { HelpCircle, Plus, Edit2, Trash2, Save, X } from 'lucide-react';

export default function FAQsManager() {
  const { faqs, addFAQ, updateFAQ, deleteFAQ } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null);

  // Form State
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');

  const handleOpenCreate = () => {
    setEditingFAQ(null);
    setQuestion('');
    setAnswer('');
    setCategory('Hair Transplant');
    setIsEditing(true);
  };

  const handleOpenEdit = (faq: FAQItem) => {
    setEditingFAQ(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategory(faq.category);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !answer) {
      toast.error('Question and Answer are required fields.');
      return;
    }

    const faqData = { question, answer, category };

    if (editingFAQ) {
      updateFAQ(editingFAQ.id, { ...editingFAQ, ...faqData });
      toast.success('Clinical FAQ updated.');
    } else {
      addFAQ(faqData);
      toast.success('New clinical FAQ published.');
    }

    setIsEditing(false);
    setEditingFAQ(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      deleteFAQ(id);
      toast.success('FAQ deleted.');
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HelpCircle className="text-teal-600" /> Clinical FAQs Manager
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage general clinical FAQs, categories, and procedures descriptions.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={handleOpenCreate}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Add New FAQ
          </button>
        )}
      </div>

      {/* Editor Form */}
      {isEditing && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              {editingFAQ ? 'Edit FAQ Item' : 'Create New FAQ Item'}
            </h2>
            <button 
              onClick={() => { setIsEditing(false); setEditingFAQ(null); }}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Clinical Question</label>
                <input 
                  required
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-teal-600"
                  placeholder="e.g. Is the hair transplant result permanent?"
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
                  <option value="Whitening Drip">Whitening Drip</option>
                  <option value="Appointments">Appointments</option>
                  <option value="Safety">Safety</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Detailed Answer</label>
              <textarea 
                required
                rows={5}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-teal-600"
                placeholder="Describe the medical explanation concisely..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => { setIsEditing(false); setEditingFAQ(null); }}
                className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 text-sm hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Save size={16} /> Save FAQ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FAQs List */}
      {!isEditing && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Question</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Answer Sample</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {faqs.map(faq => (
                  <tr key={faq.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 max-w-xs truncate">
                      {faq.question}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded-md text-xs font-semibold">
                        {faq.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 max-w-sm truncate">{faq.answer}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => handleOpenEdit(faq)}
                          className="p-1.5 bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(faq.id)}
                          className="p-1.5 bg-slate-100 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
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
