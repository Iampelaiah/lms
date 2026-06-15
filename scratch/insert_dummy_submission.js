const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const dummySubId = '00000000-0000-0000-0000-000000000009';
  const realStudentId = '5f8d965a-e1de-415a-b240-245127a162f7';
  
  // 1. Try to insert with overall_grade as 'A' and component_scores
  console.log("Test 1: Trying to insert overall_grade='A' and component_scores...");
  const { data: d1, error: e1 } = await supabase.from('submissions').insert({
    id: dummySubId,
    assignment_id: '00000000-0000-0000-0000-000000000001',
    student_id: realStudentId,
    raw_text: 'test raw text content',
    overall_grade: 'A',
    status: 'submitted',
    component_scores: { contentMark: 1 }
  });
  if (e1) {
    console.log('Test 1 error message:', e1.message);
    console.log('Test 1 error details:', JSON.stringify(e1, null, 2));
  } else {
    console.log('Test 1 succeeded!');
    await supabase.from('submissions').delete().eq('id', dummySubId);
  }

  // 2. Try to insert with overall_grade as a numeric (e.g. 25) without component_scores
  console.log("\nTest 2: Trying to insert overall_grade=25 without component_scores...");
  const { data: d2, error: e2 } = await supabase.from('submissions').insert({
    id: dummySubId,
    assignment_id: '00000000-0000-0000-0000-000000000001',
    student_id: realStudentId,
    raw_text: 'test raw text content',
    overall_grade: 25,
    status: 'submitted'
  });
  if (e2) {
    console.log('Test 2 error message:', e2.message);
    console.log('Test 2 error details:', JSON.stringify(e2, null, 2));
  } else {
    console.log('Test 2 succeeded!');
    await supabase.from('submissions').delete().eq('id', dummySubId);
  }
}

main().catch(console.error);
