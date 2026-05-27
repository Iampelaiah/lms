// Debug script: run with `node scratch/debug_classes.mjs`
// Reads the real column names and tests an insert

const SUPABASE_URL = 'https://dzfgdbupfqgijtnziukd.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZmdkYnVwZnFnaWp0bnppdWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MTEyNDQsImV4cCI6MjA5NDA4NzI0NH0.Xn6lFxEB6L3cdm1dn7LUMRCgjyMGszreV_XFHRz38-8';

const headers = {
  'apikey': ANON_KEY,
  'Authorization': `Bearer ${ANON_KEY}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// 1. Try to SELECT * from classes to get column names (may be empty due to RLS)
console.log('\n=== 1. SELECT from classes (anon) ===');
const sel = await fetch(`${SUPABASE_URL}/rest/v1/classes?limit=5`, { headers });
console.log('Status:', sel.status);
const selBody = await sel.text();
console.log('Body:', selBody);

// 2. Try a dummy INSERT with imageUrl (camelCase) to see exact error
console.log('\n=== 2. INSERT with imageUrl (camelCase) ===');
const ins1 = await fetch(`${SUPABASE_URL}/rest/v1/classes`, {
  method: 'POST',
  headers: { ...headers, 'Prefer': 'return=representation' },
  body: JSON.stringify({
    title: '__DEBUG_TEST__',
    schedule: new Date().toISOString(),
    status: 'upcoming',
    imageUrl: 'https://example.com/test.jpg',
    tutor_id: '00000000-0000-0000-0000-000000000000'
  })
});
console.log('Status:', ins1.status);
const ins1Body = await ins1.text();
console.log('Body:', ins1Body);

// 3. Try a dummy INSERT with image_url (snake_case) to see exact error
console.log('\n=== 3. INSERT with image_url (snake_case) ===');
const ins2 = await fetch(`${SUPABASE_URL}/rest/v1/classes`, {
  method: 'POST',
  headers: { ...headers, 'Prefer': 'return=representation' },
  body: JSON.stringify({
    title: '__DEBUG_TEST__',
    schedule: new Date().toISOString(),
    status: 'upcoming',
    image_url: 'https://example.com/test.jpg',
    tutor_id: '00000000-0000-0000-0000-000000000000'
  })
});
console.log('Status:', ins2.status);
const ins2Body = await ins2.text();
console.log('Body:', ins2Body);
