import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Stethoscope, UserCircle, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClientAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in
    if (!isLoading && user) {
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/my-appointments', { replace: true });
      }
    }
  }, [user, isAdmin, isLoading, navigate]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Send a password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset instructions sent to your email!");
      setIsForgotPassword(false);
    } catch (err: any) {
      if (err.message && err.message.includes('rate_limit')) {
        toast.error("Too many attempts. Please wait a while before trying again.", { duration: 5000 });
      } else if (err.message && err.message.includes('Error sending confirmation email')) {
        toast.error("Email rate limit exceeded (3 per hour on free tier) or invalid email. Please try again later.", { duration: 6000 });
      } else {
        toast.error(err.message || "An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate('/my-appointments');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (error) throw error;
        
        if (data.user && data.session === null) {
          setIsVerificationSent(true);
        } else {
          toast.success("Account created successfully! You are now logged in.");
          navigate('/my-appointments');
        }
      }
    } catch (err: any) {
      if (err.message && err.message.includes('rate_limit')) {
        toast.error("Too many attempts. Please wait a while before trying again.", { duration: 5000 });
      } else if (err.message && err.message.includes('Error sending confirmation email')) {
        toast.error("Email rate limit exceeded (3 per hour on free tier) or invalid email. Please try again later.", { duration: 6000 });
      } else {
        toast.error(err.message || "An unexpected error occurred.");
      }
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

  if (isForgotPassword) {
    return (
      <div className="min-h-[80vh] bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
          <div className="flex justify-center mb-6">
            <div className="bg-teal-50 p-4 rounded-2xl text-teal-600">
              <Mail size={32} />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">
            Reset Password
          </h1>
          <p className="text-center text-slate-500 mb-8">
            Enter your email address and we'll send you instructions to reset your password.
          </p>

          <form onSubmit={handleForgotPassword} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input 
                required
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all"
                placeholder="jane@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-teal-600 text-white px-8 py-3.5 rounded-xl font-bold disabled:opacity-70 flex justify-center items-center hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200 mt-2"
            >
              {isSubmitting ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : 'Send Reset Link'}
            </button>
            
            <button
              type="button"
              onClick={() => setIsForgotPassword(false)}
              className="w-full text-slate-500 hover:text-slate-800 text-sm font-medium py-3"
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (isVerificationSent) {
    return (
      <div className="min-h-[80vh] bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-teal-50 p-4 rounded-2xl text-teal-600">
              <Mail size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Check Your Email</h1>
          <p className="text-slate-500 mb-8">
            We've sent a verification link to <span className="font-semibold text-slate-700">{email}</span>. 
            Please check your inbox and confirm your email address to active your account.
          </p>
          <button
            onClick={() => {
              setIsVerificationSent(false);
              setIsLogin(true);
            }}
            className="w-full bg-teal-600 text-white px-8 py-3.5 rounded-xl font-bold flex justify-center items-center hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
        <div className="flex justify-center mb-6">
          <div className="bg-teal-50 p-4 rounded-2xl text-teal-600">
            <UserCircle size={32} />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">
          {isLogin ? 'Patient Login' : 'Create an Account'}
        </h1>
        <p className="text-center text-slate-500 mb-8">
          {isLogin ? 'Sign in to view and manage your appointments.' : 'Sign up to track your clinic visits.'}
        </p>

        <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${isLogin ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setIsLogin(true)}
          >
            Sign In
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${!isLogin ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input 
                required
                type="text" 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all"
                placeholder="Jane Doe"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition-all"
              placeholder="jane@example.com"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              {isLogin && (
                <button 
                  type="button" 
                  onClick={() => setIsForgotPassword(true)}
                  className="text-sm font-medium text-teal-600 hover:text-teal-700"
                >
                  Forgot Password?
                </button>
              )}
            </div>
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
            ) : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
