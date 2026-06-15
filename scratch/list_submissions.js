const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: subs, error: se } = await supabase.from('submissions').select('id, assignment_id, student_id, status').limit(10);
  if (se) {
    console.error('Error fetching submissions:', se.message);
  } else {
    console.log('Submissions:', subs);
  }
}

main().catch(console.error);
