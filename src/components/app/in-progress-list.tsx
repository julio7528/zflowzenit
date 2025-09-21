'use client';

import { useSupabaseDemands } from '@/hooks/use-supabase-demands';
import { BacklogItemList } from './backlog-item-list';
import type { BacklogItem, KanbanStatus } from '@/lib/types';
import { useState, useMemo, useCallback } from 'react';
import { SettingsDialog } from './settings-dialog';
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
const IN_PROGRESS_STATUSES: KanbanStatus[] = ['analysing', 'doing', 'waiting', 'blocked'];

const statusTranslations: Record<KanbanStatus, string> = {
    backlog: 'Backlog',
    analysing: 'Analisando',
    doing: 'Em Andamento',
    waiting: 'Aguardando',
    blocked: 'Bloqueado',
    done: 'Concluído',
};

export function InProgressList() {
  const { items, updateItem, deleteItem, categories, settings, setSettings, isLoaded } = useSupabaseDemands();
  const [sortOption, setSortOption] = useState<SortKey>('score_desc');
  const [statusFilter, setStatusFilter] = useState<KanbanStatus | 'all'>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const inProgressItems = useMemo(() => {
    return items.filter(item => IN_PROGRESS_STATUSES.includes(item.status));
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = inProgressItems;
    if (statusFilter !== 'all') {
      result = result.filter(item => item.status === statusFilter);
    }
    if (selectedCategoryId) {
      result = result.filter(item => item.categoryId === selectedCategoryId);
    }
    return result;
  }, [inProgressItems, statusFilter, selectedCategoryId]);

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
  
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort(sortFunctions[sortOption]);
  }, [filteredItems, sortOption]);
  
  const handleSortChange = useCallback((key: SortKey) => {
    setSortOption(key);
  }, []);
  
  const clearFilters = () => {
    setStatusFilter('all');
    setSelectedCategoryId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline">Itens em Andamento</h1>
          <p className="text-muted-foreground">
            Lista priorizada de todos os itens em execução.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Select onValueChange={(value: KanbanStatus | 'all') => setStatusFilter(value)} value={statusFilter}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    {IN_PROGRESS_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>
                        {statusTranslations[status]}
                    </SelectItem>
                    ))}
                </SelectContent>
            </Select>
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
            {(statusFilter !== 'all' || selectedCategoryId) && (
                <Button variant="ghost" size="icon" onClick={clearFilters}>
                    <FilterX className="h-4 w-4" />
                </Button>
            )}
            <SettingsDialog settings={settings} setSettings={setSettings} onSortChange={handleSortChange} currentSort={sortOption} />
        </div>
      </div>
      <BacklogItemList 
        items={sortedItems} 
        onUpdateItem={updateItem} 
        onDeleteItem={deleteItem} 
        categories={categories} 
        pageType="in-progress" 
      />
    </div>
  );
}
