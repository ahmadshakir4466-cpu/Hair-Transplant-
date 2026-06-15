import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

type AuthContextType = {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const checkUser = async () => {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        await handleSession(session);
      } catch (err: any) {
        console.error('Error fetching session:', err);
        setIsLoading(false);
      }
    };

    checkUser();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await handleSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSession = async (session: Session | null) => {
    if (session?.user) {
      setUser(session.user);
      await checkAdminStatus(session.user.id);
    } else {
      setUser(null);
      setIsAdmin(false);
      setIsLoading(false);
    }
  };

  const checkAdminStatus = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking admin status:', error);
      }

      setIsAdmin(!!data);
    } catch (err) {
      console.error('Admin verification failed.', err);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
