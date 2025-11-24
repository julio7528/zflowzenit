'use server';

import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

export async function scheduleOnCalendar(event: {
  summary: string;
  description?: string;
  start: string;
  end: string;
  userId: string;
  accessToken: string;
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${event.accessToken}`,
        },
      },
    }
  );
  
  console.log('--- scheduleOnCalendar called ---');
  console.log('Event details:', { summary: event.summary, start: event.start, end: event.end, userId: event.userId });

  // Fetch credentials
  const { data: credentials, error } = await supabase
    .from('tbf_gcp_calendar')
    .select('clientid, secretid, refresh_token')
    .eq('userid', event.userId)
    .single();

  console.log('Supabase query result:', { credentials, error });

  if (error) {
    console.error('Error fetching credentials:', error);
  }

  if (!credentials) {
      console.warn('No credentials returned from database.');
  } else {
      console.log('Credentials found (masked):', { 
          clientid: credentials.clientid ? '***' : 'missing', 
          secretid: credentials.secretid ? '***' : 'missing',
          refresh_token: credentials.refresh_token ? '***' : 'missing' 
      });
  }

  if (error || !credentials || !credentials.clientid || !credentials.secretid) {
    console.log('No Google Calendar credentials found or access denied (RLS).');
    return { success: false, message: 'Google Calendar credentials not found or access denied.' };
  }

  if (!credentials.refresh_token) {
    console.log('No refresh token found. User needs to authorize.');
    return { success: false, message: 'OAuth2 Refresh Token is missing. Please click "Connect/Authorize" in Settings.' };
  }

  const { clientid, secretid, refresh_token } = credentials;

  const oauth2Client = new google.auth.OAuth2(
    clientid,
    secretid,
    process.env.NEXT_PUBLIC_APP_URL + '/api/auth/callback/google' // Redirect URL
  );

  // Set the refresh token to allow the client to get new access tokens
  oauth2Client.setCredentials({ refresh_token });

  try {
    console.log('Attempting to create Google Calendar event...');
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const eventResponse = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: { 
          dateTime: event.start,
          timeZone: 'America/Sao_Paulo' // You can make this configurable
        },
        end: { 
          dateTime: event.end,
          timeZone: 'America/Sao_Paulo'
        },
      },
    });

    console.log('Event created successfully:', eventResponse.data.id);
    return { success: true, message: 'Event scheduled successfully!', eventId: eventResponse.data.id };

  } catch (err: any) {
    console.error('Error scheduling event:', err);
    
    // Provide more specific error messages
    if (err.code === 401) {
      return { success: false, message: 'Authentication failed. Please reconnect in Settings.' };
    } else if (err.code === 403) {
      return { success: false, message: 'Permission denied. Check your Google Calendar API permissions.' };
    } else {
      return { success: false, message: `Failed to schedule event: ${err.message || 'Unknown error'}` };
    }
  }
}
