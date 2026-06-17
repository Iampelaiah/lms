require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  console.log('Attempting to create chat_media bucket...');
  const { data, error } = await supabase.storage.createBucket('chat_media', {
    public: true
  });
  if (error) {
    console.error('Error creating bucket:', error);
  } else {
    console.log('Bucket created:', data);
  }
}

check();
