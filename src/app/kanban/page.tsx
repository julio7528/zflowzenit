'use client';

import { KanbanBoard } from '@/components/app/kanban-board';
import { AppLayout } from '@/components/app/app-layout';

export default function KanbanPage() {
  return (
    <AppLayout>
      <KanbanBoard />
    </AppLayout>
  );
}
