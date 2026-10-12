import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const schluessel = import.meta.env.PUBLIC_SUPABASE_KEY;

if (!url || !schluessel) {
  throw new Error('PUBLIC_SUPABASE_URL und PUBLIC_SUPABASE_KEY fehlen in .env');
}

export const supabase = createClient(url, schluessel);
