import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').replace(/['"]/g, '').replace(/[^\x00-\x7F]/g, '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').replace(/['"]/g, '').replace(/[^\x00-\x7F]/g, '').trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn('Supabase URL or Anon Key is missing. Ensure they are set in environment variables.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
