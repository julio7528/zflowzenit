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
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center">
        <h3 className="text-xl font-bold tracking-tight text-foreground">Você não tem itens no backlog</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Clique em "Novo Item" para capturar o que está em sua mente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
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
