import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  // Test forum_posts
  const { data: posts, error: pe } = await supabase.from('forum_posts').select('*').limit(1);
  console.log('forum_posts query error:', pe?.message || 'None');
  console.log('forum_posts columns:', posts && posts[0] ? Object.keys(posts[0]) : 'No rows');

  // Test forum_comments
  const { data: comments, error: ce } = await supabase.from('forum_comments').select('*').limit(1);
  console.log('forum_comments query error:', ce?.message || 'None');
  console.log('forum_comments columns:', comments && comments[0] ? Object.keys(comments[0]) : 'No rows');
}

main().catch(console.error);
