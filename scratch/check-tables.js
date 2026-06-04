import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'; // Or whatever it is, wait, I can just use a shell command to list tables? No, I can grep the codebase for `from('` to see what tables are queried.
