'use client';

import { AppLayout } from '@/components/app/app-layout';
import { BillingPage as BillingContent } from '@/components/app/billing-content';

export default function BillingPage() {
  return (
    <AppLayout>
      <BillingContent />
    </AppLayout>
  );
}
