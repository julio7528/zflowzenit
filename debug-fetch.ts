
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing raw fetch to:', supabaseUrl);

async function testFetch() {
  if (!supabaseUrl) {
    console.error('No Supabase URL found');
    return;
  }

  try {
    const url = `${supabaseUrl}/rest/v1/`;
    console.log(`Fetching ${url}...`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey || '',
        'Authorization': `Bearer ${supabaseAnonKey || ''}`
      }
    });

    console.log('Response status:', response.status);
    console.log('Response text:', await response.text());
  } catch (error) {
    console.error('Fetch failed:', error);
    if (error instanceof Error) {
        console.error('Cause:', error.cause);
    }
  }
}

testFetch();
