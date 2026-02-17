const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
// If .env.local doesn't exist, try .env
const finalPath = fs.existsSync(envPath) ? envPath : path.resolve(__dirname, '../.env');

if (!fs.existsSync(finalPath)) {
    console.error('No .env.local or .env file found');
    process.exit(1);
}

const envContent = fs.readFileSync(finalPath, 'utf8');
const env = {};

envContent.split('\n').forEach(line => {
    // Basic parser
    const match = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
        }
        env[match[1]] = value;
    }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('Missing Supabase URL or Key in env file');
    process.exit(1);
}

console.log('Testing connection to:', url);

const supabase = createClient(url, key);

async function testConnection() {
    try {
        const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true });
        if (error) {
            console.error('Supabase Connection Error:', error.message);
            console.error('Details:', error);
        } else {
            console.log('✅ Connection to Supabase successful!');
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testConnection();
