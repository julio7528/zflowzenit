'use client';

import { useSupabaseDemands } from '@/hooks/use-supabase-demands';
import { BacklogItemList } from './demand-list';
import { NewBacklogItemDialog } from './new-demand-dialog';
import { AdaptiveUrgencyCard } from './adaptive-urgency-card';
import { SettingsDialog } from './settings-dialog';
import { useState } from 'react';

type SortKey = 'score_desc' | 'score_asc' | 'deadline_asc' | 'deadline_desc';

export function Dashboard() {
  const { items, addItem, updateItem, deleteItem, categories, settings, setSettings, isLoaded } = useSupabaseDemands();
  const [currentSort, setCurrentSort] = useState<SortKey>('score_desc');

  const handleSortChange = (key: SortKey) => {
    setCurrentSort(key);
  };

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
            <SettingsDialog 
              settings={settings} 
              setSettings={setSettings} 
              onSortChange={handleSortChange}
              currentSort={currentSort}
            />
            <NewBacklogItemDialog onAddItem={addItem} />
          </div>
        </div>
        <BacklogItemList 
          items={items} 
          onUpdateItem={updateItem} 
          onDeleteItem={deleteItem}
          categories={categories}
          pageType="demands"
        />
      </div>
      <div className="lg:col-span-1">
        <div className="sticky top-24 space-y-6">
          <AdaptiveUrgencyCard />
        </div>
      </div>
    </div>
  );
}
