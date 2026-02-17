const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkOrdersSchema() {
    console.log('Checking Orders Table Schema...');
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching orders:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Sample Order Columns:', Object.keys(data[0]));
        console.log('Sample Order Data:', data[0]);
    } else {
        console.log('No orders found to check columns.');
        // Check table definition if no data
        const { data: cols, error: colError } = await supabase.rpc('get_table_columns', { table_name: 'orders' });
        if (cols) console.log('Columns from RPC:', cols);
        else console.log('Columns check failed or no orders present.');
    }
}

checkOrdersSchema();
