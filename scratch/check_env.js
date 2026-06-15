console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Defined' : 'Undefined');
console.log('Keys in process.env:', Object.keys(process.env).filter(k => k.includes('KEY') || k.includes('SUPABASE') || k.includes('PASSWORD') || k.includes('SECRET')));
