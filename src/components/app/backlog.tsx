'use client';

import { useSupabaseDemands } from '@/hooks/use-supabase-demands';
import { BacklogItemList } from './backlog-item-list';
import { NewBacklogItemDialog } from '@/components/app/new-backlog-item-dialog';
import { SettingsDialog } from './settings-dialog';
import type { BacklogItem } from '@/lib/types';
import { useState, useMemo, useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '../ui/button';
import { FilterX } from 'lucide-react';

type SortKey = 'score_desc' | 'score_asc' | 'deadline_asc' | 'deadline_desc';

export function Backlog() {
  const {
    items,
    addItem,
    updateItem,
    deleteItem,
    settings,
    setSettings,
    categories,
    addCategory,
    deleteCategory,
    isLoaded,
  } = useSupabaseDemands();
  const [sortOption, setSortOption] = useState<SortKey>('score_desc');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const backlogItems = items.filter(
    (item) =>
      item.status === 'backlog' && (item.category === 'task' || item.category === 'project')
  );
  
  const filteredItems = useMemo(() => {
    if (!selectedCategoryId) {
      return backlogItems;
    }
    return backlogItems.filter(item => item.categoryId === selectedCategoryId);
  }, [backlogItems, selectedCategoryId]);

  const sortFunctions: Record<SortKey, (a: BacklogItem, b: BacklogItem) => number> = {
    'score_desc': (a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline.getTime() - b.deadline.getTime();
    },
    'score_asc': (a, b) => {
      if (a.score !== b.score) {
        return a.score - b.score;
      }
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline.getTime() - b.deadline.getTime();
    },
    'deadline_asc': (a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline.getTime() - b.deadline.getTime();
    },
    'deadline_desc': (a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return b.deadline.getTime() - a.deadline.getTime();
    }
  };
  
  const sortedBacklogItems = useMemo(() => {
    return [...filteredItems].sort(sortFunctions[sortOption]);
  }, [filteredItems, sortOption]);
  
  const handleSortChange = useCallback((key: SortKey) => {
    setSortOption(key);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline">Caixa de Entrada de Backlog</h1>
          <p className="text-muted-foreground">
            Lista priorizada de todos os seus itens capturados e não iniciados.
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
          <SettingsDialog settings={settings} setSettings={setSettings} onSortChange={handleSortChange} currentSort={sortOption} />
          <NewBacklogItemDialog 
            onAddItem={addItem} 
            categories={categories}
            onAddCategory={addCategory}
            onDeleteCategory={deleteCategory}
          />
        </div>
      </div>
      <BacklogItemList items={sortedBacklogItems} onUpdateItem={updateItem} onDeleteItem={deleteItem} categories={categories} pageType="backlog" />
    </div>
  );
}
