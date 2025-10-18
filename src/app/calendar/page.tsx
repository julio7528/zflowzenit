'use client';

import { AppLayout } from '@/components/app/app-layout';
import { CalendarContent } from '@/components/app/calendar-content';

export default function CalendarPage() {
  return (
    <AppLayout>
      <CalendarContent />
    </AppLayout>
  );
}