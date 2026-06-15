import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkColumns() {
  const { data, error } = await supabase.rpc('test_query', { query: "SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles';" });
  if (error) {
    console.error('Error with RPC:', error.message);
    
    // Try a direct select
    const { data: profile, error: pErr } = await supabase.from('profiles').select('curriculum_board').limit(1);
    if (pErr) {
        console.error('Direct select error:', pErr.message);
    } else {
        console.log('Direct select succeeded, column exists!');
    }
  } else {
    console.log('Columns:', data);
  }
}

checkColumns();
