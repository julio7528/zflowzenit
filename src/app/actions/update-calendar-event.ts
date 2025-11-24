'use server';

import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

export async function updateCalendarEvent(params: {
  eventId: string;
  summary: string;
  description?: string;
  start: string;
  end: string;
  userId: string;
  accessToken: string;
}) {
  console.log('--- updateCalendarEvent called ---');
  console.log('Event ID:', params.eventId);
  console.log('New details:', { summary: params.summary, start: params.start, end: params.end });

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

  // Fetch credentials
  const { data: credentials, error } = await supabase
    .from('tbf_gcp_calendar')
    .select('clientid, secretid, refresh_token')
    .eq('userid', params.userId)
    .single();

  if (error || !credentials || !credentials.clientid || !credentials.secretid) {
    console.log('No Google Calendar credentials found or access denied.');
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
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const response = await calendar.events.patch({
      calendarId: 'primary',
      eventId: params.eventId,
      requestBody: {
        summary: params.summary,
        description: params.description,
        start: {
          dateTime: params.start,
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: params.end,
          timeZone: 'America/Sao_Paulo',
        },
      },
    });

    console.log('✅ Event updated successfully:', response.data.id);
    return { success: true, message: 'Event updated successfully' };

  } catch (err: any) {
    console.error('❌ Error updating calendar event:', err);

    if (err.code === 401) {
      return { success: false, message: 'Authentication failed' };
    } else if (err.code === 403) {
      return { success: false, message: 'Permission denied' };
    } else if (err.code === 404) {
      return { success: false, message: 'Event not found' };
    } else {
      return { success: false, message: `Failed to update event: ${err.message || 'Unknown error'}` };
    }
  }
}
