const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function main() {
  const { data, error } = await supabase.rpc('get_tables'); // Or try selecting from pg_class if RPC isn't available
  if (error) {
     const { data: d2, error: e2 } = await supabase.from('enrollments').select('*').limit(1);
     console.log('enrollments:', d2, e2);
  } else {
     console.log(data);
  }
}
main();
