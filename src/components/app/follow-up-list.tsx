'use client';

import { useSupabaseDemands } from '@/hooks/use-supabase-demands';
import { useState, useMemo } from 'react';
import type { BacklogItem } from '@/lib/types';
import { BacklogItemList } from './backlog-item-list';
import { SortSettingsDialog } from './sort-settings-dialog';
import { NewBacklogItemDialog } from './new-demand-dialog';

type SortOrder = 'createdAt' | 'alphabetical';

export function FollowUpList() {
  const { items, updateItem, deleteItem, categories, addItem } = useSupabaseDemands();
  const [sortBy, setSortBy] = useState<SortOrder>('createdAt');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [prefilledData, setPrefilledData] = useState<{
    activity: string;
    details?: string;
    categoryId?: string | null;
  } | null>(null);

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

  const handleConvertToBacklog = async (itemId: string) => {
    const itemToConvert = items.find(item => item.id === itemId);
    if (!itemToConvert) return;

    // Pre-fill dialog data
    setPrefilledData({
      activity: itemToConvert.activity,
      details: itemToConvert.details,
      categoryId: itemToConvert.categoryId,
    });

    // Delete the follow-up item
    await deleteItem(itemId);

    // Open the dialog
    setIsDialogOpen(true);
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
        onConvertToTask={handleConvertToBacklog}
        categories={categories}
        pageType="follow-up"
      />
      
      <NewBacklogItemDialog
        onAddItem={addItem}
        categories={categories}
        onAddCategory={async () => null}
        onDeleteCategory={async () => {}}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        hideTrigger={true}
        defaultActivity={prefilledData?.activity}
        defaultDetails={prefilledData?.details}
        defaultCategoryId={prefilledData?.categoryId}
      />
    </div>
  );
}
