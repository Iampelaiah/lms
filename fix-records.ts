import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
    const { data, error } = await supabase
        .from('student_deadlines')
        .update({ status: 'pending_admin_review' })
        .eq('status', 'pending')
        .select();

    if (error) {
        console.error("Error updating:", error);
    } else {
        console.log("Updated records:", data?.length);
    }
}

fix();
