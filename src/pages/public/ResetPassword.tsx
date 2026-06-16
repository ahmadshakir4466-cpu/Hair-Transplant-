import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's an access token in the URL or if the user is already authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Supabase's JS library automatically grabs the token from the #URL hash
      // But we just verify the session is active before allowing password update
      if (!session) {
        // Only show error if we are perfectly sure there's no hash access token being processed
        if (!window.location.hash.includes('access_token')) {
          toast.error('Invalid or expired password reset link');
          navigate('/client-auth');
        }
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event == "PASSWORD_RECOVERY") {
        console.log("PASSWORD_RECOVERY EVENT");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) throw error;
      
      toast.success("Password updated successfully!");
      navigate('/client-auth');
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
        <div className="flex justify-center mb-6">
          <div className="bg-teal-50 p-4 rounded-2xl text-teal-600">
            <KeyRound size={32} />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">
          Set New Password
        </h1>
        <p className="text-center text-slate-500 mb-8">
          Please enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
            <input 
              required
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-teal-600 text-white px-8 py-3.5 rounded-xl font-bold disabled:opacity-70 flex justify-center items-center hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200 mt-2"
          >
            {isSubmitting ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            ) : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
