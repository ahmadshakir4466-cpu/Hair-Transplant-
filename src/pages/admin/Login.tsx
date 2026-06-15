import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { HeartPulse, Stethoscope, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user is logged in AND is an admin, redirect to admin dashboard
    if (!isLoading && user && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [user, isAdmin, isLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        setIsSubmitting(false);
        return;
      }

      // Check admin status
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', data.user.id)
        .single();
        
      if (adminError || !adminData) {
         toast.error("You are signed in, but you are not authorized as an admin.");
         await supabase.auth.signOut();
      } else {
         toast.success("Welcome back.");
         navigate('/admin');
      }

    } catch (err: any) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // If user is authenticated but wait for isAdmin to catch up
  if (user && !isAdmin && location.pathname === '/admin/login') {
     return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
         <p className="text-slate-500">Checking permissions...</p>
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
        <div className="flex justify-center mb-8">
          <div className="bg-teal-50 p-4 rounded-2xl text-teal-600">
            <Lock size={32} />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">Admin Portal</h1>
        <p className="text-center text-slate-500 mb-8">Sign in to manage the clinic.</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all"
              placeholder="admin@clinic.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              required
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-teal-600 text-white px-8 py-3.5 rounded-xl font-bold disabled:opacity-70 flex justify-center items-center hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200"
          >
            {isSubmitting ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            ) : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
