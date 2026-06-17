import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // use anon key to test RLS, or service role key to bypass

const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey);

async function test() {
    const { data: deadlinesData, error: deadlinesError } = await supabase
        .from('student_deadlines')
        .select(`
            id, title, description, due_date, created_at, status,
            tutor:profiles!tutor_id(id, full_name),
            student:profiles!student_id(id, full_name),
            subject:subjects!subject_id(name)
        `);

    if (deadlinesError) {
        console.error("Error fetching student deadlines:", deadlinesError);
    } else {
        console.log("Deadlines Data:", JSON.stringify(deadlinesData, null, 2));
    }
}

test();
