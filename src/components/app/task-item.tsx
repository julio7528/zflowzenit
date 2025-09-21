'use client';

import { useState } from 'react';
import type { BacklogItem, Category, KanbanStatus } from '@/lib/types';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Clock, Flame, TrendingUp, CalendarIcon, Trash2, ArrowRightCircle, Eye, Edit } from 'lucide-react';
import { PDCADialog } from './pdca-dialog';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PopoverClose } from '@radix-ui/react-popover';
import { EditBacklogItemDialog } from './edit-backlog-item-dialog';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type PageType = 'backlog' | 'reference' | 'follow-up' | 'demands' | 'in-progress';

type TaskItemProps = {
  item: BacklogItem;
  onUpdateItem: (item: BacklogItem) => void;
  onDeleteItem: (id: string) => void;
  onConvertToTask?: (id: string) => void;
  category?: Category;
  pageType?: PageType;
};

const statusTranslations: Record<KanbanStatus, string> = {
    backlog: 'Backlog',
    analysing: 'Analisando',
    doing: 'Em Andamento',
    waiting: 'Aguardando',
    blocked: 'Bloqueado',
    done: 'Concluído',
};

export function TaskItem({ item, onUpdateItem, onDeleteItem, onConvertToTask, category, pageType = 'backlog' }: TaskItemProps) {
  const [localItem, setLocalItem] = useState(item);
  const isInactiveItem = item.category === 'reference' || item.category === 'future';
  const isInProgressView = pageType === 'in-progress';


  const handleGUTChange = (type: 'gravity' | 'urgency' | 'tendency', value: number) => {
    setLocalItem((prev) => ({ ...prev, [type]: value }));
  };

  const handleSaveChanges = () => {
    onUpdateItem(localItem);
  };

  const scoreColor =
    item.score > 500 ? 'bg-red-500' : item.score > 200 ? 'bg-yellow-500' : 'bg-green-500';

  const isOverdue = item.deadline && isPast(item.deadline);
  
  return (
    <Card className={cn(isOverdue && 'border-destructive')}>
      <CardContent className="p-4 flex items-start gap-4">
       {!isInactiveItem && (
         <div className="flex flex-col items-center justify-center space-y-1">
            <div
              className={`flex items-center justify-center w-16 h-12 rounded-md text-white font-bold text-lg ${scoreColor}`}
            >
              {Math.round(item.score)}
            </div>
            <span className={cn("text-xs", 'text-muted-foreground')}>Pontos</span>
          </div>
       )}

        <div className="flex-grow">
          <p className={cn("font-medium", 'text-foreground')}>{item.activity}</p>
          <div className={cn("flex items-center gap-4 text-sm mt-2 flex-wrap", 'text-muted-foreground')}>
            {isInProgressView && <Badge variant='default'>{statusTranslations[item.status]}</Badge>}
            {item.category === 'project' ? <Badge variant='secondary'>Projeto</Badge> : <Badge variant='outline'>{item.category}</Badge>}
            {category && <Badge style={{ backgroundColor: category.color, color: 'white' }}>{category.name}</Badge>}
            {item.category === 'project' && item.startDate && item.deadline && (
              <div className={cn("flex items-center gap-1", isOverdue && 'text-destructive font-medium')}>
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {format(item.startDate, 'PP', { locale: ptBR })} - {format(item.deadline, 'PP', { locale: ptBR })}
                  {isOverdue && ` (Atrasado)`}
                </span>
              </div>
            )}
            {item.category !== 'project' && item.deadline && (
              <div className={cn("flex items-center gap-1", isOverdue && 'text-destructive font-medium')}>
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {format(item.deadline, 'PP', { locale: ptBR })} (
                  {formatDistanceToNow(item.deadline, { addSuffix: true, locale: ptBR })})
                </span>
              </div>
            )}
             {(isInactiveItem) && item.createdAt && (
              <div className="flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                <span>
                  Criado em: {format(item.createdAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {item.category === 'project' && <PDCADialog item={item} />}
          {!isInactiveItem && (
            <>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm">
                        <Flame className="h-4 w-4 mr-1" /> {item.gravity}
                        <TrendingUp className="h-4 w-4 ml-2 mr-1" /> {item.tendency}
                        <Clock className="h-4 w-4 ml-2 mr-1" /> {item.urgency}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                        <h4 className="font-medium leading-none">Ajustar GUT</h4>
                        <p className="text-sm text-muted-foreground">Ajuste os componentes de prioridade.</p>
                        </div>
                        <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="gravity">Gravidade</Label>
                            <Slider
                            id="gravity"
                            value={[localItem.gravity]}
                            onValueChange={(v) => handleGUTChange('gravity', v[0])}
                            max={10}
                            step={1}
                            className="col-span-2"
                            />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="urgency">Urgência</Label>
                            <Slider
                            id="urgency"
                            value={[localItem.urgency]}
                            onValueChange={(v) => handleGUTChange('urgency', v[0])}
                            max={10}
                            step={1}
                            className="col-span-2"
                            />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="tendency">Tendência</Label>
                            <Slider
                            id="tendency"
                            value={[localItem.tendency]}
                            onValueChange={(v) => handleGUTChange('tendency', v[0])}
                            max={10}
                            step={1}
                            className="col-span-2"
                            />
                        </div>
                        </div>
                        <PopoverClose asChild>
                        <Button onClick={handleSaveChanges}>Salvar Alterações</Button>
                        </PopoverClose>
                    </div>
                    </PopoverContent>
                </Popover>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Ver Detalhes</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{item.activity}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm text-muted-foreground">
                        {item.details || 'Este item não possui uma descrição detalhada.'}
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
                <EditBacklogItemDialog item={item} onUpdateItem={onUpdateItem} />
            </>
          )}

          {isInactiveItem && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">Ver Detalhes</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{item.activity}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground">
                    {item.details || 'Este item não possui uma descrição detalhada.'}
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className={cn("text-destructive hover:text-destructive")}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Excluir</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente o item.
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
          
          {isInactiveItem && onConvertToTask && (
             <Button variant="secondary" size="sm" onClick={() => onConvertToTask(item.id)}>
                <ArrowRightCircle className="mr-2 h-4 w-4" />
                Enviar para o Backlog
            </Button>
          )}

        </div>
      </CardContent>
    </Card>
  );
}
