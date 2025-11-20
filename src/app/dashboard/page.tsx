'use client';

import { AppLayout } from '@/components/app/app-layout';
import { DashboardContent } from '@/components/app/dashboard-content';

export default function Dashboard() {
  return (
    <AppLayout>
      <DashboardContent />
    </AppLayout>
  );
}