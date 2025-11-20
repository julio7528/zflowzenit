
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

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugRLS() {
  try {
    // 1. Create user
    const email = `debug_rls_${Math.floor(Math.random() * 10000)}@gmail.com`;
    const password = 'password123';
    
    console.log(`Creating user: ${email}`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
        console.error('Auth Error:', authError);
        return;
    }
    const user = authData.user;
    if (!user || !authData.session) {
        console.error('No user or session created');
        return;
    }
    console.log('User ID:', user.id);

    // Set the session explicitly for the client
    await supabase.auth.setSession({
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token
    });

    // 2. Try INSERT directly
    console.log('Attempting INSERT...');
    const { data, error } = await supabase
      .from('user_settings')
      .insert({
        user_id: user.id,
        k_factor: 24,
        b_factor: 1
      })
      .select();

    if (error) {
      console.error('INSERT Failed:', error);
    } else {
      console.log('INSERT Success:', data);
    }

  } catch (err) {
    console.error('Unexpected:', err);
  }
}

debugRLS();
