'use client';

import { DemandsList } from '@/components/app/demands-list';
import { AppLayout } from '@/components/app/app-layout';

export default function DemandsPage() {
  return (
    <AppLayout>
      <DemandsList />
    </AppLayout>
  );
}
