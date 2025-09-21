'use client';

import { useSupabaseDemands } from '@/hooks/use-supabase-demands';
import { useState, useMemo } from 'react';
import type { BacklogItem } from '@/lib/types';
import { BacklogItemList } from './backlog-item-list';
import { NewBacklogItemDialog } from '@/components/app/new-backlog-item-dialog';
import { SortSettingsDialog } from './sort-settings-dialog';

type SortOrder = 'createdAt' | 'alphabetical';

export function FollowUpList() {
  const { items, addItem, updateItem, deleteItem, categories, addCategory, deleteCategory, isLoaded } = useSupabaseDemands();
  const [convertingItem, setConvertingItem] = useState<BacklogItem | null>(null);
  const [sortBy, setSortBy] = useState<SortOrder>('createdAt');

  const followUpItems = items.filter((item) => item.category === 'future');

  const sortedFollowUpItems = useMemo(() => {
    return [...followUpItems].sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.activity.localeCompare(b.activity);
      }
      // Default to createdAt
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [followUpItems, sortBy]);

  const handleConvertToTask = (id: string) => {
    const itemToConvert = items.find((item) => item.id === id);
    if (itemToConvert) {
      setConvertingItem(itemToConvert);
    }
  };

  const handleFinishConversion = (newItem: Omit<BacklogItem, 'id' | 'score' | 'createdAt'>) => {
    if (convertingItem) {
      addItem(newItem);
      deleteItem(convertingItem.id);
      setConvertingItem(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline">Itens de Follow-up</h1>
          <p className="text-muted-foreground">
            Sua lista de itens para acompanhamento futuro.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SortSettingsDialog sortBy={sortBy} onSortChange={setSortBy} />
        </div>
      </div>
      <BacklogItemList
        items={sortedFollowUpItems}
        onUpdateItem={updateItem}
        onDeleteItem={deleteItem}
        onConvertToTask={handleConvertToTask}
        categories={categories}
        pageType="follow-up"
      />
      {convertingItem && (
        <NewBacklogItemDialog
          open={!!convertingItem}
          onOpenChange={(isOpen) => !isOpen && setConvertingItem(null)}
          onAddItem={handleFinishConversion}
          defaultActivity={convertingItem.activity}
          defaultDetails={convertingItem.details}
          defaultCategoryId={convertingItem.categoryId}
          categories={categories}
          onAddCategory={addCategory}
          onDeleteCategory={deleteCategory}
        />
      )}
    </div>
  );
}
