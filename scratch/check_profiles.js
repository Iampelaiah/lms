import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Assuming you have a .env.local with SUPABASE_URL and SUPABASE_ANON_KEY
const envPath = path.resolve('.env.local');
const envFile = fs.readFileSync(envPath, 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.trim();
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkSchema() {
  const { data: profileColumns, error } = await supabase.rpc('get_table_columns', { table_name: 'profiles' });
  
  if (error) {
    console.log("Could not get columns via RPC, fetching a single profile instead...");
    const { data, error: fetchError } = await supabase.from('profiles').select('*').limit(1);
    console.log("Profiles:", data);
  } else {
    console.log("Profile columns:", profileColumns);
  }
  
  const { data: subjects, error: subjErr } = await supabase.from('subjects').select('*').limit(1);
  console.log("Subjects:", subjects);
}

checkSchema();
