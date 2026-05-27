// Test tutor signup and class insert: run with `node scratch/test_tutor_insert.mjs`
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dzfgdbupfqgijtnziukd.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZmdkYnVwZnFnaWp0bnppdWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MTEyNDQsImV4cCI6MjA5NDA4NzI0NH0.Xn6lFxEB6L3cdm1dn7LUMRCgjyMGszreV_XFHRz38-8';

const supabase = createClient(SUPABASE_URL, ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

const email = `test_tutor_${Date.now()}@example.com`;
const password = 'TestPassword123!';

console.log('1. Signing up a new tutor user:', email);
const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: 'Test Tutor',
      role: 'tutor',
    }
  }
});

if (signUpError) {
  console.error('Signup error:', signUpError);
  process.exit(1);
}

const user = signUpData.user;
console.log('User signed up successfully. ID:', user.id);

// Since signup logic in the server actions does an upsert on profiles, but we did signUp directly via client SDK,
// the profile row might not be created automatically unless there is a DB trigger.
// Let's check if the profile row was created by querying it.
console.log('2. Checking if profile row exists...');
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();

if (profileError) {
  console.log('Profile does not exist or cannot be read. Creating it manually...');
  // We try to upsert the profile manually
  const { error: upsertError } = await supabase.from('profiles').upsert({
    id: user.id,
    full_name: 'Test Tutor',
    role: 'tutor',
    updated_at: new Date().toISOString(),
  });
  if (upsertError) {
    console.error('Failed to create profile row:', upsertError);
  } else {
    console.log('Profile row created successfully.');
  }
} else {
  console.log('Profile row exists:', profile);
}

// 3. Try to insert a class
console.log('3. Attempting to insert a class...');
const { data: classData, error: classError } = await supabase
  .from('classes')
  .insert({
    title: 'Test Live Class',
    schedule: new Date(Date.now() + 86400000).toISOString(),
    status: 'upcoming',
    imageUrl: 'https://picsum.photos/seed/test/800/600',
    tutor_id: user.id
  })
  .select();

if (classError) {
  console.error('Insert failed! Error detail:', JSON.stringify(classError, null, 2), classError);
} else {
  console.log('Insert succeeded! Class data:', classData);
}
