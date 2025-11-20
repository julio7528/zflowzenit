
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

async function testUserSettingsFlow() {
  try {
    // 1. Sign up a temporary user
    const email = `testuser${Math.floor(Math.random() * 10000)}@gmail.com`;
    const password = 'password123';
    
    console.log(`Creating test user: ${email}`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error('Auth Error:', authError);
      return;
    }

    const user = authData.user;
    if (!user) {
      console.error('No user created');
      return;
    }
    console.log('User created:', user.id);

    // 2. Try to select settings (should fail with "Row not found")
    console.log('Attempting to select settings...');
    const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (settingsError) {
        console.log('Select Error (Expected if row missing):');
        console.log('Code:', settingsError.code);
        console.log('Message:', settingsError.message);
        console.log('Details:', settingsError.details);
    } else {
        console.log('Settings found (Unexpected for new user):', settingsData);
    }

    // 3. Try to insert settings
    console.log('Attempting to insert default settings...');
    const { data: insertData, error: insertError } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            k_factor: 24,
            b_factor: 1,
          })
          .select();
    
    if (insertError) {
        console.error('Insert Error:');
        console.error('Code:', insertError.code);
        console.error('Message:', insertError.message);
        console.error('Details:', insertError.details);
        console.error('Hint:', insertError.hint);
    } else {
        console.log('Insert Successful:', insertData);
    }

    // Cleanup (optional, but good practice if we could delete the user, but we can't easily with anon key usually)
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testUserSettingsFlow();
