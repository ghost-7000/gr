const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkAdmin() {
    const email = 'admin@gmail.com';
    console.log(`--- Checking Status for: ${email} ---`);

    // 1. Check profiles table
    const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

    if (pError) console.error('Profile error:', pError);
    else if (profile) {
        console.log('Profile found:', profile);
        console.log(`Current Role: ${profile.role}`);
    } else {
        console.log('Profile NOT found in table.');
    }

    // 2. Check total orders count (unfiltered)
    const { count, error: cError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

    if (cError) console.error('Orders count error (possible RLS):', cError);
    else console.log('Total orders count (visible to this client):', count);
}

checkAdmin();
