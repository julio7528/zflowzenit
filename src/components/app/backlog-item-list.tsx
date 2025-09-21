import type { BacklogItem, Category } from '@/lib/types';
import { TaskItem } from './task-item';

type PageType = 'backlog' | 'reference' | 'follow-up' | 'demands' | 'in-progress';

type BacklogItemListProps = {
  items: BacklogItem[];
  onUpdateItem: (item: BacklogItem) => void;
  onDeleteItem: (id: string) => void;
  onConvertToTask?: (id: string) => void;
  categories: Category[];
  pageType?: PageType;
};

export function BacklogItemList({ items, onUpdateItem, onDeleteItem, onConvertToTask, categories, pageType = 'backlog' }: BacklogItemListProps) {
  if (items.length === 0) {
    let title = "Você não tem itens no backlog";
    let message = "Clique em \"Novo Item\" para capturar o que está em sua mente.";

    if (pageType === 'reference') {
        title = "Você não tem itens de referência";
        message = "Itens salvos para consulta aparecerão aqui.";
    } else if (pageType === 'follow-up') {
        title = "Você não tem itens de follow-up";
        message = "Itens para acompanhamento futuro aparecerão aqui.";
    } else if (pageType === 'demands') {
        title = "Você não tem demandas delegadas";
        message = "Itens aguardando ação de terceiros aparecerão aqui.";
    } else if (pageType === 'in-progress') {
        title = "Nenhum item em andamento";
        message = "Tarefas movidas para 'Analisando', 'Em Andamento', 'Aguardando' ou 'Bloqueado' aparecerão aqui.";
    }

    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center">
        <h3 className="text-xl font-bold tracking-tight text-foreground">
            {title}
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          {message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const category = categories.find(c => c.id === item.categoryId);
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
        )
      })}
    </div>
  );
}
