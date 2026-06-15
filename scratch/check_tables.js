const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const query = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public';
  `;
  // Since we don't have direct SQL execution privileges via anon key, we can try querying some tables we guess might exist
  const tables = [
    'submissions',
    'annotations',
    'student_assignments',
    'profiles',
    'subjects',
    'enrollments',
    'curriculum_assignments',
    'curriculum_items',
    'curriculum_modules'
  ];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Table ${table} error:`, error.message);
    } else {
      console.log(`Table ${table} exists! Row count:`, data.length);
    }
  }
}

main().catch(console.error);
