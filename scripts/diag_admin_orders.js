const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkOrders() {
    console.log('--- Checking Orders for Admin ---');

    // 1. Check total count
    const { count, error: countError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('Count error:', countError);
    } else {
        console.log('Total orders in DB:', count);
    }

    // 2. Fetch a few orders to see fields
    const { data, error: selectError } = await supabase
        .from('orders')
        .select('*')
        .limit(5);

    if (selectError) {
        console.error('Select error:', selectError);
    } else {
        console.log(`Successfully fetched ${data.length} orders.`);
        if (data.length > 0) {
            console.log('Fields available:', Object.keys(data[0]));
            data.forEach(o => {
                console.log(`ID: ${o.id}, FullName: ${o.full_name}, Total: ${o.total}, TotalPrice: ${o.total_price}, Status: ${o.status}`);
            });
        }
    }

    // 3. Check RLS policies if possible (via direct SQL if we had access, but we can't here)
    // But we can check if we are allowed to select
}

checkOrders();
