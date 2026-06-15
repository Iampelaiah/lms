import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env.local');
const envFile = fs.readFileSync(envPath, 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length > 0) {
    let value = rest.join('=').trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[key.trim()] = value;
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testUpdate() {
  const { data, error } = await supabase
      .from('profiles')
      .update({ curriculum_board: 'Cambridge', student_level: 'O-Level' })
      .eq('id', '00000000-0000-0000-0000-000000000000') // Fake ID to test schema
      .select();
  
  console.log("Error:", error);
  console.log("Data:", data);
}

testUpdate();
