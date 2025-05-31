import { createClient } from '@supabase/supabase-js';

// Service role client that bypasses RLS
// ONLY use this for server-side operations where you control the auth context
export const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
); 