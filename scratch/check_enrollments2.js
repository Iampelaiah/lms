const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function main() {
  const { data: enrollments, error } = await supabase.from('enrollments').select('*');
  console.log('Enrollments:', enrollments);
  
  const { data: profiles, error2 } = await supabase.from('profiles').select('id, full_name, role');
  console.log('Profiles:', profiles);
}
main();
