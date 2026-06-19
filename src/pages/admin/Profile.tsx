import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Camera, Save, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProfile() {
  const { user } = useAuth();
  const [profileName, setProfileName] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.user_metadata) {
      setProfileName(user.user_metadata.full_name || '');
      setProfileAvatar(user.user_metadata.avatar_url || '');
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileAvatar(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profileName,
          avatar_url: profileAvatar,
        }
      });
      if (error) throw error;
      toast.success('Admin profile updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Admin Profile</h1>
        <p className="text-slate-500">Manage your personal admin account settings and profile picture.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <form onSubmit={handleSaveProfile} className="p-8">
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-8">
            <div className="relative group shrink-0">
              {profileAvatar ? (
                <img 
                  src={profileAvatar} 
                  alt="Admin Profile" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-teal-50 border-4 border-white shadow-sm flex items-center justify-center">
                  <UserIcon size={32} className="text-teal-600" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg border border-slate-100 text-slate-600 hover:text-teal-600 hover:border-teal-100 cursor-pointer transition-colors transition-transform hover:scale-105 active:scale-95">
                <Camera size={16} />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            
            <div className="flex-1 w-full">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Profile Picture</h2>
              <p className="text-sm text-slate-500 max-w-sm mb-4">Upload a professional photo to be displayed across the admin portal.</p>
              {profileAvatar && (
                <button 
                  type="button" 
                  onClick={() => setProfileAvatar('')}
                  className="text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>

          <div className="space-y-5 max-w-md">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon size={18} className="text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all placeholder:text-slate-400"
                    placeholder="Enter your full name"
                  />
                </div>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                />
                <p className="text-xs text-slate-400 mt-1">Email address cannot be changed.</p>
             </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-end">
             <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-teal-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
}
