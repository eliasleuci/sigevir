import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = () => {
  if (!supabaseUrl || !supabaseServiceKey) return false;
  if (!supabaseUrl.startsWith('https://')) return false;
  if (supabaseUrl.includes('your_') || supabaseServiceKey.includes('your_')) return false;
  try {
    new URL(supabaseUrl);
    return true;
  } catch {
    return false;
  }
};

let supabaseAdmin = null;

if (isSupabaseConfigured()) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export { supabaseAdmin };