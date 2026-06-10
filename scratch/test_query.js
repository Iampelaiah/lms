import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: tutorModules } = await supabase.from('curriculum_modules').select('id, subjects(id, name, level)').limit(1);
  console.log("Modules:", JSON.stringify(tutorModules, null, 2));

  const { data: subs } = await supabase.from('submissions').select('*, profiles(full_name)').limit(1);
  console.log("Submissions:", JSON.stringify(subs, null, 2));
}

test();
