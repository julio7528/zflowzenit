'use client';

import { Backlog } from '@/components/app/backlog';
import { AppLayout } from '@/components/app/app-layout';

export default function Dashboard() {
  return (
    <AppLayout>
      <Backlog />
    </AppLayout>
  );
}