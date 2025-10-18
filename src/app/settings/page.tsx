'use client';

import { AppLayout } from '@/components/app/app-layout';
import { SettingsPage as SettingsContent } from '@/components/app/settings-content';

export default function SettingsPage() {
  return (
    <AppLayout>
      <SettingsContent />
    </AppLayout>
  );
}
