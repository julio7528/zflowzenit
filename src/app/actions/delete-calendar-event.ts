'use server';

import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

export async function deleteCalendarEvent(params: {
  eventId: string;
  userId: string;
  accessToken: string;
}) {
  console.log('--- deleteCalendarEvent called ---');
  console.log('Event ID:', params.eventId);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
      },
    }
  );

  // Fetch credentials and refresh_token
  const { data: credentials, error } = await supabase
    .from('tbf_gcp_calendar')
    .select('clientid, secretid, refresh_token')
    .eq('userid', params.userId)
    .single();

  console.log('Credentials fetch result:', { 
    found: !!credentials,
    hasRefreshToken: !!credentials?.refresh_token,
    error: error?.message 
  });

  if (error || !credentials || !credentials.clientid || !credentials.secretid) {
    console.log('No Google Calendar credentials found.');
    return { success: false, message: 'Calendar credentials not found' };
  }

  if (!credentials.refresh_token) {
    console.log('No refresh token found.');
    return { success: false, message: 'Not authorized with Google Calendar' };
  }

  const { clientid, secretid, refresh_token } = credentials;

  const oauth2Client = new google.auth.OAuth2(
    clientid,
    secretid,
    process.env.NEXT_PUBLIC_APP_URL + '/api/auth/callback/google'
  );

  oauth2Client.setCredentials({ refresh_token });

  try {
    console.log('Deleting Google Calendar event:', params.eventId);
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: params.eventId,
    });

    console.log('Event deleted successfully');
    return { success: true, message: 'Calendar event deleted successfully' };

  } catch (err: any) {
    console.error('Error deleting calendar event:', err);
    
    if (err.code === 401) {
      return { success: false, message: 'Authentication failed' };
    } else if (err.code === 403) {
      return { success: false, message: 'Permission denied' };
    } else if (err.code === 404) {
      // Event not found - this is OK, maybe it was already deleted
      console.log('Event not found in Google Calendar (might have been deleted manually)');
      return { success: true, message: 'Event not found (already deleted)' };
    } else {
      return { success: false, message: `Failed to delete event: ${err.message || 'Unknown error'}` };
    }
  }
}
