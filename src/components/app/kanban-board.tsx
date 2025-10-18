'use client';

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
import { useSupabaseDemands } from '@/hooks/use-supabase-demands';
import type { BacklogItem, Category, KanbanStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { isPast, startOfDay } from 'date-fns';
import { Briefcase, Calendar as CalendarIcon, FilterX, Rocket, Trash2 } from 'lucide-react';
import { DragEvent, useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Card, CardContent } from '../ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
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
  const { items, updateItem, deleteItem, categories, isLoaded } = useSupabaseDemands();
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
              <h1 className="text-2xl font-bold font-headline">Kanban</h1>
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
  const isCompleted = item.status === 'done';
  const isOverdue = !isCompleted && item.deadline && isPast(item.deadline);

  const getPriorityColor = () => {
    if (item.score > 500) return 'bg-red-600 dark:bg-red-700';
    if (item.score > 200) return 'bg-yellow-600 dark:bg-yellow-700';
    return 'bg-green-600 dark:bg-green-700';
  };

  const getCategoryColor = (category: string): string => {
    switch(category) {
      case 'task': return 'bg-task';
      case 'project': return 'bg-project';
      case 'future': return 'bg-future';
      case 'reference': return 'bg-reference';
      default: return 'bg-muted';
    }
  };

  // Function to calculate text color based on background for proper contrast
  const getTextColor = (bgColor: string): string => {
    if (!bgColor) return "text-foreground"; // Default to standard text color
    
    // Remove any alpha transparency and convert to proper format
    let color = bgColor.toLowerCase();
    
    // Handle hex colors
    if (color.startsWith('#')) {
      // Convert hex to RGB
      let r = parseInt(color.substr(1, 2), 16);
      let g = parseInt(color.substr(3, 2), 16);
      let b = parseInt(color.substr(5, 2), 16);
      
      // Calculate brightness
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 150 ? "text-foreground" : "text-primary-foreground"; // Dark text on light bg, light on dark
    } 
    // Handle RGB/RGBA
    else if (color.startsWith('rgb')) {
      const match = color.match(/\d+/g);
      if (match && match.length >= 3) {
        const r = parseInt(match[0]);
        const g = parseInt(match[1]);
        const b = parseInt(match[2]);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 150 ? "text-foreground" : "text-primary-foreground";
      }
    }
    // For Tailwind classes, use default
    else {
      // If it's a standard Tailwind color class, we'll use the standard approach
      // Lighter backgrounds get dark text, darker get light text
      if (color.includes('100') || color.includes('200') || color.includes('300') || 
          color.includes('50') || color.includes('white')) {
        return "text-foreground";
      } else {
        return "text-primary-foreground";
      }
    }
    
    // Default to text-foreground if we can't determine
    return "text-foreground";
  };

  // Function to determine if background is light or dark
  const getContrastColor = (bgColor: string): string => {
    if (!bgColor) return "white";
    
    let color = bgColor.toLowerCase();
    
    // Handle hex colors
    if (color.startsWith('#')) {
      let r = parseInt(color.substr(1, 2), 16);
      let g = parseInt(color.substr(3, 2), 16);
      let b = parseInt(color.substr(5, 2), 16);
      
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 150 ? "text-foreground" : "white";
    } 
    // Handle RGB/RGBA
    else if (color.startsWith('rgb')) {
      const match = color.match(/\d+/g);
      if (match && match.length >= 3) {
        const r = parseInt(match[0]);
        const g = parseInt(match[1]);
        const b = parseInt(match[2]);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 150 ? "text-foreground" : "white";
      }
    }
    // Default for other cases
    else if (color.includes('100') || color.includes('200') || color.includes('300') || 
             color.includes('50') || color.includes('white') || color.includes('yellow') || 
             color.includes('green') || color.includes('blue')) {
      return "text-foreground";
    }
    
    return "white";
  };

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      className={cn(
        'shadow-sm hover:shadow-md transition-all duration-200 group relative cursor-grab active:cursor-grabbing border bg-card rounded-xl overflow-hidden flex flex-col',
        isCompleted ? 'border-green-500/50 bg-green-50/30' : '',
        !isCompleted && isOverdue ? 'border-destructive/50 bg-destructive/5' : 'hover:border-border/50'
      )}
    >
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-1',
          isCompleted ? 'bg-green-500' : isOverdue ? 'bg-destructive' : getPriorityColor()
        )}
      />
<CardContent className="p-4 pt-5 flex-grow flex flex-col min-h-[180px]">
  {/* Título com melhor tipografia */}
  <div className="flex items-start justify-between mb-3">
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-foreground text-base leading-tight mb-1 pr-2 line-clamp-2">
        {item.activity}
      </h3>
      {item.deadline && (
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          <CalendarIcon className="h-3 w-3" />
          {new Date(item.deadline).toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: 'short' 
          })}
        </p>
      )}
    </div>
  </div>
  
  {/* Badges com melhor design */}
  <div className="flex flex-wrap gap-2 mb-4">
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold shadow-sm bg-gray-500 text-white"
      )}
    >

      {item.category === 'project' ? 'Projeto' : item.category === 'task' ? 'Tarefa' : item.category}
    </div>
    {category && (
      <div 
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white font-semibold shadow-sm",
          getContrastColor(category.color)
        )}
        style={{ backgroundColor: category.color }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
        {category.name}
      </div>
    )}
  </div>
  
  {/* Descrição se houver */}
  {item.description && (
    <div className="mb-4 flex-grow">
      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
        {item.description}
      </p>
    </div>
  )}
  
  {/* Footer com melhor separação visual */}
  <div className="mt-auto pt-4 border-t border-border/40">
    <div className="flex items-center justify-between gap-2">
      {/* Score com design melhorado */}
      <div className="flex items-center gap-2">
        <div 
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white shadow-sm",
            getPriorityColor()
          )}
        >
          <span className="text-[10px] opacity-80">GUT</span>
          <span>{Math.round(item.score)}</span>
        </div>
        {item.category === 'project' && (
          <PDCADialog item={item}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 p-0 text-project hover:text-project hover:bg-project/10 transition-colors"
              title="Executar Projeto"
            >
              <Rocket className="h-4 w-4" />
              <span className="sr-only">Executar Projeto</span>
            </Button>
          </PDCADialog>
        )}
      </div>
      
      {/* Botões de ação com melhor agrupamento */}
      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
        <EditBacklogItemDialog item={item} onUpdateItem={onUpdateItem} />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Excluir item"
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
                permanentemente o item "{item.activity}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => onDeleteItem(item.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  </div>
</CardContent>

    </Card>
  );
}
