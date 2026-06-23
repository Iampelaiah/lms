const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function main() {
  const { data, error } = await supabase
    .from('enrollments')
    .select('id, student_id, subject_id, status, tutor_id, profiles!student_id(id, full_name, email, avatar_url), subjects(id, name)')
    // .eq('tutor_id', 'some-tutor-id') // without tutor ID to see all
  
  if (error) console.error('Error:', error);
  else console.log('Enrollments:', JSON.stringify(data, null, 2));
}

main();
