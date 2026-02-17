const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function listProducts() {
    const { data, error } = await supabase.from('products').select('id, code, name, image');
    if (error) {
        console.error(error);
    } else {
        console.log('Products in DB:');
        data.forEach(p => console.log(`ID: ${p.id}, Code: ${p.code}, Name: ${p.name}, Image: ${p.image}`));
    }
}

listProducts();
