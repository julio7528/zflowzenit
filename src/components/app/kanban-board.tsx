'use client';

import { useBacklog } from '@/hooks/use-demands';
import type { BacklogItem, KanbanStatus, Category } from '@/lib/types';
import { Card, CardContent } from '../ui/card';
import { isPast, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Trash2, Rocket, Calendar as CalendarIcon, FilterX, Briefcase } from 'lucide-react';
import { Button } from '../ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DragEvent, useState, useMemo } from 'react';
import { Badge } from '../ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { EditBacklogItemDialog } from './edit-backlog-item-dialog';
import { PDCADialog } from './pdca-dialog';

const KANBAN_COLUMNS: { title: string; status: KanbanStatus }[] = [
  { title: 'Backlog', status: 'backlog' },
  { title: 'Analisando', status: 'analysing' },
  { title: 'Em Andamento', status: 'doing' },
  { title: 'Aguardando', status: 'waiting' },
  { title: 'Bloqueado', status: 'blocked' },
  { title: 'Concluído', status: 'done' },
];

export function KanbanBoard() {
  const { items, updateItem, deleteItem, categories } = useBacklog();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showOnlyProjects, setShowOnlyProjects] = useState(false);

  const kanbanItems = useMemo(() => {
    return items.filter(
      (item) => item.category === 'task' || item.category === 'project'
    );
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = kanbanItems;

    if (selectedCategoryId) {
      result = result.filter(item => item.categoryId === selectedCategoryId);
    }

    if (selectedDate) {
      const startDate = startOfDay(selectedDate);
      result = result.filter(item => new Date(item.createdAt) >= startDate);
    }

    if (showOnlyProjects) {
        result = result.filter(item => item.category === 'project');
    }

    return result;
  }, [kanbanItems, selectedCategoryId, selectedDate, showOnlyProjects]);

  const getItemsByStatus = (status: KanbanStatus) => {
    return filteredItems
      .filter((item) => item.status === status)
      .sort((a, b) => b.score - a.score);
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, item: BacklogItem) => {
    e.dataTransfer.setData('itemId', item.id);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, status: KanbanStatus) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('itemId');
    const itemToMove = items.find((item) => item.id === itemId);
    if (itemToMove) {
      updateItem({ ...itemToMove, status });
    }
    e.currentTarget.classList.remove('border-primary', 'border-2', 'bg-accent/20');
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-primary', 'border-2', 'bg-accent/20');
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('border-primary', 'border-2', 'bg-accent/20');
  };

  const clearFilters = () => {
    setSelectedCategoryId(null);
    setSelectedDate(null);
    setShowOnlyProjects(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold font-headline">Kamban-Geral</h1>
              <p className="text-muted-foreground">
                Visualize e gerencie o fluxo de trabalho dos seus itens.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Button 
                variant={showOnlyProjects ? 'default' : 'outline'} 
                onClick={() => setShowOnlyProjects(!showOnlyProjects)}
              >
                  <Briefcase className="mr-2 h-4 w-4" />
                  Projetos
              </Button>
              <Select onValueChange={(value) => setSelectedCategoryId(value === 'all' ? null : value)} value={selectedCategoryId || 'all'}>
                  <SelectTrigger className="w-full sm:w-[180px]">
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

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full sm:w-auto justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? new Date(selectedDate).toLocaleDateString() : <span>Data de início</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate || undefined}
                      onSelect={(date) => setSelectedDate(date || null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                {(selectedCategoryId || selectedDate || showOnlyProjects) && (
                    <Button variant="ghost" onClick={clearFilters}>
                        <FilterX className="mr-2 h-4 w-4" />
                        Limpar Filtros
                    </Button>
                )}
            </div>
        </div>
      </div>
      <div className="flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 h-full">
          {KANBAN_COLUMNS.map(({ title, status }) => (
            <div
              key={status}
              className="flex flex-col rounded-lg transition-colors"
              onDrop={(e) => handleDrop(e, status)}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                <h2 className="text-sm font-semibold uppercase text-muted-foreground">
                  {title}
                </h2>
                <span className="text-sm font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                  {getItemsByStatus(status).length}
                </span>
              </div>
              <div className="bg-muted/60 rounded-lg p-2 space-y-3 flex-grow overflow-y-auto">
                {getItemsByStatus(status).map((item) => {
                   const category = categories.find(c => c.id === item.categoryId);
                  return (
                    <KanbanCard
                        key={item.id}
                        item={item}
                        onDeleteItem={deleteItem}
                        onUpdateItem={updateItem}
                        onDragStart={(e) => handleDragStart(e, item)}
                        category={category}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KanbanCard({
  item,
  onDeleteItem,
  onUpdateItem,
  onDragStart,
  category,
}: {
  item: BacklogItem;
  onDeleteItem: (id: string) => void;
  onUpdateItem: (item: BacklogItem) => void;
  onDragStart: (e: DragEvent<HTMLDivElement>) => void;
  category?: Category;
}) {
  const isOverdue = item.deadline && isPast(item.deadline);

  const getPriorityColor = () => {
    if (item.score > 500) return 'bg-red-500';
    if (item.score > 200) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      className={cn(
        'shadow hover:shadow-md transition-shadow group relative cursor-grab active:cursor-grabbing text-sm',
        isOverdue ? 'border border-destructive' : ''
      )}
    >
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-1 rounded-t-lg',
          isOverdue ? 'bg-destructive' : getPriorityColor()
        )}
      />
      <CardContent className="p-2 pt-3">
        <p className={cn("font-medium pr-2 flex-1 mb-2", 'text-card-foreground')}>{item.activity}</p>
        <div className="flex flex-wrap gap-1 mb-2">
            {item.category === 'project' && <Badge variant='secondary'>Projeto</Badge>}
            {category && <Badge style={{ backgroundColor: category.color, color: 'white' }}>{category.name}</Badge>}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn("text-xs font-mono", 'text-muted-foreground')}>
              {Math.round(item.score)} pts
            </span>
            {item.category === 'project' && (
              <PDCADialog item={item}>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                  <Rocket className="h-4 w-4" />
                  <span className="sr-only">Executar Projeto</span>
                </Button>
              </PDCADialog>
            )}
          </div>
          <div className="flex items-center">
            <EditBacklogItemDialog item={item} onUpdateItem={onUpdateItem} />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-6 w-6 shrink-0 text-destructive hover:text-destructive")}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Excluir</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá
                    permanentemente o item.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDeleteItem(item.id)}>
                    Continuar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
