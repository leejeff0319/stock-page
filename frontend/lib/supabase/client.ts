import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './config';

const { supabaseUrl, supabaseKey } = getSupabaseConfig();

export const supabase = createClient(supabaseUrl, supabaseKey);