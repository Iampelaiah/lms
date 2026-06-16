const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Actually we need service_role, let's just log process.env.SUPABASE_SERVICE_ROLE_KEY to see if it exists
);

async function main() {
  const sr = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!sr) {
     console.log('No service role key! Trying to authenticate...');
  } else {
     const adminSupa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, sr);
     const { data } = await adminSupa.from('enrollments').select('*');
     console.log('Enrollments with sr:', data);
  }
}
main();
