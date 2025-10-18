'use client';

import { AppLayout } from '@/components/app/app-layout';
import { ProfilePage as ProfileContent } from '@/components/app/profile-content';

export default function ProfilePage() {
  return (
    <AppLayout>
      <ProfileContent />
    </AppLayout>
  );
}
