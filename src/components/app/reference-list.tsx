'use client';

import { useSupabaseDemands } from '@/hooks/use-supabase-demands';
import { useState, useMemo } from 'react';
import type { BacklogItem } from '@/lib/types';
import { BacklogItemList } from './backlog-item-list';
import { SortSettingsDialog } from './sort-settings-dialog';

type SortOrder = 'createdAt' | 'alphabetical';

export function ReferenceList() {
  const { items, updateItem, deleteItem, categories } = useSupabaseDemands();
  const [sortBy, setSortBy] = useState<SortOrder>('createdAt');

  const referenceItems = items.filter((item) => item.category === 'reference');

  const sortedReferenceItems = useMemo(() => {
    return [...referenceItems].sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.activity.localeCompare(b.activity);
      }
      // Default to createdAt
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [referenceItems, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline">Itens de Referência</h1>
          <p className="text-muted-foreground">
            Sua lista de itens salvos para consulta futura.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SortSettingsDialog sortBy={sortBy} onSortChange={setSortBy} />
        </div>
      </div>
      <BacklogItemList
        items={sortedReferenceItems}
        onUpdateItem={updateItem}
        onDeleteItem={deleteItem}
        categories={categories}
        pageType="reference"
      />
    </div>
  );
}
