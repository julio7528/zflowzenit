'use client';

import { AppLayout } from '@/components/app/app-layout';
import { DocumentationList } from '@/components/app/documentation-list';

export default function DocumentationPage() {
  return (
    <AppLayout>
      <DocumentationList />
    </AppLayout>
  );
}
