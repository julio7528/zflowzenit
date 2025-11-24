import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const userId = requestUrl.searchParams.get('state'); // We passed userId as state
  const error = requestUrl.searchParams.get('error');

  console.log('--- Google OAuth Callback ---');
  console.log('Code:', code ? 'received' : 'missing');
  console.log('UserId:', userId);
  console.log('Error:', error);

  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=google_auth_error`);
  }

  if (!code || !userId) {
    console.error('Missing code or userId in callback');
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=missing_params`);
  }

  // Use Service Role Key to bypass RLS for this server-side operation
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // This bypasses RLS
  );

  console.log('Fetching credentials for userId:', userId);

  // 1. Fetch Client ID and Secret again to exchange code
  const { data: credentials, error: dbError } = await supabase
    .from('tbf_gcp_calendar')
    .select('clientid, secretid')
    .eq('userid', userId)
    .maybeSingle(); // Use maybeSingle instead of single to avoid error on 0 rows

  console.log('Credentials fetch result:', { 
    found: !!credentials, 
    error: dbError?.message,
    credentials: credentials ? { hasClientId: !!credentials.clientid, hasSecretId: !!credentials.secretid } : null
  });

  if (dbError || !credentials) {
    console.error('Failed to fetch credentials:', dbError);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=credentials_not_found`);
  }

  const { clientid, secretid } = credentials;

  const oauth2Client = new google.auth.OAuth2(
    clientid,
    secretid,
    process.env.NEXT_PUBLIC_APP_URL + '/api/auth/callback/google'
  );

  try {
    console.log('Exchanging code for tokens...');
    
    // 2. Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    console.log('Tokens received:', { 
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token 
    });

    if (!tokens.refresh_token) {
        console.warn('No refresh token returned. User might have already authorized.');
    }

    // 3. Store refresh token (and potentially access token, though it expires)
    if (tokens.refresh_token) {
        const { error: updateError } = await supabase
            .from('tbf_gcp_calendar')
            .update({ refresh_token: tokens.refresh_token })
            .eq('userid', userId);

        if (updateError) {
            console.error('Error updating refresh token:', updateError);
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=db_update_failed`);
        }
        
        console.log('Refresh token saved successfully');
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?success=google_connected`);

  } catch (err: any) {
    console.error('Error exchanging token:', err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=token_exchange_failed`);
  }
}
