import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { TestimonialItem } from '../../types';
import toast from 'react-hot-toast';
import { MessageSquare, Plus, Edit2, Trash2, Save, X, Star } from 'lucide-react';

export default function TestimonialsManager() {
  const { testimonials, addTestimonial, updateTestimonial, deleteTestimonial } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('Verified Patient');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [isVerified, setIsVerified] = useState(true);

  const handleOpenCreate = () => {
    setEditingTestimonial(null);
    setName('');
    setRole('Verified Patient');
    setContent('');
    setRating(5);
    setIsVerified(true);
    setIsEditing(true);
  };

  const handleOpenEdit = (t: TestimonialItem) => {
    setEditingTestimonial(t);
    setName(t.name);
    setRole(t.role);
    setContent(t.content);
    setRating(t.rating);
    setIsVerified(t.is_verified);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !content) {
      toast.error('Name and Review Content are required fields.');
      return;
    }

    const testimonialData = { name, role, content, rating, is_verified: isVerified };

    if (editingTestimonial) {
      updateTestimonial(editingTestimonial.id, { ...editingTestimonial, ...testimonialData });
      toast.success('Patient testimonial updated.');
    } else {
      addTestimonial(testimonialData);
      toast.success('New patient testimonial added.');
    }

    setIsEditing(false);
    setEditingTestimonial(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      deleteTestimonial(id);
      toast.success('Testimonial deleted.');
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="text-teal-600" /> Patient Reviews Manager
          </h1>
          <p className="text-sm text-slate-500 mt-1">Add, edit, and moderate verified patient success reviews shown on the front page.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={handleOpenCreate}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Add Testimonial
          </button>
        )}
      </div>

      {/* Editor Form */}
      {isEditing && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              {editingTestimonial ? 'Edit Patient Testimonial' : 'Add New Testimonial'}
            </h2>
            <button 
              onClick={() => { setIsEditing(false); setEditingTestimonial(null); }}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Patient Name</label>
                <input 
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-teal-600"
                  placeholder="e.g. Sarah Malik"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tagline/Role</label>
                <input 
                  required
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-teal-600"
                  placeholder="e.g. Verified Patient / Hair Patient"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Star Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-teal-600"
                >
                  <option value={5}>5 Stars (Excellent)</option>
                  <option value={4}>4 Stars (Very Good)</option>
                  <option value={3}>3 Stars (Average)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox"
                id="isVerified"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
              />
              <label htmlFor="isVerified" className="text-sm font-semibold text-slate-700 cursor-pointer">
                Display "Verified Patient" Clinical Trust Badge
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Review Content</label>
              <textarea 
                required
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-teal-600"
                placeholder="Paste or write the review content exactly..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => { setIsEditing(false); setEditingTestimonial(null); }}
                className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 text-sm hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Save size={16} /> Save Review
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Testimonials List */}
      {!isEditing && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Patient Name</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Tag/Role</th>
                  <th className="px-6 py-4">Review Preview</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {testimonials.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        {t.name}
                        {t.is_verified && (
                          <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                            Verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex text-amber-400 gap-0.5">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-xs text-slate-500">{t.role}</td>
                    <td className="px-6 py-4 text-slate-400 max-w-sm truncate">{t.content}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => handleOpenEdit(t)}
                          className="p-1.5 bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(t.id)}
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
