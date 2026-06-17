import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Supabase URL:", supabaseUrl);
    
    const { data: deadlines, error } = await supabase
        .from('student_deadlines')
        .select('*');

    if (error) {
        console.error("Error fetching deadlines:", error);
    } else {
        console.log("Deadlines returned under anon key:", deadlines?.length, deadlines);
    }

    const { data: subjects, error: subErr } = await supabase
        .from('subjects')
        .select('*');
    if (subErr) console.error(subErr);
    else console.log("Subjects:", subjects);
}
run();
