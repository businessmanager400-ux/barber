import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eerewpbithuzddcginyc.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_H6DM_tcWkAPkQod6HnqSJQ_AOCfiHAY';

export const supabase = createClient(supabaseUrl, supabaseKey);
