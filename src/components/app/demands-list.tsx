'use client';

import { useSupabaseDemands } from '@/hooks/use-supabase-demands';
import { useState, useMemo } from 'react';
import type { BacklogItem } from '@/lib/types';
import { BacklogItemList } from './backlog-item-list';
import { NewBacklogItemDialog } from '@/components/app/new-backlog-item-dialog';
import { SortSettingsDialog } from './sort-settings-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '../ui/button';
import { FilterX } from 'lucide-react';

type SortOrder = 'createdAt' | 'alphabetical';

export function DemandsList() {
  const {
    items,
    addItem,
    updateItem,
    deleteItem,
    categories,
    addCategory,
    deleteCategory,
    isLoaded,
  } = useSupabaseDemands();
  const [convertingItem, setConvertingItem] = useState<BacklogItem | null>(null);
  const [sortBy, setSortBy] = useState<SortOrder>('createdAt');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const demandsItems = items.filter((item) => item.status === 'waiting');
  
  const filteredItems = useMemo(() => {
    if (!selectedCategoryId) {
      return demandsItems;
    }
    return demandsItems.filter(item => item.categoryId === selectedCategoryId);
  }, [demandsItems, selectedCategoryId]);

  const sortedDemandsItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.activity.localeCompare(b.activity);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredItems, sortBy]);

  const handleConvertToTask = (id: string) => {
    const itemToConvert = items.find((item) => item.id === id);
    if (itemToConvert) {
      setConvertingItem(itemToConvert);
    }
  };

  const handleFinishConversion = (newItem: Omit<BacklogItem, 'id' | 'score' | 'createdAt'>) => {
    if (convertingItem) {
      updateItem({ 
        ...convertingItem,
        ...newItem,
        status: 'backlog',
      });
      setConvertingItem(null);
    }
  };
  
   const handleUpdateItem = (item: BacklogItem) => {
    updateItem(item);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline">Demandas Delegadas</h1>
          <p className="text-muted-foreground">
            Itens que foram delegados e estão aguardando ação de terceiros.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select onValueChange={(value) => setSelectedCategoryId(value === 'all' ? null : value)} value={selectedCategoryId || 'all'}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCategoryId && (
              <Button variant="ghost" size="icon" onClick={() => setSelectedCategoryId(null)}>
                  <FilterX className="h-4 w-4" />
              </Button>
          )}
          <SortSettingsDialog sortBy={sortBy} onSortChange={setSortBy} />
        </div>
      </div>
      <BacklogItemList
        items={sortedDemandsItems}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={deleteItem}
        onConvertToTask={handleConvertToTask}
        categories={categories}
        pageType="demands"
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
