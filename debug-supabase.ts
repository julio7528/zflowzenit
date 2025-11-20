
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Checking Supabase Configuration...');
console.log('URL:', supabaseUrl); 
console.log('Key Length:', supabaseAnonKey ? supabaseAnonKey.length : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Missing environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Try a simple request that doesn't require auth if possible, or just check health
    // accessing a non-existent table usually returns a specific error if connected, 
    // or 'fetch failed' if not connected.
    const { data, error } = await supabase.from('user_settings').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('Supabase Error (this means we reached the server):', error.message);
      console.log('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('Connection successful!');
    }
  } catch (err) {
    console.error('Network/Client Error:', err);
  }
}

testConnection();
