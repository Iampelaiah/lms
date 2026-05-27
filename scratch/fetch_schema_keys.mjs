const SUPABASE_URL = 'https://dzfgdbupfqgijtnziukd.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZmdkYnVwZnFnaWp0bnppdWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MTEyNDQsImV4cCI6MjA5NDA4NzI0NH0.Xn6lFxEB6L3cdm1dn7LUMRCgjyMGszreV_XFHRz38-8';

const headers = {
  'apikey': ANON_KEY,
  'Authorization': `Bearer ${ANON_KEY}`,
};

const res = await fetch(`${SUPABASE_URL}/rest/v1/`, { headers });
const data = await res.json();
console.log('Full JSON response:', JSON.stringify(data, null, 2));
