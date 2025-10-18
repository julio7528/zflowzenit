'use client';

import { AppLayout } from '@/components/app/app-layout';
import { InProgressList } from '@/components/app/in-progress-list';

export default function InProgressPage() {
  return (
    <AppLayout>
      <InProgressList />
    </AppLayout>
  );
}
