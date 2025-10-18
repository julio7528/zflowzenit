import type { BacklogItem, Category } from '@/lib/types';
import { TaskItem } from './task-item';

type BacklogItemListProps = {
  items: BacklogItem[];
  onUpdateItem: (item: BacklogItem) => void;
  onDeleteItem: (id: string) => void;
  onConvertToTask?: (id: string) => void;
  categories?: Category[];
  pageType?: 'backlog' | 'reference' | 'follow-up' | 'demands' | 'in-progress';
};

export function BacklogItemList({ items, onUpdateItem, onDeleteItem, onConvertToTask, categories = [], pageType = 'demands' }: BacklogItemListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card p-12 text-center shadow-sm">
        <div className="mx-auto max-w-sm">
          <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">Você não tem itens no backlog</h3>
          <p className="text-sm text-muted-foreground">
            Clique em "Novo Item" para capturar o que está em sua mente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const category = categories.find(cat => cat.id === item.categoryId);
        return (
          <TaskItem 
            key={item.id} 
            item={item} 
            onUpdateItem={onUpdateItem}
            onDeleteItem={onDeleteItem}
            onConvertToTask={onConvertToTask}
            category={category}
            pageType={pageType}
          />
        );
      })}
    </div>
  );
}
