
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Missing environment variables.');
  process.exit(1);
}

console.log('Initializing Supabase Client...');
// Explicitly pass the global fetch
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // Disable persistence for this test
  },
  global: {
    fetch: (...args) => {
        console.log('Supabase Fetching:', args[0]);
        return fetch(...args);
    }
  }
});

async function testConnection() {
  try {
    console.log('Testing connection...');
    const { data, error } = await supabase.from('backlog_items').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('Supabase Error:', error);
    } else {
      console.log('Connection successful!');
    }
  } catch (err) {
    console.error('Unexpected Error:', err);
  }
}

testConnection();
