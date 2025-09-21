'use client';

import { useSupabaseDemands } from '@/hooks/use-supabase-demands';
import { BacklogItemList } from './demand-list';
import { NewBacklogItemDialog } from './new-demand-dialog';
import { AdaptiveUrgencyCard } from './adaptive-urgency-card';
import { SettingsDialog } from './settings-dialog';

export function Dashboard() {
  const { items, isLoaded } = useSupabaseDemands();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-headline">Caixa de Entrada de Backlog</h1>
            <p className="text-muted-foreground">
              Lista priorizada de todos os seus itens capturados.
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <SettingsDialog settings={settings} setSettings={setSettings} />
            <NewBacklogItemDialog onAddItem={addItem} />
          </div>
        </div>
        <BacklogItemList items={items} onUpdateItem={updateItem} />
      </div>
      <div className="lg:col-span-1">
        <div className="sticky top-24 space-y-6">
          <AdaptiveUrgencyCard />
        </div>
      </div>
    </div>
  );
}
