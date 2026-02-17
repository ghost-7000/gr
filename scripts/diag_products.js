
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://crxudvjdygxpzdynwumq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyeHVkdmpkeWd4cHpkeW53dW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MjQ2MDgsImV4cCI6MjA4NjUwMDYwOH0.uzZyvdclDTQHV1GWyAhf_lQimW2yxkq1j68f-2NuHCU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
    console.log('Checking Products Table...');
    const { data, error } = await supabase
        .from('products')
        .select('id, name, code, image, category');

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    console.log('Total Products:', data.length);
    console.log('Product categories and counts:');
    const categories = data.reduce((acc, p) => {
        acc[p.category || 'No Category'] = (acc[p.category || 'No Category'] || 0) + 1;
        return acc;
    }, {});
    console.log(categories);

    console.log('First 5 Products:');
    console.log(data.slice(0, 5).map(p => ({ id: p.id, name: p.name, category: p.category })));
}

checkProducts();
