'use server';

import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import { redirect } from 'next/navigation';

export async function initiateGoogleAuth(userId: string, accessToken: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );

  // Fetch credentials
  const { data: credentials, error } = await supabase
    .from('tbf_gcp_calendar')
    .select('clientid, secretid')
    .eq('userid', userId)
    .single();

  if (error || !credentials || !credentials.clientid || !credentials.secretid) {
    throw new Error('Credentials not found');
  }

  const { clientid, secretid } = credentials;

  const oauth2Client = new google.auth.OAuth2(
    clientid,
    secretid,
    process.env.NEXT_PUBLIC_APP_URL + '/api/auth/callback/google'
  );

  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Crucial for getting a refresh token
    scope: scopes,
    prompt: 'consent', // Force consent to ensure we get a refresh token
    state: userId, // Pass userId as state to identify who this is for in the callback
  });

  redirect(url);
}
